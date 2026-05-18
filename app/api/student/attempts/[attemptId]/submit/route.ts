import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/attempts/[attemptId]/submit - Submit exam answers
export async function POST(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const user = await authorize(request, ['STUDENT'])

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      )
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Exam attempt not found' },
        { status: 404 }
      )
    }

    if (attempt.studentId !== user.id) {
      return forbiddenResponse('Not authorized to submit this attempt')
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return forbiddenResponse('Exam attempt is not in progress')
    }

    // Save each answer
    let totalScore = 0
    for (const answer of answers) {
      const question = attempt.exam.questions.find(q => q.id === answer.questionId)
      if (!question) continue

      let isCorrect = false
      let marks = 0

      if (question.type === 'MULTIPLE_CHOICE') {
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId)
        if (selectedOption && selectedOption.isCorrect) {
          isCorrect = true
          marks = question.marks
        }
      } else {
        // For short answer and essay, manual grading needed
        marks = 0 // Will be graded by lecturer
      }

      totalScore += marks

      await prisma.studentAnswer.upsert({
        where: {
          id: answer.id || ''
        },
        create: {
          attemptId: params.attemptId,
          questionId: answer.questionId,
          studentId: user.id,
          answer: answer.text || '',
          selectedOptionId: answer.selectedOptionId,
          marks,
          isCorrect
        },
        update: {
          answer: answer.text || '',
          selectedOptionId: answer.selectedOptionId,
          marks,
          isCorrect
        }
      })
    }

    // Update attempt status
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: params.attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        score: totalScore
      }
    })

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      score: totalScore,
      totalMarks: attempt.exam.totalMarks
    })
  } catch (error) {
    console.error('Submit exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
