import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/attempts/[attemptId]/ai-proctor - Log AI proctoring violation (log only, NEVER auto-submit)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['STUDENT'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params
    const body = await request.json()
    const { violationType, details, confidence } = body

    if (!violationType) {
      return NextResponse.json({ error: 'violationType is required' }, { status: 400 })
    }

    const validTypes = [
      'FACE_ABSENT',
      'MULTIPLE_FACES',
      'LOOKING_AWAY',
      'PHONE_DETECTED',
      'BOOK_DETECTED',
      'SUSPICIOUS_OBJECT',
      'NOISE_DETECTED'
    ]

    if (!validTypes.includes(violationType)) {
      return NextResponse.json({ error: 'Invalid AI proctoring violation type' }, { status: 400 })
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 })
    }

    if (attempt.studentId !== user.id) {
      return forbiddenResponse('Not authorized to log violations for this attempt')
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return forbiddenResponse('Exam attempt is not in progress')
    }

    // Create the anti-cheat log entry (uses the same AntiCheatLog model)
    const log = await prisma.antiCheatLog.create({
      data: {
        attemptId,
        violationType,
        details: details || null,
        durationAway: null
      }
    })

    // ONLY update face detection warnings count - NEVER auto-submit or mark suspicious
    // This is the key difference: AI violations are LOG-ONLY for lecturer review
    const updateData: any = {}
    if (violationType === 'FACE_ABSENT' || violationType === 'MULTIPLE_FACES') {
      updateData.faceDetectionWarnings = { increment: 1 }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: updateData
      })
    }

    // Log to system log for audit trail
    await prisma.systemLog.create({
      data: {
        type: 'SECURITY',
        action: `AI_PROCTOR_${violationType}`,
        userId: user.id,
        details: details || `AI Proctoring violation: ${violationType} during exam attempt ${attemptId}${confidence ? ` (confidence: ${confidence})` : ''}`,
      }
    })

    return NextResponse.json({
      success: true,
      log,
      message: 'AI proctoring violation logged for review. Exam continues.'
    })
  } catch (error) {
    console.error('Error logging AI proctoring violation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/student/attempts/[attemptId]/ai-proctor - Get proctoring status summary for this attempt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['STUDENT', 'LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        studentId: true,
        status: true,
        faceDetectionWarnings: true,
        suspiciousActivity: true,
        antiCheatLogs: {
          where: {
            violationType: {
              in: ['FACE_ABSENT', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'PHONE_DETECTED', 'BOOK_DETECTED', 'SUSPICIOUS_OBJECT']
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 100
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 })
    }

    // Students can only see their own data
    if (user.role === 'STUDENT' && attempt.studentId !== user.id) {
      return forbiddenResponse('Not authorized to view this data')
    }

    return NextResponse.json({
      success: true,
      totalAIWarnings: attempt.faceDetectionWarnings,
      suspiciousActivity: attempt.suspiciousActivity,
      logs: attempt.antiCheatLogs
    })
  } catch (error) {
    console.error('Error fetching AI proctoring data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}