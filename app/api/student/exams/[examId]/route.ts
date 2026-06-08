// ============================================================
// EXAM PREVIEW API - GET /api/student/exams/[examId]
// ============================================================
// PURPOSE: Load exam metadata and questions for the student to
// preview WITHOUT creating an attempt. The attempt is only created
// when the student clicks "Start Writing".
//
// This prevents students who just click "Enter Exam" on the 
// dashboard from having wasted IN_PROGRESS attempts.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/student/exams/[examId] - Preview exam before starting
export async function GET(
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

    // Check if the exam's scheduled start time has arrived
    if (exam.scheduledDate && new Date(exam.scheduledDate) > now) {
      return forbiddenResponse('Exam has not started yet')
    }

    // Calculate remaining time (for display purposes only)
    let examEndTime: Date | null = null
    if (exam.scheduledDate) {
      examEndTime = new Date(exam.scheduledDate.getTime() + exam.duration * 60 * 1000)
    }
    if (exam.endDate && examEndTime) {
      examEndTime = examEndTime < exam.endDate ? examEndTime : exam.endDate
    } else if (exam.endDate) {
      examEndTime = exam.endDate
    }

    let remainingSeconds = exam.duration * 60
    if (examEndTime) {
      remainingSeconds = Math.max(0, Math.floor((examEndTime.getTime() - now.getTime()) / 1000))
    }

    if (remainingSeconds <= 0) {
      return forbiddenResponse('The scheduled exam time has ended.')
    }

    // Check if student already has a submitted/graded attempt (blocked)
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId,
        studentId: user.id
      },
      orderBy: { startedAt: 'desc' }
    })

    if (existingAttempt && (existingAttempt.status === 'SUBMITTED' || existingAttempt.status === 'GRADED')) {
      return forbiddenResponse('You have already submitted this exam')
    }

    return NextResponse.json({
      success: true,
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
              tolerance: sq.tolerance
            })) : undefined
          }
        })
      }
    })
  } catch (error) {
    console.error('Exam preview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}