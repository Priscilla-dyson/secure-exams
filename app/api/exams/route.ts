import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'
import { logActivity, extractRequestInfo } from '@/lib/logger'

// GET /api/exams - Get all exams (filtered by user role)
// Auto-update exam status based on scheduled/end dates
async function updateExamStatuses() {
  const now = new Date()
  
  // SCHEDULED -> ACTIVE: scheduledDate has arrived
  await prisma.exam.updateMany({
    where: {
      status: 'SCHEDULED',
      scheduledDate: { lte: now }
    },
    data: { status: 'ACTIVE' }
  })

  // SCHEDULED or ACTIVE -> COMPLETED: endDate has passed
  await prisma.exam.updateMany({
    where: {
      status: { in: ['SCHEDULED', 'ACTIVE'] },
      endDate: { lte: now }
    },
    data: { status: 'COMPLETED' }
  })

  // SCHEDULED or ACTIVE -> COMPLETED: scheduledDate + duration has passed (no endDate set)
  // If endDate is null but scheduledDate + duration is in the past
  const examsWithEndedTime = await prisma.exam.findMany({
    where: {
      status: { in: ['SCHEDULED', 'ACTIVE'] },
      endDate: null,
      scheduledDate: { not: null }
    },
    select: { id: true, scheduledDate: true, duration: true }
  })

  for (const exam of examsWithEndedTime) {
    if (exam.scheduledDate) {
      const examEnd = new Date(exam.scheduledDate.getTime() + exam.duration * 60000)
      if (examEnd <= now) {
        await prisma.exam.update({
          where: { id: exam.id },
          data: { status: 'COMPLETED' }
        })
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    // Auto-update exam statuses before fetching
    await updateExamStatuses()

    let exams

    if (user.role === 'LECTURER') {
      // Lecturers see their own exams
      exams = await prisma.exam.findMany({
        where: { creatorId: user.id },
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
            select: {
              id: true,
              type: true,
              marks: true
            }
          },
          _count: {
            select: {
              examAttempts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (user.role === 'STUDENT') {
      // Students see published scheduled exams
      exams = await prisma.exam.findMany({
        where: {
          published: true,
          status: { in: ['SCHEDULED', 'ACTIVE'] }
        },
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
            select: {
              id: true,
              type: true,
              marks: true
            }
          }
        },
        orderBy: { scheduledDate: 'asc' }
      })
    } else if (user.role === 'ADMIN') {
      // Admins see all exams
      exams = await prisma.exam.findMany({
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
            select: {
              id: true,
              type: true,
              marks: true
            }
          },
          _count: {
            select: {
              examAttempts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ success: true, exams })
  } catch (error) {
    console.error('Get exams error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exams - Create a new exam (Lecturer only)
export async function POST(request: NextRequest) {
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
      endTime
    } = body

    if (!title || !moduleId || !duration) {
      return NextResponse.json(
        { error: 'Title, module, and duration are required' },
        { status: 400 }
      )
    }

    // If questions are provided, create them along with the exam
    const { questions: questionData } = body

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        type: type || 'midterm',
        moduleId,
        creatorId: user.id,
        duration: parseInt(duration),
        totalMarks: totalMarks ? parseInt(totalMarks) : 100,
        passingMarks: passingMarks ? parseInt(passingMarks) : 40,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime,
        endDate: endDate ? new Date(endDate) : null,
        endTime,
        status: body.status || 'DRAFT',
        published: body.published || false,
        showResults: body.showResults !== undefined ? body.showResults : true,
        allowLateSubmission: body.allowLateSubmission || false,
        questions: questionData && questionData.length > 0 ? {
          create: questionData.map((q: any, index: number) => ({
            type: q.type,
            text: q.text,
            instructions: q.instructions,
            marks: q.marks || 1,
            order: q.order || index + 1,
            correctAnswer: q.correctAnswer,
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

    // Log exam creation
    const { ipAddress, userAgent } = extractRequestInfo(request)

    if (questionData && questionData.length > 0) {
      await logActivity({
        type: 'EXAM',
        action: 'EXAM_QUESTIONS_ADDED',
        userId: user.id,
        details: `${user.name} added ${questionData.length} questions to exam "${exam.title}"`,
        ipAddress,
        userAgent
      })
    }

    // Log exam creation
    await logActivity({
      type: 'EXAM',
      action: 'EXAM_CREATED',
      userId: user.id,
      details: `${user.name} created exam "${exam.title}" for module ${exam.module.name}`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true, exam }, { status: 201 })
  } catch (error) {
    console.error('Create exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
