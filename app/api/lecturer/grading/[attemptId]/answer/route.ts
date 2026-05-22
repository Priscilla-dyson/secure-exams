import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// PUT /api/lecturer/grading/[attemptId]/answer - Grade a single student answer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params
    const body = await request.json()
    const { answerId, marks } = body

    if (!answerId || marks === undefined || marks === null) {
      return NextResponse.json({ error: 'answerId and marks are required' }, { status: 400 })
    }

    const marksNum = parseInt(marks)
    if (isNaN(marksNum) || marksNum < 0) {
      return NextResponse.json({ error: 'Marks must be a non-negative number' }, { status: 400 })
    }

    // Verify the answer belongs to this attempt
    const answer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
        attempt: {
          include: {
            exam: { select: { creatorId: true } }
          }
        }
      }
    })

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    if (answer.attemptId !== attemptId) {
      return NextResponse.json({ error: 'Answer does not belong to this attempt' }, { status: 400 })
    }

    // Lecturers can only grade their own exams
    if (user.role === 'LECTURER' && answer.attempt.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to grade this answer')
    }

    // Validate marks don't exceed question max marks
    const questionMarks = answer.question.marks
    if (marksNum > questionMarks) {
      return NextResponse.json({
        error: `Marks cannot exceed the question maximum of ${questionMarks}`,
        maxMarks: questionMarks
      }, { status: 400 })
    }

    // Update the answer with marks
    // For non-MCQ questions, set isCorrect based on whether marks > 0
    const isCorrect = marksNum > 0

    const updatedAnswer = await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        marks: marksNum,
        isCorrect: answer.question.type === 'MULTIPLE_CHOICE' ? answer.isCorrect : isCorrect
      }
    })

    // Check if all answers for this attempt are now graded
    const allAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId }
    })
    const allGraded = allAnswers.every(a => a.marks !== null)
    const totalScore = allAnswers.reduce((sum, a) => sum + (a.marks || 0), 0)

    return NextResponse.json({
      success: true,
      answer: updatedAnswer,
      allGraded,
      currentTotal: totalScore
    })
  } catch (error) {
    console.error('Error grading answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}