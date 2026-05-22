import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/programs/[programId] - Get a single program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { programId } = await params

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            modules: true
          }
        },
        classes: {
          orderBy: { year: 'asc' }
        },
        modules: {
          include: {
            class: { select: { name: true } },
            lecturer: { select: { id: true, name: true, email: true } }
          },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, program })
  } catch (error) {
    console.error('Get program error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/programs/[programId] - Edit program name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { programId } = await params
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Program name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if program exists
    const existing = await prisma.program.findUnique({
      where: { id: programId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Check if another program with the same name exists
    const duplicate = await prisma.program.findFirst({
      where: {
        name: trimmedName,
        id: { not: programId }
      }
    })

    if (duplicate) {
      return NextResponse.json(
        { error: `Program "${trimmedName}" already exists` },
        { status: 400 }
      )
    }

    // Update the program name
    const program = await prisma.program.update({
      where: { id: programId },
      data: { name: trimmedName },
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            modules: true
          }
        }
      }
    })

    // Also update all class names for this program
    const classes = await prisma.class.findMany({
      where: { programId }
    })

    for (const cls of classes) {
      const newClassName = `${trimmedName} Year ${cls.year}`
      if (cls.name !== newClassName) {
        await prisma.class.update({
          where: { id: cls.id },
          data: { name: newClassName }
        })
      }
    }

    return NextResponse.json({ success: true, program })
  } catch (error) {
    console.error('Update program error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/programs/[programId] - Delete a program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { programId } = await params

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            students: true,
            modules: true
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Prevent deletion if program has students
    if (program._count.students > 0) {
      return NextResponse.json(
        { error: `Cannot delete program with ${program._count.students} enrolled students` },
        { status: 400 }
      )
    }

    // Delete associated classes (they're auto-generated anyway)
    await prisma.class.deleteMany({
      where: { programId }
    })

    // Delete the program
    await prisma.program.delete({
      where: { id: programId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete program error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}