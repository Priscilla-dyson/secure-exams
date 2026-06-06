import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { generateCsv, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'students'

    if (type === 'lecturers') {
      const lecturers = await prisma.user.findMany({
        where: { role: 'LECTURER' },
        select: {
          userId: true,
          name: true,
          email: true,
          employeeId: true,
          status: true,
          createdAt: true,
          lecturedModules: {
            select: { code: true, name: true }
          }
        },
        orderBy: { name: 'asc' }
      })

      const headers = ['Employee ID', 'Full Name', 'Email', 'Assigned Modules', 'Status', 'Created Date']
      const rows = lecturers.map(l => [
        l.employeeId || l.userId,
        l.name,
        l.email || '',
        l.lecturedModules.map(m => m.code).join('; '),
        l.status,
        new Date(l.createdAt).toLocaleDateString()
      ])

      const csv = generateCsv(headers, rows)
      return csvResponse(csv, 'lecturers_export.csv')
    }

    // Default: students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        userId: true,
        name: true,
        email: true,
        registrationNumber: true,
        status: true,
        createdAt: true,
        class: { select: { name: true, year: true } },
        program: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    })

    const headers = ['Student ID', 'Full Name', 'Email', 'Registration No.', 'Class', 'Program', 'Status', 'Created Date']
    const rows = students.map(s => [
      s.userId,
      s.name,
      s.email || '',
      s.registrationNumber || '',
      s.class?.name || '',
      s.program?.name || '',
      s.status,
      new Date(s.createdAt).toLocaleDateString()
    ])

    const csv = generateCsv(headers, rows)
    return csvResponse(csv, 'students_export.csv')

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}