// ============================================================
// EXAM START API - /api/student/exams/[examId]/start
// ============================================================
// PURPOSE: Handles a student starting or resuming an exam attempt.
// Called when a student clicks "Enter Exam" from their dashboard.
//
// KEY BEHAVIORS:
// - On-time students: get the full exam duration (e.g., 60 min)
// - Late-joining students: get reduced time based on scheduled end 
//   (e.g., join 20 min late for 60-min exam → 40 min remaining)
// - After scheduled end time passes: access is blocked entirely
// - Students get ONE attempt only (submitted/graded blocks re-entry)
// - In-progress attempts can be resumed with remaining time preserved
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/student/exams/[examId]/start - Start an exam attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    // STEP 1: Verify the student is authenticated with STUDENT role
    const user = await authorize(request, ['STUDENT'])
    if (!user) return unauthorizedResponse()

    const { examId } = await params

    // STEP 2: Fetch the exam with its questions and options
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: { orderBy: { order: 'asc' } },
            subQuestions: {
              include: {
                options: { orderBy: { order: 'asc' } }
              },
              orderBy: { order: 'asc' }
            }
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

    // STEP 3: Verify the exam's scheduled start time has arrived
    if (exam.scheduledDate && new Date(exam.scheduledDate) > now) {
      return forbiddenResponse('Exam has not started yet')
    }

    // STEP 4: Calculate the scheduled end time
    let examEndTime: Date | null = null
    if (exam.scheduledDate) {
      examEndTime = new Date(exam.scheduledDate.getTime() + exam.duration * 60 * 1000)
    }
    if (exam.endDate && examEndTime) {
      examEndTime = examEndTime < exam.endDate ? examEndTime : exam.endDate
    } else if (exam.endDate) {
      examEndTime = exam.endDate
    }

    // STEP 5: Block access if the scheduled end time has already passed
    if (examEndTime && examEndTime < now) {
      return forbiddenResponse('The scheduled exam time has ended. You can no longer access this exam.')
    }

    // STEP 6: Check for existing attempts
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId,
        studentId: user.id
      },
      orderBy: { startedAt: 'desc' }
    })

    if (existingAttempt) {
      if (existingAttempt.status === 'SUBMITTED' || existingAttempt.status === 'GRADED') {
        return forbiddenResponse('You have already submitted this exam')
      }
      
      if (existingAttempt.status === 'IN_PROGRESS') {
        await prisma.examAttempt.deleteMany({
          where: {
            examId,
            studentId: user.id,
            status: 'IN_PROGRESS',
            id: { not: existingAttempt.id }
          }
        })
        
        let remainingSeconds = exam.duration * 60
        if (examEndTime) {
          remainingSeconds = Math.max(0, Math.floor((examEndTime.getTime() - now.getTime()) / 1000))
        }

        return NextResponse.json({
          success: true,
          attempt: existingAttempt,
          remainingSeconds,
          exam: {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            totalMarks: exam.totalMarks,
            scheduledDate: exam.scheduledDate,
            questions: exam.questions.map(q => {
              const qAny = q as any;
              return {
              id: qAny.id,
              type: qAny.type,
              text: qAny.text,
              plainText: qAny.plainText || qAny.text,
              marks: qAny.marks,
              instructions: qAny.instructions,
              category: qAny.category,
              contentFormat: qAny.contentFormat,
              useMathRendering: qAny.useMathRendering,
              requiresManualMarking: qAny.requiresManualMarking,
              partLabel: qAny.partLabel,
              options: qAny.options && qAny.options.length > 0 ? qAny.options : undefined,
              mathAnswer: qAny.mathAnswer,
              mathInput: qAny.mathInput,
              tolerance: qAny.tolerance,
              subQuestions: qAny.subQuestions && qAny.subQuestions.length > 0 ? qAny.subQuestions.map((sq: any) => ({
                id: sq.id,
                type: sq.type,
                text: sq.text,
                marks: sq.marks,
                category: sq.category,
                partLabel: sq.partLabel,
                contentFormat: sq.contentFormat,
                useMathRendering: sq.useMathRendering,
                requiresManualMarking: sq.requiresManualMarking,
                options: sq.options && sq.options.length > 0 ? sq.options : undefined,
                mathAnswer: sq.mathAnswer,
                mathInput: sq.mathInput,
                tolerance: sq.tolerance,
                correctAnswer: sq.correctAnswer,
              })) : undefined
              }
            })
          }
        })
      }
    }

    // STEP 7: Create a NEW attempt
    let remainingSeconds = exam.duration * 60
    if (examEndTime) {
      remainingSeconds = Math.max(0, Math.floor((examEndTime.getTime() - now.getTime()) / 1000))
    }

    if (remainingSeconds <= 0) {
      return forbiddenResponse('The scheduled exam time has ended. You can no longer access this exam.')
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
        questions: exam.questions.map(q => {
          const qAny = q as any;
          return {
          id: qAny.id,
          type: qAny.type,
          text: qAny.text,
          plainText: qAny.plainText || qAny.text,
          marks: qAny.marks,
          instructions: qAny.instructions,
          category: qAny.category,
          contentFormat: qAny.contentFormat,
          useMathRendering: qAny.useMathRendering,
          requiresManualMarking: qAny.requiresManualMarking,
          partLabel: qAny.partLabel,
          options: qAny.options && qAny.options.length > 0 ? qAny.options : undefined,
          mathAnswer: qAny.mathAnswer,
          mathInput: qAny.mathInput,
          tolerance: qAny.tolerance,
          subQuestions: qAny.subQuestions && qAny.subQuestions.length > 0 ? qAny.subQuestions.map((sq: any) => ({
            id: sq.id,
            type: sq.type,
            text: sq.text,
            marks: sq.marks,
            category: sq.category,
            partLabel: sq.partLabel,
            contentFormat: sq.contentFormat,
            useMathRendering: sq.useMathRendering,
            requiresManualMarking: sq.requiresManualMarking,
            options: sq.options && sq.options.length > 0 ? sq.options : undefined,
            mathAnswer: sq.mathAnswer,
            mathInput: sq.mathInput,
            tolerance: sq.tolerance,
            correctAnswer: sq.correctAnswer,
          })) : undefined
          }
        })
      }
    })
  } catch (error) {
    console.error('Start exam error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}