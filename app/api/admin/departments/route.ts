// ============================================================
// DEPARTMENTS API - /api/admin/departments
// ============================================================
// Handles CRUD for departments. Departments are separate from
// programs — a department (e.g., ICT) can have multiple programs.
// Each department has exactly ONE HOD (Head of Department).
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// Auto-generate a unique code from the department name
function generateCode(name: string): string {
  const prefix = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 5)
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase()
  return prefix ? `${prefix}${suffix}` : `DEPT${suffix}`
}

// GET /api/admin/departments - List all departments
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const departments = await prisma.department.findMany({
      include: {
        hod: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true
          }
        },
        subjects: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true
          },
          orderBy: { name: 'asc' }
        },
        programs: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            modules: {
              select: {
                id: true,
                name: true,
                code: true
              },
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
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
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.department.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A department with this name already exists' },
        { status: 409 }
      )
    }

    // Auto-generate unique code
    let code = generateCode(name)
    let attempts = 0
    while (await prisma.department.findUnique({ where: { code } })) {
      code = generateCode(name + attempts)
      attempts++
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
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