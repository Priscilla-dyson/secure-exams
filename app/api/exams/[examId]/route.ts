import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/exams/[examId] - Get a specific exam
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
      where: { id: params.examId },
      include: {
        module: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questions: {
          include: {
            options: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            examAttempts: true
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Check authorization based on user role
    if (user.role === 'STUDENT') {
      // Students can only see exams for their enrolled modules
      // This check should be implemented based on enrollment logic
    } else if (user.role === 'LECTURER') {
      // Lecturers can only see exams they created or are assigned to
      if (exam.creatorId !== user.id) {
        return forbiddenResponse()
      }
    }

    return NextResponse.json({
      success: true,
      exam
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exam' },
      { status: 500 }
    )
  }
}

// PUT /api/exams/[examId] - Update an exam
export async function PUT(
  request: NextRequest,
  context: any
) {
  const { params } = context
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'LECTURER' && user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const body = await request.json()

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId }
    })

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Lecturers can only update their own exams
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse()
    }

    const updatedExam = await prisma.exam.update({
      where: { id: params.examId },
      data: {
        title: body.title,
        description: body.description,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : exam.scheduledDate,
        scheduledTime: body.scheduledTime,
        endDate: body.endDate ? new Date(body.endDate) : exam.endDate,
        endTime: body.endTime,
        duration: body.duration,
        totalMarks: body.totalMarks,
        passingMarks: body.passingMarks,
        status: body.status,
        published: body.published,
        showResults: body.showResults,
        allowLateSubmission: body.allowLateSubmission,
        accessCode: body.accessCode
      }
    })

    return NextResponse.json({
      success: true,
      exam: updatedExam
    })
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update exam' },
      { status: 500 }
    )
  }
}

// DELETE /api/exams/[examId] - Delete an exam
export async function DELETE(
  request: NextRequest,
  context: any
) {
  const { params } = context
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== 'LECTURER' && user.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId }
    })

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Lecturers can only delete their own exams
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse()
    }

    // Only allow deletion of draft exams
    if (exam.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Can only delete draft exams' },
        { status: 400 }
      )
    }

    await prisma.exam.delete({
      where: { id: params.examId }
    })

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
}
