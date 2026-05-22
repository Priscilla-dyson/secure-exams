import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'
import { logActivity, extractRequestInfo } from '@/lib/logger'

// GET /api/admin/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: roleFilter ? { role: roleFilter.toUpperCase() as any } : {},
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        registrationNumber: true,
        employeeId: true,
        status: true,
        createdAt: true,
        class: { select: { id: true, name: true } },
        lecturedModules: {
          select: {
            id: true,
            name: true,
            code: true,
            class: { select: { id: true, name: true } },
            program: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/users - Create a new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await authorize(request, ['ADMIN'])
    if (!admin) return unauthorizedResponse()

    const body = await request.json()
    const { userId, email, name, role, classId } = body

    if (!userId || !email || !name || !role) {
      return NextResponse.json(
        { error: 'User ID, email, name, and role are required' },
        { status: 400 }
      )
    }

    const existingUserByEmail = await prisma.user.findFirst({ where: { email } })
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingUserByUserId = await prisma.user.findFirst({ where: { userId } })
    if (existingUserByUserId) {
      return NextResponse.json(
        { error: 'User with this User ID already exists' },
        { status: 400 }
      )
    }

    // Default password (must be changed on first login)
    const defaultPassword = 'changeme123'
    const hashedPassword = await hashPassword(defaultPassword)

    const newUser = await prisma.user.create({
      data: {
        userId,
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase() as any,
        classId: classId || null,
        programId: classId ? (await prisma.class.findUnique({ where: { id: classId }, select: { programId: true, year: true } }))?.programId : null,
        year: classId ? (await prisma.class.findUnique({ where: { id: classId }, select: { year: true } }))?.year : null,
        mustChangePassword: true,
        status: 'active'
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    // Log user creation
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      type: 'USER',
      action: 'USER_CREATED',
      userId: admin.id,
      details: `Admin ${admin.name} created ${role.toLowerCase()} user: ${name} (${email})`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const admin = await authorize(request, ['ADMIN'])
    if (!admin) return unauthorizedResponse()

    const body = await request.json()
    const { id, userId, name, email, role, status, classId } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const oldUser = await prisma.user.findUnique({ where: { id } })

    if (userId && oldUser?.userId !== userId) {
      const existingUserByUserId = await prisma.user.findFirst({
        where: {
          userId,
          NOT: { id }
        }
      })
      if (existingUserByUserId) {
        return NextResponse.json(
          { error: 'User with this User ID already exists' },
          { status: 400 }
        )
      }
    }

    // If classId is being changed, sync programId and year
    let updateData: any = {
      ...(userId !== undefined && { userId }),
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role: role?.toUpperCase() as any }),
      ...(status !== undefined && { status }),
    }

    if (classId !== undefined) {
      updateData.classId = classId
      if (classId) {
        const classInfo = await prisma.class.findUnique({
          where: { id: classId },
          select: { programId: true, year: true }
        })
        updateData.programId = classInfo?.programId || null
        updateData.year = classInfo?.year || null
      } else {
        updateData.programId = null
        updateData.year = null
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    // Log user update
    const { ipAddress, userAgent } = extractRequestInfo(request)
    const changes: string[] = []
    if (oldUser && oldUser.name !== name) changes.push(`name: ${oldUser.name} → ${name}`)
    if (oldUser && oldUser.email !== email) changes.push(`email: ${oldUser.email} → ${email}`)
    if (oldUser && oldUser.role !== role?.toUpperCase()) changes.push(`role: ${oldUser.role} → ${role}`)
    if (oldUser && oldUser.status !== status) changes.push(`status: ${oldUser.status} → ${status}`)

    await logActivity({
      type: 'USER',
      action: 'USER_UPDATED',
      userId: admin.id,
      details: `Admin ${admin.name} updated user ${updatedUser.name}: ${changes.join(', ') || 'no changes'}`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const admin = await authorize(request, ['ADMIN'])
    if (!admin) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const deletedUser = await prisma.user.findUnique({ where: { id } })
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    // Log user deletion
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      type: 'USER',
      action: 'USER_DELETED',
      userId: admin.id,
      details: `Admin ${admin.name} deleted ${deletedUser.role.toLowerCase()} user: ${deletedUser.name} (${deletedUser.email})`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}