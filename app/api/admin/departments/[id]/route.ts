import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/departments/[id] - Get department details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const { id } = await params

    const department = await (prisma as any).department.findUnique({
      where: { id },
      include: {
        hod: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true,
            employeeId: true
          }
        },
        lecturers: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true,
            employeeId: true,
            lecturedModules: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        programs: {
          include: {
            _count: {
              select: { students: true, classes: true, modules: true }
            }
          }
        },
        subjects: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
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

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, department })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/departments/[id] - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const body = await request.json()

    // Check department exists
    const existing = await (prisma as any).department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Validate uniqueness if name or code changed
    if (body.name && body.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameConflict = await (prisma as any).department.findFirst({
        where: { name: { equals: body.name, mode: 'insensitive' }, NOT: { id } }
      })
      if (nameConflict) {
        return NextResponse.json(
          { error: 'A department with this name already exists' },
          { status: 409 }
        )
      }
    }

    if (body.code && body.code.toLowerCase() !== existing.code.toLowerCase()) {
      const codeConflict = await (prisma as any).department.findFirst({
        where: { code: { equals: body.code, mode: 'insensitive' }, NOT: { id } }
      })
      if (codeConflict) {
        return NextResponse.json(
          { error: 'A department with this code already exists' },
          { status: 409 }
        )
      }
    }

    const department = await (prisma as any).department.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        code: body.code !== undefined ? body.code.toUpperCase() : existing.code,
        description: body.description !== undefined ? body.description : existing.description,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive
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

    return NextResponse.json({ success: true, department })
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/departments/[id] - Assign/remove HOD
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const body = await request.json()
    const { hodId } = body // hodId can be null to remove HOD

    const department = await (prisma as any).department.findUnique({ where: { id } })
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // If assigning a new HOD, remove them from any other department HOD role
    if (hodId) {
      // Remove user from any existing HOD position
      await (prisma as any).department.updateMany({
        where: { hodId, NOT: { id } },
        data: { hodId: null }
      })

      // Verify user exists and is a lecturer
      const lecturer = await (prisma as any).user.findUnique({
        where: { id: hodId },
        select: { id: true, role: true, departmentId: true }
      })

      if (!lecturer || lecturer.role !== 'LECTURER') {
        return NextResponse.json(
          { error: 'User not found or is not a lecturer' },
          { status: 400 }
        )
      }

      // Auto-assign lecturer to this department if not already assigned
      if (lecturer.departmentId !== id) {
        await (prisma as any).user.update({
          where: { id: hodId },
          data: { departmentId: id }
        })
      }
    }

    const updated = await (prisma as any).department.update({
      where: { id },
      data: { hodId: hodId || null },
      include: {
        hod: {
          select: {
            id: true,
            name: true,
            email: true,
            userId: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, department: updated })
  } catch (error) {
    console.error('Error assigning HOD:', error)
    return NextResponse.json(
      { error: 'Failed to assign HOD' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/departments/[id] - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { id } = await params

    const department = await (prisma as any).department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { lecturers: true, programs: true, subjects: true }
        }
      }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    if (department._count.lecturers > 0 || department._count.programs > 0 || department._count.subjects > 0) {
      // Soft-delete by marking inactive instead
      await (prisma as any).department.update({
        where: { id },
        data: { isActive: false, hodId: null }
      })
      return NextResponse.json({
        success: true,
        message: 'Department deactivated (has active resources)'
      })
    }

    await (prisma as any).department.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Department deleted' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}