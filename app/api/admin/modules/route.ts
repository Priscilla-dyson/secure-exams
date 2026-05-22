import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/modules - Get all modules (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const modules = await prisma.module.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            year: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        },
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { exams: true }
        }
      },
      orderBy: [{ program: { name: 'asc' } }, { name: 'asc' }]
    })

    return NextResponse.json({ success: true, modules })
  } catch (error) {
    console.error('Get modules error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/modules - Create a new module
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { name, code, programId, lecturerId, classId } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Module name is required' },
        { status: 400 }
      )
    }

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Module code is required (e.g. COS101, DBT301)' },
        { status: 400 }
      )
    }

    if (!programId) {
      return NextResponse.json(
        { error: 'Program is required' },
        { status: 400 }
      )
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Class is required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingModule = await prisma.module.findUnique({
      where: { code: code.trim().toUpperCase() }
    })
    if (existingModule) {
      return NextResponse.json(
        { error: `Module code "${code.trim().toUpperCase()}" already exists` },
        { status: 400 }
      )
    }

    // Check if class exists
    const primaryClass = await prisma.class.findUnique({ where: { id: classId } })
    if (!primaryClass) {
      return NextResponse.json({ error: 'Selected class not found' }, { status: 400 })
    }

    const newModule = await prisma.module.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        class: { connect: { id: primaryClass.id } },
        program: { connect: { id: programId } },
        ...(lecturerId ? { lecturer: { connect: { id: lecturerId } } } : {})
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            year: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        },
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, module: newModule }, { status: 201 })
  } catch (error) {
    console.error('Create module error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}