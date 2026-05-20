import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/exams/[examId]/questions - Get all questions for an exam
export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = context
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Lecturers can only view their own exam questions
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to view this exam')
    }

    const questions = await prisma.question.findMany({
      where: { examId: params.examId },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, questions })
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exams/[examId]/questions - Add a question to an exam (Lecturer only)
export async function POST(
  request: NextRequest,
  context: any
) {
  const { params } = context
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { type, text, marks, options } = body

    if (!type || !text) {
      return NextResponse.json(
        { error: 'Question type and text are required' },
        { status: 400 }
      )
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Lecturers can only add questions to their own exams
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to modify this exam')
    }

    // Get the next order number
    const questionCount = await prisma.question.count({
      where: { examId: params.examId }
    })

    const question = await prisma.question.create({
      data: {
        examId: params.examId,
        type,
        text,
        marks: marks ? parseInt(marks) : 1,
        order: questionCount + 1
      }
    })

    // Add options if provided (for multiple choice questions)
    if (type === 'MULTIPLE_CHOICE' && options && Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        await prisma.questionOption.create({
          data: {
            questionId: question.id,
            text: options[i].text,
            isCorrect: options[i].isCorrect || false,
            order: i + 1
          }
        })
      }
    }

    const createdQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({ success: true, question: createdQuestion }, { status: 201 })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
