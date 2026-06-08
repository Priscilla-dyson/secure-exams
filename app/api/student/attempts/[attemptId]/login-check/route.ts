import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'
import { extractRequestInfo } from '@/lib/logger'

interface LoginCheckRequestBody {
  deviceInfo?: string
  location?: string
}

interface ExamAttemptRecord {
  id: string
  studentId: string
}

interface LoginAttemptRecord {
  ipAddress: string | null
  userAgent?: string | null
  createdAt: Date
}

// POST /api/student/attempts/[attemptId]/login-check - Log and detect multiple logins
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
): Promise<NextResponse> {
  try {
    const user = await authorize(request, ['STUDENT'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params
    const { ipAddress, userAgent } = extractRequestInfo(request)
    const body = await request.json()
    const { deviceInfo, location } = body

    const attempt = await prisma.examAttempt.findUnique({
        where: { id: attemptId }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 })
    }

    if (attempt.studentId !== user.id) {
      return forbiddenResponse('Not authorized')
    }

    // Check for previous logins from different IPs
      const previousLogins: LoginAttemptRecord[] = await (prisma as any).loginAttempt.findMany({
        where: { attemptId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
      const differentDeviceCount = previousLogins.filter((l: LoginAttemptRecord) =>
        l.ipAddress && l.ipAddress !== ipAddress
      ).length

    // Log this login attempt
    await (prisma as any).loginAttempt.create({
      data: {
        attemptId,
        ipAddress,
        userAgent,
        location: location || null,
        deviceInfo: deviceInfo || null
      }
    })

    // If we detect logins from different IPs, log a security warning
    if (differentDeviceCount > 0) {
      await prisma.systemLog.create({
        data: {
          type: 'SECURITY',
          action: 'MULTIPLE_LOGIN_DETECTED',
          userId: user.id,
          details: `Multiple login locations detected for exam attempt ${attemptId}. Previous: ${previousLogins[0]?.ipAddress || 'unknown'}, Current: ${ipAddress}`,
          ipAddress,
          userAgent
        }
      })

      return NextResponse.json({
        success: true,
        multipleDevices: true,
        warning: 'Your exam access has been logged from multiple locations. This has been flagged for review.',
        message: 'Login logged for review. Exam continues.'
      })
    }

    return NextResponse.json({
      success: true,
      multipleDevices: false,
      message: 'Login logged successfully'
    })
  } catch (error) {
    console.error('Error checking login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}