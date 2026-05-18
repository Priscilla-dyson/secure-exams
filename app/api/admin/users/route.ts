import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        registrationNumber: true,
        employeeId: true,
        department: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create a new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { email, password, name, role, registrationNumber, employeeId, department } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase(),
        registrationNumber: registrationNumber || null,
        employeeId: employeeId || null,
        department: department || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        registrationNumber: true,
        employeeId: true,
        department: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
