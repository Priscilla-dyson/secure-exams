import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/attempts/[attemptId]/anti-cheat - Log an anti-cheat violation event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['STUDENT'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params
    const body = await request.json()
    const { violationType, details, durationAway } = body

    if (!violationType) {
      return NextResponse.json({ error: 'violationType is required' }, { status: 400 })
    }

    const validTypes = [
      'TAB_SWITCH',
      'FULLSCREEN_EXIT',
      'FOCUS_LOSS',
      'KEYBOARD_SHORTCUT',
      'COPY_PASTE',
      'RIGHT_CLICK',
      'FACE_ABSENT'
    ]

    if (!validTypes.includes(violationType)) {
      return NextResponse.json({ error: 'Invalid violation type' }, { status: 400 })
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

    // Create the anti-cheat log entry
    const log = await prisma.antiCheatLog.create({
      data: {
        attemptId,
        violationType,
        details: details || null,
        durationAway: durationAway || null
      }
    })

    // Update the aggregate counts on the attempt
    const updateData: any = {}
    if (violationType === 'TAB_SWITCH') {
      updateData.tabSwitchCount = { increment: 1 }
    } else if (violationType === 'FULLSCREEN_EXIT') {
      updateData.fullscreenViolations = { increment: 1 }
    } else if (violationType === 'FACE_ABSENT') {
      updateData.faceDetectionWarnings = { increment: 1 }
    }

    // Mark as suspicious if it's a critical violation or repeated
    if (['KEYBOARD_SHORTCUT', 'COPY_PASTE'].includes(violationType)) {
      updateData.suspiciousActivity = true
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: updateData
      })
    }

    // If 3+ tab switches or fullscreen exits, mark as suspicious
    const updatedAttempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        tabSwitchCount: true,
        fullscreenViolations: true,
        faceDetectionWarnings: true
      }
    })

    if (updatedAttempt) {
      const totalViolations = updatedAttempt.tabSwitchCount + updatedAttempt.fullscreenViolations
      if (totalViolations >= 3 && !attempt.suspiciousActivity) {
        await prisma.examAttempt.update({
          where: { id: attemptId },
          data: { suspiciousActivity: true }
        })
      }
    }

    // Also log to system log for audit trail
    await prisma.systemLog.create({
      data: {
        type: 'SECURITY',
        action: `ANTI_CHEAT_${violationType}`,
        userId: user.id,
        details: details || `Violation: ${violationType} during exam attempt ${attemptId}${durationAway ? ` (away for ${durationAway}s)` : ''}`,
      }
    })

    return NextResponse.json({
      success: true,
      log,
      violationCounts: updatedAttempt
    })
  } catch (error) {
    console.error('Error logging anti-cheat violation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}