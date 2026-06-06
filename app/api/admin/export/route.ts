import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { generateCsv, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'programs'

    if (type === 'programs') {
      const programs = await prisma.program.findMany({
        select: {
          name: true,
          isActive: true,
          createdAt: true,
          _count: { select: { students: true, classes: true, modules: true } }
        },
        orderBy: { name: 'asc' }
      })

      const headers = ['Program Name', 'Status', 'Students', 'Classes', 'Modules', 'Created Date']
      const rows = programs.map(p => [
        p.name,
        p.isActive ? 'Active' : 'Inactive',
        p._count.students,
        p._count.classes,
        p._count.modules,
        new Date(p.createdAt).toLocaleDateString()
      ])

      return csvResponse(generateCsv(headers, rows), 'programs_export.csv')
    }

    if (type === 'modules') {
      const modules = await prisma.module.findMany({
        select: {
          code: true,
          name: true,
          program: { select: { name: true } },
          class: { select: { name: true } },
          lecturer: { select: { name: true, email: true } },
          _count: { select: { exams: true } }
        },
        orderBy: { code: 'asc' }
      })

      const headers = ['Module Code', 'Module Name', 'Program', 'Class', 'Lecturer', 'Lecturer Email', 'Exams']
      const rows = modules.map(m => [
        m.code,
        m.name,
        m.program?.name || '',
        m.class?.name || '',
        m.lecturer?.name || '',
        m.lecturer?.email || '',
        m._count.exams
      ])

      return csvResponse(generateCsv(headers, rows), 'modules_export.csv')
    }

    if (type === 'classes') {
      const classes = await prisma.class.findMany({
        select: {
          name: true,
          program: { select: { name: true } },
          year: true,
          isActive: true,
          studentCount: true,
          createdAt: true
        },
        orderBy: [{ programId: 'asc' }, { year: 'asc' }]
      })

      const headers = ['Class Name', 'Program', 'Year', 'Status', 'Student Count', 'Created Date']
      const rows = classes.map(c => [
        c.name,
        c.program?.name || '',
        c.year,
        c.isActive ? 'Active' : 'Inactive',
        c.studentCount,
        new Date(c.createdAt).toLocaleDateString()
      ])

      return csvResponse(generateCsv(headers, rows), 'classes_export.csv')
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}