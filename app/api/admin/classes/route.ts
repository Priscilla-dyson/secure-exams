import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/classes - Get all classes (view only)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const classes = await prisma.class.findMany({
      include: {
        program: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        _count: { select: { students: true, modules: true } }
      },
      orderBy: [{ program: { name: 'asc' } }, { year: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        program: c.program.name,
        programId: c.programId,
        year: c.year,
        isActive: c.isActive,
        studentCount: c._count.students,
        moduleCount: c._count.modules,
        createdAt: c.createdAt
      }))
    })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/classes/[id] - Toggle class status (activate/deactivate)
// Note: This is handled by PATCH, not POST
export async function PATCH(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('id')
    const body = await request.json()
    const { isActive } = body

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive (boolean) is required' }, { status: 400 })
    }

    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { isActive },
      include: {
        program: { select: { id: true, name: true } },
        _count: { select: { students: true, modules: true } }
      }
    })

    return NextResponse.json({
      success: true,
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        program: updatedClass.program.name,
        programId: updatedClass.programId,
        year: updatedClass.year,
        isActive: updatedClass.isActive,
        studentCount: updatedClass._count.students,
        moduleCount: updatedClass._count.modules,
        createdAt: updatedClass.createdAt
      }
    })
  } catch (error) {
    console.error('Update class error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}