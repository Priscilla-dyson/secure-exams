import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['LECTURER'])
    if (!user) return unauthorizedResponse()
    if (!user.isHod || !user.department) {
      return NextResponse.json({ error: 'Not authorized as HOD' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    const department = user.department

    if (type === 'overview') {
      // Get department overview stats
      const program = await prisma.program.findFirst({
        where: { name: { contains: department, mode: 'insensitive' }, isActive: true }
      })

      const programId = program?.id

      const lecturersCount = await prisma.user.count({
        where: { role: 'LECTURER', department: { contains: department, mode: 'insensitive' } }
      })

      const studentsCount = programId ? await prisma.user.count({
        where: { role: 'STUDENT', programId }
      }) : 0

      const modulesCount = programId ? await prisma.module.count({
        where: { programId }
      }) : 0

      const examsCount = programId ? await prisma.exam.count({
        where: { module: { programId } }
      }) : 0

      return NextResponse.json({
        success: true,
        data: {
          department,
          program: program?.name || department,
          lecturers: lecturersCount,
          students: studentsCount,
          modules: modulesCount,
          exams: examsCount
        }
      })
    }

    if (type === 'lecturers') {
      const lecturers = await prisma.user.findMany({
        where: { role: 'LECTURER', department: { contains: department, mode: 'insensitive' } },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          employeeId: true,
          isHod: true,
          status: true,
          lecturedModules: {
            select: { id: true, code: true, name: true, program: { select: { name: true } }, class: { select: { name: true } } }
          }
        },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({ success: true, data: lecturers })
    }

    if (type === 'modules') {
      const program = await prisma.program.findFirst({
        where: { name: { contains: department, mode: 'insensitive' }, isActive: true }
      })

      const modules = program ? await prisma.module.findMany({
        where: { programId: program.id },
        select: {
          id: true,
          code: true,
          name: true,
          class: { select: { name: true, year: true } },
          lecturer: { select: { name: true, email: true } },
          _count: { select: { exams: true } }
        },
        orderBy: { code: 'asc' }
      }) : []

      return NextResponse.json({ success: true, data: modules })
    }

    if (type === 'exams') {
      const program = await prisma.program.findFirst({
        where: { name: { contains: department, mode: 'insensitive' }, isActive: true }
      })

      const exams = program ? await prisma.exam.findMany({
        where: { module: { programId: program.id } },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          duration: true,
          totalMarks: true,
          scheduledDate: true,
          module: { select: { code: true, name: true, lecturer: { select: { name: true } } } },
          creator: { select: { name: true } },
          _count: { select: { examAttempts: true } }
        },
        orderBy: { createdAt: 'desc' }
      }) : []

      return NextResponse.json({ success: true, data: exams })
    }

    if (type === 'results') {
      const program = await prisma.program.findFirst({
        where: { name: { contains: department, mode: 'insensitive' }, isActive: true }
      })

      const results = program ? await prisma.result.findMany({
        where: { exam: { module: { programId: program.id } }, published: true },
        select: {
          id: true,
          score: true,
          totalMarks: true,
          percentage: true,
          grade: true,
          createdAt: true,
          student: { select: { name: true, userId: true } },
          exam: { select: { title: true, type: true, module: { select: { code: true, name: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }) : []

      // Calculate stats
      const totalResults = results.length
      const avgPercentage = totalResults > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalResults) 
        : 0
      const passed = results.filter(r => r.percentage >= 50).length
      const failed = results.filter(r => r.percentage < 50).length

      return NextResponse.json({ 
        success: true, 
        data: results,
        stats: { totalResults, avgPercentage, passed, failed }
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  } catch (error) {
    console.error('Department API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}