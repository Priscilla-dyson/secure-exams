import { NextRequest, NextResponse } from 'next/server'
import { loginByUserId, generateToken } from '@/lib/auth'
import { logActivity, extractRequestInfo } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, password } = body

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      )
    }

    const user = await loginByUserId(userId, password)

    if (!user) {
      // Log failed login attempt
      const { ipAddress, userAgent } = extractRequestInfo(request)
      await logActivity({
        type: 'AUTH',
        action: 'LOGIN_FAILED',
        details: `Failed login attempt for user ID: ${userId}`,
        ipAddress,
        userAgent
      })

      return NextResponse.json(
        { error: 'Invalid user ID or password' },
        { status: 401 }
      )
    }

    const email = user.email ?? ''

    const token = generateToken({
      userId: user.id,
      email,
      role: user.role
    })

    // Log successful login
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      type: 'AUTH',
      action: 'LOGIN_SUCCESS',
      userId: user.id,
      details: `${user.name} (${user.role}) logged in successfully`,
      ipAddress,
      userAgent
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email,
        name: user.name,
        role: user.role,
        classId: user.classId,
        programId: user.programId,
        mustChangePassword: user.mustChangePassword
      },
      token
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}