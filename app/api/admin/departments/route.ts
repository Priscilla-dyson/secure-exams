import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/departments - List all departments
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const departments = await prisma.departments.findMany({
      include: {
        hod: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true
          }
        },
        _count: {
          select: {
            lecturers: true,
            programs: true,
            subjects: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, departments })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

// POST /api/admin/departments - Create a department
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { name, code, description } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.department.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: { equals: code, mode: 'insensitive' } }
        ]
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A department with this name or code already exists' },
        { status: 409 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null
      },
      include: {
        hod: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true
          }
        },
        _count: {
          select: {
            lecturers: true,
            programs: true,
            subjects: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, department }, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}