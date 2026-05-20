import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/exams/[examId]/start - Start an exam attempt
export async function POST(
  request: NextRequest,
  context: any
) {
  const { params } = context
  try {
    const user = await authorize(request, ['STUDENT'])

    if (!user) {
      return unauthorizedResponse()
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    if (!exam.published) {
      return forbiddenResponse('Exam not published')
    }

    // Check if exam is scheduled
    if (exam.status !== 'SCHEDULED' && exam.status !== 'ACTIVE') {
      return forbiddenResponse('Exam is not available')
    }

    // Check if exam has started
    const now = new Date()
    if (exam.scheduledDate && new Date(exam.scheduledDate) > now) {
      return forbiddenResponse('Exam has not started yet')
    }

    // Check if exam has ended
    if (exam.endDate && new Date(exam.endDate) < now) {
      return forbiddenResponse('Exam has ended')
    }

    // Check if student has already attempted this exam
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId: params.examId,
        studentId: user.id
      }
    })

    if (existingAttempt) {
      return forbiddenResponse('You have already attempted this exam')
    }

    // Create exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        examId: params.examId,
        studentId: user.id,
        status: 'IN_PROGRESS',
        totalMarks: exam.totalMarks
      }
    })

    return NextResponse.json({
      success: true,
      attempt,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        questions: exam.questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.text,
          marks: q.marks,
          options: q.type === 'MULTIPLE_CHOICE' ? q.options : null
        }))
      }
    })
  } catch (error) {
    console.error('Start exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
