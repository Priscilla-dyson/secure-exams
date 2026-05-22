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
    const { answers } = body

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