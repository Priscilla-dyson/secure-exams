import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/attempts/[attemptId]/submit - Submit exam answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['STUDENT'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params
    const body = await request.json()
    const { answers, antiCheatData } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 })
    }

    if (attempt.studentId !== user.id) {
      return forbiddenResponse('Not authorized to submit this attempt')
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return forbiddenResponse('Exam attempt is not in progress')
    }

    // Update anti-cheat violation counts if provided
    if (antiCheatData) {
      const updateData: any = {}

      if (typeof antiCheatData.tabSwitchCount === 'number') {
        updateData.tabSwitchCount = antiCheatData.tabSwitchCount
      }
      if (typeof antiCheatData.fullscreenViolations === 'number') {
        updateData.fullscreenViolations = antiCheatData.fullscreenViolations
      }
      if (typeof antiCheatData.faceDetectionWarnings === 'number') {
        updateData.faceDetectionWarnings = antiCheatData.faceDetectionWarnings
      }
      if (typeof antiCheatData.suspiciousActivity === 'boolean') {
        updateData.suspiciousActivity = antiCheatData.suspiciousActivity
      }

      // Auto-detect suspicious activity if there are many violations
      const totalViolations = (antiCheatData.tabSwitchCount || 0) + (antiCheatData.fullscreenViolations || 0)
      if (totalViolations >= 3 && !updateData.suspiciousActivity) {
        updateData.suspiciousActivity = true
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.examAttempt.update({
          where: { id: attemptId },
          data: updateData
        })
      }

      // Log any remaining violation events that weren't already logged in real-time
      // This checks if the client sent totals that are higher than what we have in the DB
      const existingLogs = await prisma.antiCheatLog.count({
        where: { attemptId }
      })

      if (existingLogs === 0 && totalViolations > 0) {
        // Real-time logging was missed, create aggregated logs
        const violationTypes = [
          { type: 'TAB_SWITCH', count: antiCheatData.tabSwitchCount || 0 },
          { type: 'FULLSCREEN_EXIT', count: antiCheatData.fullscreenViolations || 0 },
          { type: 'FACE_ABSENT', count: antiCheatData.faceDetectionWarnings || 0 }
        ]

        for (const vt of violationTypes) {
          if (vt.count > 0) {
            await prisma.antiCheatLog.create({
              data: {
                attemptId,
                violationType: vt.type,
                details: `Logged at submission: ${vt.count} violation(s)`
              }
            })
          }
        }

        // Also log to system log
        await prisma.systemLog.create({
          data: {
            type: 'SECURITY',
            action: 'ANTI_CHEAT_SUBMISSION',
            userId: user.id,
            details: `Anti-cheat violations recorded at submission: ${totalViolations} total (${antiCheatData.tabSwitchCount || 0} tab switches, ${antiCheatData.fullscreenViolations || 0} fullscreen exits)`
          }
        })
      }
    }

    // Save each answer
    let autoGradedScore = 0
    const allQuestionsAutoGraded = attempt.exam.questions.every(
      q => q.type === 'MULTIPLE_CHOICE'
    )

    for (const answer of answers) {
      const question = attempt.exam.questions.find(q => q.id === answer.questionId)
      if (!question) continue

      let isCorrect = false
      let marks: number | null = null

      if (question.type === 'MULTIPLE_CHOICE') {
        // Auto-grade multiple choice
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId)
        if (selectedOption && selectedOption.isCorrect) {
          isCorrect = true
          marks = question.marks
        } else {
          marks = 0
        }
        autoGradedScore += marks
      }
      // Other types: marks stays null (needs manual grading)

      await prisma.studentAnswer.upsert({
        where: { id: answer.id || '' },
        create: {
          attemptId,
          questionId: answer.questionId,
          studentId: user.id,
          answer: answer.text || '',
          selectedOptionId: answer.selectedOptionId,
          drawingImage: answer.drawingImage || null,
          marks,
          isCorrect: question.type === 'MULTIPLE_CHOICE' ? isCorrect : null
        },
        update: {
          answer: answer.text || '',
          selectedOptionId: answer.selectedOptionId,
          drawingImage: answer.drawingImage || null,
          marks,
          isCorrect: question.type === 'MULTIPLE_CHOICE' ? isCorrect : null
        }
      })
    }

    // Update attempt status to SUBMITTED
    // If all questions are MCQ (auto-graded), also set GRADED status
    const newStatus = allQuestionsAutoGraded ? 'GRADED' : 'SUBMITTED'
    const finalScore = allQuestionsAutoGraded ? autoGradedScore : null

    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: newStatus,
        submittedAt: new Date(),
        score: finalScore
      }
    })

    // If all questions auto-graded, create the Result record immediately
    if (allQuestionsAutoGraded) {
      const totalMarks = attempt.exam.totalMarks
      const percentage = totalMarks > 0 ? Math.round((autoGradedScore / totalMarks) * 100) : 0

      // Determine grade
      let grade: string
      if (percentage >= 75) grade = 'A'
      else if (percentage >= 70) grade = 'B+'
      else if (percentage >= 60) grade = 'B'
      else if (percentage >= 50) grade = 'C'
      else grade = 'F'

      await prisma.result.upsert({
        where: { attemptId },
        create: {
          attemptId,
          studentId: user.id,
          examId: attempt.examId,
          score: autoGradedScore,
          totalMarks,
          percentage,
          grade,
          published: false
        },
        update: {
          score: autoGradedScore,
          totalMarks,
          percentage,
          grade,
          published: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      score: allQuestionsAutoGraded ? autoGradedScore : null,
      totalMarks: attempt.exam.totalMarks,
      allAutoGraded: allQuestionsAutoGraded,
      requiresManualGrading: !allQuestionsAutoGraded
    })
  } catch (error) {
    console.error('Submit exam error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}