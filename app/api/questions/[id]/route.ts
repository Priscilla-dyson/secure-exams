import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// PUT /api/questions/[id] - Update a question (Lecturer only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { text, marks, options } = body

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: { exam: true }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Lecturers can only update their own exam questions
    if (user.role === 'LECTURER' && question.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to update this question')
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: {
        ...(text && { text }),
        ...(marks && { marks: parseInt(marks) })
      }
    })

    // Update options if provided
    if (options && Array.isArray(options)) {
      // Delete existing options
      await prisma.questionOption.deleteMany({
        where: { questionId: params.id }
      })

      // Create new options
      for (let i = 0; i < options.length; i++) {
        await prisma.questionOption.create({
          data: {
            questionId: params.id,
            text: options[i].text,
            isCorrect: options[i].isCorrect || false,
            order: i + 1
          }
        })
      }
    }

    const questionWithOptions = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({ success: true, question: questionWithOptions })
  } catch (error) {
    console.error('Update question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/questions/[id] - Delete a question (Lecturer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: { exam: true }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Lecturers can only delete their own exam questions
    if (user.role === 'LECTURER' && question.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to delete this question')
    }

    await prisma.question.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
