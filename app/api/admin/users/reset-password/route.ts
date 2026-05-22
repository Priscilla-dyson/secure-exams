import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'
import { logActivity, extractRequestInfo } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const admin = await authorize(request, ['ADMIN'])
    if (!admin) return unauthorizedResponse()

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const defaultPassword = 'changeme123'
    const hashedPassword = await hashPassword(defaultPassword)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    })

    // Log password reset
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await logActivity({
      type: 'USER',
      action: 'PASSWORD_RESET',
      userId: admin.id,
      details: `Admin ${admin.name} reset password for ${targetUser.name} (${targetUser.role})`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, message: 'Password reset to default (changeme123)' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}