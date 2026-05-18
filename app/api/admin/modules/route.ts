import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/modules - Get all modules (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const modules = await prisma.module.findMany({
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })

    return NextResponse.json({ success: true, modules })
  } catch (error) {
    console.error('Get modules error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/modules - Create a new module (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { code, name, department, lecturerId, semester } = body

    if (!code || !name || !department) {
      return NextResponse.json(
        { error: 'Code, name, and department are required' },
        { status: 400 }
      )
    }

    // Check if module already exists
    const existingModule = await prisma.module.findUnique({
      where: { code }
    })

    if (existingModule) {
      return NextResponse.json(
        { error: 'Module with this code already exists' },
        { status: 400 }
      )
    }

    const newModule = await prisma.module.create({
      data: {
        code,
        name,
        department,
        lecturerId: lecturerId || null,
        semester: semester || '1'
      },
      include: {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
