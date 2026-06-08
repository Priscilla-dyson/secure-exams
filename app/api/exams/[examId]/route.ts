// ============================================================
// EXAM DETAIL API - /api/exams/[examId]
// ============================================================
// PURPOSE: Handles individual exam operations: get, update, and delete.
// Used by lecturers/admins to manage specific exams.
//
// KEY BEHAVIORS:
// - GET: Fetches a single exam
//   - Lecturer: Full access to own exams (questions, options, answers)
//   - HOD: Can view any exam in their department but STRIPS question content
//   - Admin: Can view any exam but STRIPS question content
//   - Student: Can only access published exams within scheduled time
// - PUT: Updates an exam (title, questions, schedule, etc.)
//   - Validates that scheduledDate is not in the past (from app/api/exams/route.ts)
// - DELETE: Removes a draft exam (only DRAFT status exams can be deleted)
// - Sends email notifications when a draft is published/scheduled
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'
import { sendEmail, examScheduledEmail } from '@/lib/email'

// GET /api/exams/[examId] - Get a specific exam with full details
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
        module: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                departmentId: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questions: {
          include: {
            options: true,
            subQuestions: {
              include: {
                options: true
              },
              orderBy: {
                order: 'asc'
              }
            }
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

    // ------------------------------------------------------------
    // ACCESS CONTROL MATRIX:
    //   Lecturer (own exam): Full access including questions
    //   Lecturer (other's exam): Forbidden (unless HOD — see below)
    //   HOD (same department): Can view exam but NO questions
    //   Admin: Can view any exam but NO questions
    //   Student: Handled by separate /api/student/exams/[examId]/start
    // ------------------------------------------------------------
    if (user.role === 'LECTURER') {
      // If this is the lecturer's own exam, they get full access
      if (exam.creatorId === user.id) {
        // Full access — include questions as-is
        return NextResponse.json({ success: true, exam })
      }
      
      // If lecturer is HOD and exam belongs to their department
      if (user.isHod && user.departmentId) {
        const isSameDepartment = exam.module.program.departmentId === user.departmentId
        if (isSameDepartment) {
          // HOD sees exam METADATA ONLY — strip question content
          const { questions, ...examMetadata } = exam
          return NextResponse.json({
            success: true,
            exam: {
              ...examMetadata,
              questionCount: (questions || []).length,
              questions: [] // No question content
            }
          })
        }
      }
      
      // Otherwise forbidden
      return forbiddenResponse()
    }

    if (user.role === 'ADMIN') {
      // Admin sees exam METADATA ONLY — strip question content
      const { questions, ...examMetadata } = exam
      return NextResponse.json({
        success: true,
        exam: {
          ...examMetadata,
          questionCount: (questions || []).length,
          questions: [] // No question content for security
        }
      })
    }

    if (user.role === 'STUDENT') {
      // Students should use /api/student/exams/[examId]/start
      // But we still allow viewing exam metadata
      const { questions, ...examMetadata } = exam
      return NextResponse.json({
        success: true,
        exam: {
          ...examMetadata,
          questionCount: (questions || []).length,
          questions: [] // Students access questions via start endpoint
        }
      })
    }

    // Fallback: strip questions for any other role
    const { questions, ...examMetadata } = exam
    return NextResponse.json({
      success: true,
      exam: {
        ...examMetadata,
        questionCount: (questions || []).length,
        questions: []
      }
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exam' },
      { status: 500 }
    )
  }
}

// PUT /api/exams/[examId] - Update an exam (Lecturer or Admin only)
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

    // Extract questions from body for potential replacement
    const { questions: questionData } = body

    // ------------------------------------------------------------
    // PAST-DATE VALIDATION: Only enforce on publish/schedule
    // Prevents lecturers from publishing exams with past dates.
    // Saving as DRAFT with past dates is allowed (can be edited later).
    // ------------------------------------------------------------
    if (body.published || body.status === 'SCHEDULED') {
      if (body.scheduledDate) {
        const scheduledDateTime = new Date(body.scheduledDate)
        const now = new Date()
        if (scheduledDateTime <= now) {
          return NextResponse.json(
            { success: false, error: 'Cannot schedule an exam in the past. The scheduled date and time must be in the future.' },
            { status: 400 }
          )
        }
      }

      if (body.endDate) {
        const endDateTime = new Date(body.endDate)
        const now = new Date()
        if (endDateTime <= now) {
          return NextResponse.json(
            { success: false, error: 'Cannot set an end date in the past. The end date and time must be in the future.' },
            { status: 400 }
          )
        }
      }

      // Also validate that end date is after start date
      if (body.scheduledDate && body.endDate) {
        const scheduledDateTime = new Date(body.scheduledDate)
        const endDateTime = new Date(body.endDate)
        if (endDateTime <= scheduledDateTime) {
          return NextResponse.json(
            { success: false, error: 'End date and time must be after the start date and time.' },
            { status: 400 }
          )
        }
      }

      // ------------------------------------------------------------
      // MARKS VALIDATION: When publishing/scheduling, question marks must match totalMarks
      // ------------------------------------------------------------
      if (questionData && questionData.length > 0) {
        const totalMarksFromQuestions = questionData.reduce((sum: number, q: any) => {
          if (q.subQuestions && q.subQuestions.length > 0) {
            return sum + q.subQuestions.reduce((s: number, sq: any) => s + (sq.marks || 0), 0)
          }
          return sum + (q.marks || 0)
        }, 0)
        const declaredTotalMarks = body.totalMarks ? parseInt(body.totalMarks) : exam.totalMarks
        if (totalMarksFromQuestions !== declaredTotalMarks) {
          return NextResponse.json({
            success: false,
            error: `Question marks total (${totalMarksFromQuestions}) does not match declared total marks (${declaredTotalMarks}). Please adjust question marks or total marks before publishing.`
          }, { status: 400 })
        }
      }
    }

    // If questions are provided, replace all existing questions (including sub-questions)
    if (questionData && questionData.length > 0) {
      // Delete existing sub-questions first, then questions, then options
      const existingQuestions = await prisma.question.findMany({
        where: { examId },
        select: { id: true }
      })
      const questionIds = existingQuestions.map(q => q.id)
      
      if (questionIds.length > 0) {
        // Delete sub-questions
        await prisma.question.deleteMany({
          where: { parentId: { in: questionIds } }
        })
        // Delete options
        await prisma.questionOption.deleteMany({
          where: { questionId: { in: questionIds } }
        })
        // Delete parent questions
        await prisma.question.deleteMany({
          where: { examId }
        })
      }
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
          create: questionData.map((q: any, index: number) => {
            const baseQuestion: any = {
              type: q.type,
              category: q.category || 'MULTIPLE_CHOICE',
              text: q.text,
              plainText: q.plainText || q.text,
              instructions: q.instructions,
              marks: q.marks || 1,
              order: q.order || index + 1,
              correctAnswer: q.type === 'SHORT_ANSWER' || q.type === 'ESSAY' ? null : q.correctAnswer,
              mathAnswer: q.type === 'MATH' ? q.mathAnswer : undefined,
              tolerance: q.type === 'MATH' ? q.tolerance : undefined,
              mathInput: q.mathInput,
              contentFormat: q.contentFormat || 'PLAIN',
              partLabel: q.partLabel,
              useMathRendering: q.useMathRendering || false,
              requiresManualMarking: q.requiresManualMarking || q.type === 'ESSAY' || q.type === 'SHORT_ANSWER' || q.type === 'DRAWING',
            }

            // Add options for MCQ/TrueFalse
            if ((q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && q.options) {
              baseQuestion.options = {
                create: q.options.map((opt: any, optIndex: number) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect || false,
                  order: optIndex + 1
                }))
              }
            }

            // Add sub-questions if they exist
            if (q.subQuestions && q.subQuestions.length > 0) {
              baseQuestion.subQuestions = {
                create: q.subQuestions.map((sq: any, sqIndex: number) => {
                  const sqData: any = {
                    type: sq.category === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' :
                          sq.category === 'TRUE_FALSE' ? 'MULTIPLE_CHOICE' :
                          sq.category === 'MATH' ? 'MATH' :
                          sq.category === 'SHORT_ANSWER' ? 'SHORT_ANSWER' :
                          'SHORT_ANSWER',
                    category: sq.category || 'SHORT_ANSWER',
                    text: sq.text,
                    marks: sq.marks || 1,
                    order: sqIndex + 1,
                    partLabel: `${index + 1}${String.fromCharCode(97 + sqIndex)}`,
                    correctAnswer: sq.category !== 'MATH' ? sq.correctAnswer : null,
                    mathAnswer: sq.category === 'MATH' ? sq.mathAnswer : undefined,
                    mathInput: sq.category === 'MATH' ? sq.mathInput : undefined,
                    tolerance: sq.category === 'MATH' ? sq.tolerance : undefined,
                    contentFormat: sq.contentFormat || (sq.category === 'MATH' ? 'WOLFRAM' : 'PLAIN'),
                    useMathRendering: sq.useMathRendering || false,
                    requiresManualMarking: sq.category === 'SHORT_ANSWER' || sq.category === 'ESSAY',
                  }

                  if (sq.category === 'MULTIPLE_CHOICE' && sq.options) {
                    sqData.options = {
                      create: sq.options.map((opt: any, optIndex2: number) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect || false,
                        order: optIndex2 + 1
                      }))
                    }
                  }

                  return sqData
                })
              }
            }

            return baseQuestion
          })
        } : undefined
      },
      include: {
        module: true,
        questions: {
          include: { 
            options: true,
            subQuestions: {
              include: { options: true },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // Send email notification if exam is being published/scheduled (transition from DRAFT)
    // Email notification system from lib/email.ts
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

// DELETE /api/exams/[examId] - Delete a draft exam
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

    // Only allow deletion of draft exams (prevents deleting active/completed exams)
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