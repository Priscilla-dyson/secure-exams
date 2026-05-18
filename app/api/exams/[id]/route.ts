import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/exams/[id] - Get a specific exam
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
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

    // Students can only see published exams
    if (user.role === 'STUDENT' && !exam.published) {
      return forbiddenResponse('Exam not published')
    }

    // Lecturers can only see their own exams
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to view this exam')
    }

    return NextResponse.json({ success: true, exam })
  } catch (error) {
    console.error('Get exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/exams/[id] - Update an exam (Lecturer only)
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
    const {
      title,
      description,
      type,
      moduleId,
      duration,
      totalMarks,
      passingMarks,
      scheduledDate,
      scheduledTime,
      endDate,
      endTime,
      status,
      published
    } = body

    const exam = await prisma.exam.findUnique({
      where: { id: params.id }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Lecturers can only update their own exams
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to update this exam')
    }

    const updatedExam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(moduleId && { moduleId }),
        ...(duration && { duration: parseInt(duration) }),
        ...(totalMarks && { totalMarks: parseInt(totalMarks) }),
        ...(passingMarks && { passingMarks: parseInt(passingMarks) }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(scheduledTime !== undefined && { scheduledTime }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(endTime !== undefined && { endTime }),
        ...(status && { status }),
        ...(published !== undefined && { published })
      },
      include: {
        module: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, exam: updatedExam })
  } catch (error) {
    console.error('Update exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/exams/[id] - Delete an exam (Lecturer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Lecturers can only delete their own exams
    if (user.role === 'LECTURER' && exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to delete this exam')
    }

    // Cannot delete exams that have attempts
    const attemptCount = await prisma.examAttempt.count({
      where: { examId: params.id }
    })

    if (attemptCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete exam with existing attempts' },
        { status: 400 }
      )
    }

    await prisma.exam.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' })
  } catch (error) {
    console.error('Delete exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
