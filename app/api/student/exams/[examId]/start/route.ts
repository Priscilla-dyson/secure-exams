import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/exams/[examId]/start - Start an exam attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await authorize(request, ['STUDENT'])
    if (!user) return unauthorizedResponse()

    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: { orderBy: { order: 'asc' } }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    if (!exam.published) {
      return forbiddenResponse('Exam not published')
    }

    if (exam.status !== 'SCHEDULED' && exam.status !== 'ACTIVE') {
      return forbiddenResponse('Exam is not available')
    }

    const now = new Date()
    if (exam.scheduledDate && new Date(exam.scheduledDate) > now) {
      return forbiddenResponse('Exam has not started yet')
    }

    if (exam.endDate && new Date(exam.endDate) < now) {
      return forbiddenResponse('Exam has ended')
    }

    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId,
        studentId: user.id
      }
    })

    if (existingAttempt) {
      return forbiddenResponse('You have already attempted this exam')
    }

    // Calculate remaining time based on scheduled start + duration
    // If student joins late, they lose that time
    let remainingSeconds = exam.duration * 60
    if (exam.scheduledDate) {
      const scheduledStart = new Date(exam.scheduledDate)
      const elapsedSinceStart = Math.floor((now.getTime() - scheduledStart.getTime()) / 1000)
      remainingSeconds = Math.max(0, exam.duration * 60 - elapsedSinceStart)
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId: user.id,
        status: 'IN_PROGRESS',
        totalMarks: exam.totalMarks
      }
    })

    return NextResponse.json({
      success: true,
      attempt,
      remainingSeconds,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        scheduledDate: exam.scheduledDate,
        questions: exam.questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.text,
          marks: q.marks,
          instructions: q.instructions,
          options: q.type === 'MULTIPLE_CHOICE' ? q.options : undefined
        }))
      }
    })
  } catch (error) {
    console.error('Start exam error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}