import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/lecturer/department/assign-lecturer - HOD assigns lecturer to module
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()

    if (user.role !== 'LECTURER' || !user.isHod) {
      return forbiddenResponse('Only HODs can assign lecturers to modules')
    }

    const body = await request.json()
    const { moduleId, lecturerId } = body

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Verify the module belongs to a program in the HOD's department
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        program: {
          select: { departmentId: true }
        }
      }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    if (moduleData.program.departmentId !== user.departmentId) {
      return forbiddenResponse('This module does not belong to your department')
    }

    // If assigning a lecturer, verify they belong to the same department
    if (lecturerId) {
      const lecturer = await prisma.user.findUnique({
        where: { id: lecturerId },
        select: { id: true, role: true, departmentId: true }
      })

      if (!lecturer || lecturer.role !== 'LECTURER') {
        return NextResponse.json({ error: 'User not found or is not a lecturer' }, { status: 400 })
      }

      if (lecturer.departmentId !== user.departmentId) {
        return forbiddenResponse('Lecturer does not belong to your department')
      }
    }

    // Update the module lecturer
    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: { lecturerId: lecturerId || null },
      select: {
        id: true,
        code: true,
        name: true,
        lecturer: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ success: true, module: updated })
  } catch (error) {
    console.error('Assign lecturer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}