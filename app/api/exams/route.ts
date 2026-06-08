// ============================================================
// EXAMS API - /api/exams
// ============================================================
// PURPOSE: CRUD operations for exam management by lecturers/admins.
// Handles creating, listing, and auto-updating exam statuses.
//
// KEY BEHAVIORS:
// - POST: Creates a new exam with validation (no past dates allowed)
// - GET: Lists exams filtered by user role
//   - Lecturers: See their own exams with questions
//   - HOD (Head of Department): See all department exams — METADATA ONLY, no questions
//   - Admins: See all exams system-wide — METADATA ONLY, no questions
//   - Students: See published exams in scheduled/active status
// - Auto-updates exam statuses (DRAFT→SCHEDULED→ACTIVE→COMPLETED)
// - Sends email notifications when exams are published/scheduled
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'
import { logActivity, extractRequestInfo } from '@/lib/logger'
import { sendEmail, examScheduledEmail } from '@/lib/email'

// ------------------------------------------------------------
// HELPER: updateExamStatuses
// ------------------------------------------------------------
// Called automatically before GET to update exam statuses based
// on real time. This ensures the system reflects the current 
// state without relying on cron jobs or manual updates.
//
// Status transitions:
//   SCHEDULED → ACTIVE  (when scheduledDate arrives)
//   SCHEDULED/ACTIVE → COMPLETED (when endDate or scheduledDate+duration passes)
// ------------------------------------------------------------
async function updateExamStatuses() {
  const now = new Date()
  
  // Transition SCHEDULED → ACTIVE once the scheduled start time arrives
  await prisma.exam.updateMany({
    where: {
      status: 'SCHEDULED',
      scheduledDate: { lte: now }
    },
    data: { status: 'ACTIVE' }
  })

  // Transition SCHEDULED or ACTIVE → COMPLETED once endDate has passed
  await prisma.exam.updateMany({
    where: {
      status: { in: ['SCHEDULED', 'ACTIVE'] },
      endDate: { lte: now }
    },
    data: { status: 'COMPLETED' }
  })

  // Transition SCHEDULED or ACTIVE → COMPLETED when scheduledDate + duration has passed
  // (only for exams without an explicit endDate)
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

// GET /api/exams - List all exams (filtered by user role)
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
      // HOD (Head of Department): can see ALL exams in their department
      // but only metadata — NO question text, answers, or options
      if (user.isHod && user.departmentId) {
        exams = await prisma.exam.findMany({
          where: {
            module: {
              program: {
                departmentId: user.departmentId
              }
            }
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
            _count: {
              select: {
                examAttempts: true,
                questions: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      } else {
        // Regular lecturer: own exams only, with full question details
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
              orderBy: { order: 'asc' }
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
    } else if (user.role === 'STUDENT') {
      // Students see only published, upcoming/active exams
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
      // Admins see ALL exams system-wide — METADATA ONLY
      // NO question text, answers, or options for security
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
          _count: {
            select: {
              examAttempts: true,
              questions: true
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

// POST /api/exams - Create a new exam (Lecturer or Admin only)
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

    // Validate required fields
    if (!title || !moduleId || !duration) {
      return NextResponse.json(
        { error: 'Title, module, and duration are required' },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------
    // MARKS VALIDATION: When publishing, question marks must match totalMarks
    // Prevents publishing an exam where declared total (e.g. 100) doesn't
    // match the sum of all question marks (e.g. only 50 worth of questions)
    // ------------------------------------------------------------
    const { questions: questionData } = body
    if (body.published || body.status === 'SCHEDULED') {
      if (questionData && questionData.length > 0) {
        const totalMarksFromQuestions = questionData.reduce((sum: number, q: any) => {
          if (q.type === 'STRUCTURED' && q.subQuestions && q.subQuestions.length > 0) {
            return sum + q.subQuestions.reduce((s: number, sq: any) => s + (sq.marks || 0), 0)
          }
          return sum + (q.marks || 0)
        }, 0)
        const declaredTotalMarks = totalMarks ? parseInt(totalMarks) : 100
        if (totalMarksFromQuestions !== declaredTotalMarks) {
          return NextResponse.json({
            error: `Question marks total (${totalMarksFromQuestions}) does not match declared total marks (${declaredTotalMarks}). Please adjust question marks or total marks before publishing.`
          }, { status: 400 })
        }
      }
    }

    // ------------------------------------------------------------
    // PAST-DATE VALIDATION (from app/api/exams/route.ts)
    // ------------------------------------------------------------
    // Prevents lecturers from scheduling exams with past dates.
    // If today is June 7, scheduling for June 1 is rejected.
    // This ensures the exam timer system works correctly — scheduled
    // exams always start in the future.
    // ------------------------------------------------------------
    if (body.published || body.status === 'SCHEDULED') {
      if (scheduledDate) {
        const scheduledDateTime = new Date(scheduledDate)
        const now = new Date()
        if (scheduledDateTime <= now) {
          return NextResponse.json(
            { error: 'Cannot schedule an exam in the past. The scheduled date and time must be in the future.' },
            { status: 400 }
          )
        }
      }

      if (endDate) {
        const endDateTime = new Date(endDate)
        const now = new Date()
        if (endDateTime <= now) {
          return NextResponse.json(
            { error: 'Cannot set an end date in the past. The end date and time must be in the future.' },
            { status: 400 }
          )
        }
      }

      // Also validate that end date is after start date
      if (scheduledDate && endDate) {
        const scheduledDateTime = new Date(scheduledDate)
        const endDateTime = new Date(endDate)
        if (endDateTime <= scheduledDateTime) {
          return NextResponse.json(
            { error: 'End date and time must be after the start date and time.' },
            { status: 400 }
          )
        }
      }
    }


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
        scheduledTime: scheduledTime || undefined,
        endDate: endDate ? new Date(endDate) : null,
        endTime: endTime || undefined,
        status: body.status || 'DRAFT',
        published: body.published || false,
        showResults: body.showResults !== undefined ? body.showResults : true,
        allowLateSubmission: body.allowLateSubmission || false,
        questions: questionData && questionData.length > 0 ? {
          create: questionData.map((q: any, index: number) => ({
            type: q.category === 'STRUCTURED' ? 'SHORT_ANSWER' :
                  q.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' :
                  q.type === 'SHORT_ANSWER' ? 'SHORT_ANSWER' :
                  q.type === 'ESSAY' ? 'ESSAY' :
                  q.type === 'MATH' ? 'MATH' :
                  q.type === 'DRAWING' ? 'DRAWING' :
                  'MULTIPLE_CHOICE',
            category: q.category || 'MULTIPLE_CHOICE',
            text: q.text,
            creatorId: user.id,
            plainText: q.plainText || q.text,
            instructions: q.instructions,
            marks: q.marks || 1,
            order: q.order || index + 1,
            correctAnswer: q.type === 'MULTIPLE_CHOICE' ? q.correctAnswer : undefined,
            mathAnswer: q.type === 'MATH' ? q.mathAnswer : undefined,
            tolerance: q.type === 'MATH' ? q.tolerance : undefined,
            mathInput: q.mathInput,
            contentFormat: q.contentFormat || 'PLAIN',
            partLabel: q.partLabel,
            useMathRendering: q.useMathRendering || false,
            requiresManualMarking: q.requiresManualMarking || q.type === 'ESSAY' || q.type === 'SHORT_ANSWER' || q.type === 'DRAWING',
            options: q.type === 'MULTIPLE_CHOICE' && q.options ? {
              create: q.options.map((opt: any, optIndex: number) => ({
                text: opt.text,
                isCorrect: opt.isCorrect || false,
                order: optIndex + 1
              }))
            } : undefined,
            // Create sub-questions for any type that has them
            subQuestions: q.subQuestions && q.subQuestions.length > 0 ? {
              create: q.subQuestions.map((sq: any, sqIndex: number) => ({
                type: sq.category === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' :
                      sq.category === 'MATH' ? 'MATH' :
                      sq.category === 'SHORT_ANSWER' ? 'SHORT_ANSWER' :
                      'SHORT_ANSWER',
                category: sq.category || 'SHORT_ANSWER',
                text: sq.text,
                marks: sq.marks || 1,
                creatorId: user.id,
                order: sqIndex + 1,
                partLabel: `${index + 1}${String.fromCharCode(97 + sqIndex)}`,
                correctAnswer: sq.category !== 'MATH' ? sq.correctAnswer : null,
                mathAnswer: sq.category === 'MATH' ? sq.mathAnswer : undefined,
                mathInput: sq.category === 'MATH' ? sq.mathInput : undefined,
                tolerance: sq.category === 'MATH' ? sq.tolerance : undefined,
                contentFormat: sq.contentFormat || (sq.category === 'MATH' ? 'WOLFRAM' : 'PLAIN'),
                useMathRendering: sq.useMathRendering || false,
                requiresManualMarking: sq.category === 'SHORT_ANSWER' || sq.category === 'ESSAY',
                options: sq.category === 'MULTIPLE_CHOICE' && sq.options ? {
                  create: sq.options.map((opt: any, optIndex2: number) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect || false,
                    order: optIndex2 + 1
                  }))
                } : undefined,
              }))
            } : undefined,
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

    // Log exam creation activity for audit trail (from lib/logger.ts)
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

    // Send email notification to students if exam is published/scheduled
    // Notification system from lib/email.ts handles actual email delivery
    if (body.published || body.status === 'SCHEDULED') {
      try {
        const module = await prisma.module.findUnique({
          where: { id: moduleId },
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
          const scheduledDate = exam.scheduledDate ? new Date(exam.scheduledDate) : null
          const date = scheduledDate ? scheduledDate.toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'
          const time = scheduledDate ? scheduledDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'TBD'

          for (const student of module.class.students) {
            if (student.email) {
              const { subject, html } = examScheduledEmail(student.name, exam.title, module.name, date, time)
              await sendEmail(student.email, subject, html)
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send exam notifications:', emailError)
      }
    }

    return NextResponse.json({ success: true, exam }, { status: 201 })
  } catch (error) {
    console.error('Create exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}