import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'
import { sendEmail, examScheduledEmail } from '@/lib/email'

// GET /api/exams/[examId] - Get a specific exam
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()

    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
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
    if (user.role === 'LECTURER') {
      if (exam.creatorId !== user.id) {
        return forbiddenResponse()
      }
    }

    return NextResponse.json({ success: true, exam })
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
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()
    if (user.role !== 'LECTURER' && user.role !== 'ADMIN') return forbiddenResponse()

    const { examId } = await params
    const body = await request.json()

    const exam = await prisma.exam.findUnique({
      where: { id: examId }
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

    // If questions are provided, replace all questions
    const { questions: questionData } = body
    if (questionData && questionData.length > 0) {
      // Delete existing questions and their options
      await prisma.questionOption.deleteMany({
        where: { question: { examId } }
      })
      await prisma.question.deleteMany({
        where: { examId }
      })
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: body.title !== undefined ? body.title : exam.title,
        description: body.description !== undefined ? body.description : exam.description,
        type: body.type !== undefined ? body.type : exam.type,
        moduleId: body.moduleId !== undefined ? body.moduleId : exam.moduleId,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : (body.scheduledDate === null ? null : exam.scheduledDate),
        scheduledTime: body.scheduledTime !== undefined ? body.scheduledTime : exam.scheduledTime,
        endDate: body.endDate ? new Date(body.endDate) : (body.endDate === null ? null : exam.endDate),
        endTime: body.endTime !== undefined ? body.endTime : exam.endTime,
        duration: body.duration !== undefined ? parseInt(body.duration) : exam.duration,
        totalMarks: body.totalMarks !== undefined ? parseInt(body.totalMarks) : exam.totalMarks,
        passingMarks: body.passingMarks !== undefined ? parseInt(body.passingMarks) : exam.passingMarks,
        status: body.status || exam.status,
        published: body.published !== undefined ? body.published : exam.published,
        showResults: body.showResults !== undefined ? body.showResults : exam.showResults,
        allowLateSubmission: body.allowLateSubmission !== undefined ? body.allowLateSubmission : exam.allowLateSubmission,
        accessCode: body.accessCode !== undefined ? body.accessCode : exam.accessCode,
        questions: questionData && questionData.length > 0 ? {
          create: questionData.map((q: any, index: number) => ({
            type: q.type,
            text: q.text,
            instructions: q.instructions,
            marks: q.marks || 1,
            order: q.order || index + 1,
            correctAnswer: q.correctAnswer,
            mathAnswer: q.mathAnswer,
            options: q.type === 'MULTIPLE_CHOICE' && q.options ? {
              create: q.options.map((opt: any, optIndex: number) => ({
                text: opt.text,
                isCorrect: opt.isCorrect || false,
                order: optIndex + 1
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        module: true,
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    // Send email notification if exam is being published/scheduled
    const wasDraftAndNowScheduled = (body.published || body.status === 'SCHEDULED') && exam.status === 'DRAFT'
    if (wasDraftAndNowScheduled) {
      try {
        const module = await prisma.module.findUnique({
          where: { id: updatedExam.moduleId },
          include: {
            class: {
              include: {
                students: {
                  where: { status: 'active' },
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        })

        if (module?.class?.students) {
          const scheduledDate = updatedExam.scheduledDate ? new Date(updatedExam.scheduledDate) : null
          const date = scheduledDate ? scheduledDate.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'
          const time = scheduledDate ? scheduledDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'TBD'

          for (const student of module.class.students) {
            if (student.email) {
              const { subject, html } = examScheduledEmail(student.name, updatedExam.title, module.name, date, time)
              await sendEmail(student.email, subject, html)
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send exam update notifications:', emailError)
      }
    }

    return NextResponse.json({ success: true, exam: updatedExam })
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
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()
    if (user.role !== 'LECTURER' && user.role !== 'ADMIN') return forbiddenResponse()

    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: examId }
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
      where: { id: examId }
    })

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
}