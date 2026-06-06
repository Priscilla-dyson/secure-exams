import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'
import { logActivity, extractRequestInfo } from '@/lib/logger'
import { sendEmail, accountCreatedEmail } from '@/lib/email'

interface ImportResult {
  success: number
  errors: { row: number; message: string; data?: string }[]
}

export async function POST(request: NextRequest) {
  try {
    const admin = await authorize(request, ['ADMIN'])
    if (!admin) return unauthorizedResponse()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const role = formData.get('role') as string

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 })
    }

    if (!role || !['STUDENT', 'LECTURER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must have a header row and at least one data row' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const result: ImportResult = { success: 0, errors: [] }

    // Validate headers based on role
    if (role === 'STUDENT') {
      const requiredHeaders = ['studentid', 'fullname', 'email', 'class']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        return NextResponse.json({
          error: `Missing required columns: ${missingHeaders.join(', ')}. Required: ${requiredHeaders.join(', ')}`
        }, { status: 400 })
      }
    } else {
      const requiredHeaders = ['employeeid', 'fullname', 'email', 'modules']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        return NextResponse.json({
          error: `Missing required columns: ${missingHeaders.join(', ')}. Required: ${requiredHeaders.join(', ')}`
        }, { status: 400 })
      }
    }

    // Map column indices
    const colIndex: Record<string, number> = {}
    headers.forEach((h, i) => { colIndex[h] = i })

    const defaultPassword = 'changeme123'
    const hashedPassword = await hashPassword(defaultPassword)

    for (let i = 1; i < lines.length; i++) {
      const rowData = lines[i].split(',').map(c => c.trim())

      try {
        if (role === 'STUDENT') {
          const studentId = rowData[colIndex['studentid']]
          const fullName = rowData[colIndex['fullname']]
          const email = rowData[colIndex['email']]
          const className = rowData[colIndex['class']]

          if (!studentId || !fullName || !email || !className) {
            result.errors.push({
              row: i + 1,
              message: 'Missing required fields',
              data: lines[i]
            })
            continue
          }

          // Check for duplicates
          const existingByUserId = await prisma.user.findUnique({ where: { userId: studentId } })
          if (existingByUserId) {
            result.errors.push({
              row: i + 1,
              message: `User ID "${studentId}" already exists`,
              data: lines[i]
            })
            continue
          }

          const existingByEmail = await prisma.user.findFirst({ where: { email } })
          if (existingByEmail) {
            result.errors.push({
              row: i + 1,
              message: `Email "${email}" already exists`,
              data: lines[i]
            })
            continue
          }

          // Find class by name
          const classRecord = await prisma.class.findFirst({
            where: { name: { contains: className, mode: 'insensitive' } }
          })

          if (!classRecord) {
            result.errors.push({
              row: i + 1,
              message: `Class "${className}" not found. Available classes are created in Academic Structure`,
              data: lines[i]
            })
            continue
          }

          // Create student
          await prisma.user.create({
            data: {
              userId: studentId,
              email: email.toLowerCase(),
              password: hashedPassword,
              name: fullName,
              role: 'STUDENT',
              registrationNumber: studentId,
              classId: classRecord.id,
              programId: classRecord.programId,
              year: classRecord.year,
              mustChangePassword: false,
              status: 'active'
            }
          })

          // Update class student count
          await prisma.class.update({
            where: { id: classRecord.id },
            data: { studentCount: { increment: 1 } }
          })

          // Send welcome email
          if (email) {
            const { subject, html } = accountCreatedEmail(fullName, studentId, defaultPassword, 'Student')
            await sendEmail(email, subject, html)
          }

          result.success++
        } else {
          // LECTURER import
          const employeeId = rowData[colIndex['employeeid']]
          const fullName = rowData[colIndex['fullname']]
          const email = rowData[colIndex['email']]
          const modulesStr = rowData[colIndex['modules']] || ''

          if (!employeeId || !fullName || !email) {
            result.errors.push({
              row: i + 1,
              message: 'Missing required fields (employeeid, fullname, email)',
              data: lines[i]
            })
            continue
          }

          // Check for duplicates
          const existingByUserId = await prisma.user.findUnique({ where: { userId: employeeId } })
          if (existingByUserId) {
            result.errors.push({
              row: i + 1,
              message: `User ID "${employeeId}" already exists`,
              data: lines[i]
            })
            continue
          }

          const existingByEmail = await prisma.user.findFirst({ where: { email } })
          if (existingByEmail) {
            result.errors.push({
              row: i + 1,
              message: `Email "${email}" already exists`,
              data: lines[i]
            })
            continue
          }

          // Create lecturer
          const lecturer = await prisma.user.create({
            data: {
              userId: employeeId,
              email: email.toLowerCase(),
              password: hashedPassword,
              name: fullName,
              role: 'LECTURER',
              employeeId,
              mustChangePassword: false,
              status: 'active'
            }
          })

          // Assign modules if specified
          if (modulesStr) {
            const moduleCodes = modulesStr.split(';').map(m => m.trim()).filter(Boolean)
            for (const code of moduleCodes) {
              const moduleRecord = await prisma.module.findFirst({
                where: { code: { equals: code, mode: 'insensitive' } }
              })
              if (moduleRecord) {
                await prisma.module.update({
                  where: { id: moduleRecord.id },
                  data: { lecturerId: lecturer.id }
                })
              } else {
                result.errors.push({
                  row: i + 1,
                  message: `Module code "${code}" not found - lecturer created but module not assigned`,
                  data: lines[i]
                })
              }
            }
          }

          // Send welcome email
          if (email) {
            const { subject, html } = accountCreatedEmail(fullName, employeeId, defaultPassword, 'Lecturer')
            await sendEmail(email, subject, html)
          }

          result.success++
        }
      } catch (err: any) {
        result.errors.push({
          row: i + 1,
          message: err.message || 'Unknown error',
          data: lines[i]
        })
      }
    }

    // Log the import
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      type: 'USER',
      action: 'BULK_IMPORT',
      userId: admin.id,
      details: `Admin ${admin.name} imported ${result.success} ${role.toLowerCase}(s) with ${result.errors.length} error(s)`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      success: true,
      imported: result.success,
      errors: result.errors,
      message: `Successfully imported ${result.success} ${role.toLowerCase}(s). ${result.errors.length > 0 ? `${result.errors.length} error(s) occurred.` : ''}`
    })
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}