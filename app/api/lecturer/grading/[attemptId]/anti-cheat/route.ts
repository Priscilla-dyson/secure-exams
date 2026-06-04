import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/lecturer/grading/[attemptId]/anti-cheat - Get all anti-cheat logs for an attempt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          select: {
            id: true,
            creatorId: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Lecturers can only view anti-cheat logs for their own exams
    if (user.role === 'LECTURER' && attempt.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to view anti-cheat logs for this attempt')
    }

    // Get all anti-cheat logs for this attempt
    const logs = await prisma.antiCheatLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'asc' }
    })

    // Get aggregate counts
    const aggregateCounts = {
      tabSwitchCount: attempt.tabSwitchCount,
      fullscreenViolations: attempt.fullscreenViolations,
      faceDetectionWarnings: attempt.faceDetectionWarnings,
      suspiciousActivity: attempt.suspiciousActivity
    }

    // Calculate additional stats
    const groupedByType: Record<string, number> = {}
    logs.forEach(log => {
      groupedByType[log.violationType] = (groupedByType[log.violationType] || 0) + 1
    })

    // Time distribution: group logs into 5-minute windows
    const startTime = attempt.createdAt.getTime()
    const windowSize = 5 * 60 * 1000 // 5 minutes
    const timeDistribution: { window: number; count: number; types: string[] }[] = []
    
    logs.forEach(log => {
      const elapsed = log.createdAt.getTime() - startTime
      const windowIndex = Math.floor(elapsed / windowSize)
      const existing = timeDistribution.find(td => td.window === windowIndex)
      if (existing) {
        existing.count++
        if (!existing.types.includes(log.violationType)) {
          existing.types.push(log.violationType)
        }
      } else {
        timeDistribution.push({
          window: windowIndex,
          count: 1,
          types: [log.violationType]
        })
      }
    })

    return NextResponse.json({
      success: true,
      logs,
      summary: {
        totalViolations: logs.length,
        byType: groupedByType,
        aggregateCounts,
        student: {
          name: attempt.student.name,
          email: attempt.student.email,
          registrationNumber: attempt.student.registrationNumber
        }
      },
      timeDistribution: timeDistribution.sort((a, b) => a.window - b.window)
    })
  } catch (error) {
    console.error('Error fetching anti-cheat logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}