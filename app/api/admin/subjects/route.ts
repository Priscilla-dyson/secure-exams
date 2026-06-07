import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/subjects - List subjects (optionally filtered by department)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (user.role === 'LECTURER' && user.departmentId) {
      where.departmentId = user.departmentId
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, subjects })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

// POST /api/admin/subjects - Create a subject
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { name, code, description, departmentId } = body

    if (!name || !code || !departmentId) {
      return NextResponse.json(
        { error: 'Name, code, and department are required' },
        { status: 400 }
      )
    }

    // Lecturers can only create subjects in their department
    if (user.role === 'LECTURER') {
      if (user.departmentId !== departmentId) {
        return NextResponse.json(
          { error: 'You can only create subjects in your department' },
          { status: 403 }
        )
      }
    }

    const existing = await prisma.subject.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A subject with this code already exists' },
        { status: 409 }
      )
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null,
        departmentId
      },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        },
        _count: {
          select: { questions: true }
        }
      }
    })

    return NextResponse.json({ success: true, subject }, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}