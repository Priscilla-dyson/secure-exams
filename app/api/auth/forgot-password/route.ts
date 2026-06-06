import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, passwordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      })
    }

    // Check if user has an email (some users might not)
    if (!user.email) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    })

    // Send email with reset link
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`

    const { subject, html } = passwordResetEmail(user.name, resetLink)
    const emailResult = await sendEmail(user.email, subject, html)

    if (!emailResult) {
      // Log but don't fail - the user can try again
      console.error('Failed to send password reset email to:', user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}