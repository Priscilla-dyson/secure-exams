import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { autoMark, canAutoMark, aggregateSubQuestionMarks } from '@/lib/marking'

// POST /api/marking/auto - Auto-mark a student's answer
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { answerId } = body

    if (!answerId) {
      return NextResponse.json(
        { error: 'Answer ID is required' },
        { status: 400 }
      )
    }

    // Get the student answer with question details
    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          include: {
            options: { orderBy: { order: 'asc' } },
            subQuestions: {
              include: { options: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' }
            },
            parent: true
          }
        },
        attempt: {
          include: {
            exam: true
          }
        }
      }
    })

    if (!studentAnswer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    const question = studentAnswer.question

    // Check if auto-markable
    if (!canAutoMark(question.category)) {
      return NextResponse.json(
        { error: `Question category "${question.category}" cannot be auto-marked` },
        { status: 400 }
      )
    }

    // For structured questions, auto-mark each sub-question
    if (question.category === 'STRUCTURED' && question.subQuestions.length > 0) {
      // Get all student answers for sub-questions
      const subAnswers = await prisma.studentAnswer.findMany({
        where: {
          attemptId: studentAnswer.attemptId,
          question: {
            parentId: question.id
          }
        },
        include: {
          question: {
            include: { options: { orderBy: { order: 'asc' } } }
          }
        }
      })

      const subResults = subAnswers.map(sa => {
        return autoMark(
          sa.question.category,
          sa.selectedOptionId || sa.answer,
          sa.question.correctAnswer || sa.question.mathAnswer,
          sa.question.options,
          {
            marks: sa.question.marks,
            tolerance: sa.question.tolerance || undefined,
            caseSensitive: sa.question.caseSensitive,
            maxLength: sa.question.maxLength || undefined
          }
        )
      })

      const aggregated = aggregateSubQuestionMarks(subResults)

      // Update the structured question answer
      await prisma.studentAnswer.update({
        where: { id: answerId },
        data: {
          autoMarked: aggregated.autoMarked,
          autoMarkScore: aggregated.autoMarked ? aggregated.percentage / 100 : null,
          autoMarkDetails: aggregated,
          marks: aggregated.score,
          isCorrect: aggregated.isCorrect
        }
      })

      return NextResponse.json({
        success: true,
        markingResult: aggregated,
        subResults
      })
    }

    // Auto-mark a single question
    const config = {
      marks: question.marks,
      tolerance: question.tolerance || undefined,
      caseSensitive: question.caseSensitive,
      maxLength: question.maxLength || undefined,
      markingRules: question.markingRules as any || undefined
    }

    const result = autoMark(
      question.category,
      studentAnswer.selectedOptionId || studentAnswer.answer,
      question.correctAnswer || question.mathAnswer,
      question.options,
      config
    )

    // Update the student answer with auto-marking results
    await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        autoMarked: result.autoMarked,
        autoMarkScore: result.autoMarked ? result.percentage / 100 : null,
        autoMarkDetails: result as any,
        marks: result.score,
        isCorrect: result.isCorrect
      }
    })

    return NextResponse.json({
      success: true,
      markingResult: result
    })
  } catch (error) {
    console.error('Auto-marking error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-mark answer' },
      { status: 500 }
    )
  }
}

// PUT /api/marking/auto - Auto-mark all unanswered questions in an attempt
export async function PUT(request: NextRequest) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { attemptId } = body

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      )
    }

    // Get all unanswered questions in this attempt
    const unanswered = await prisma.studentAnswer.findMany({
      where: {
        attemptId,
        autoMarked: false,
        marks: null
      },
      include: {
        question: {
          include: { options: { orderBy: { order: 'asc' } } }
        }
      }
    })

    const results = []
    for (const studentAnswer of unanswered) {
      const question = studentAnswer.question

      if (!canAutoMark(question.category)) {
        if (question.requiresManualMarking) {
          continue
        }
        // Attempt auto-marking anyway
      }

      const config = {
        marks: question.marks,
        tolerance: question.tolerance || undefined,
        caseSensitive: question.caseSensitive,
        maxLength: question.maxLength || undefined
      }

      const result = autoMark(
        question.category,
        studentAnswer.selectedOptionId || studentAnswer.answer,
        question.correctAnswer || question.mathAnswer,
        question.options,
        config
      )

      if (result.autoMarked) {
        await prisma.studentAnswer.update({
          where: { id: studentAnswer.id },
          data: {
            autoMarked: true,
            autoMarkScore: result.percentage / 100,
            autoMarkDetails: result as any,
            marks: result.score,
            isCorrect: result.isCorrect
          }
        })
        results.push({ answerId: studentAnswer.id, result })
      }
    }

    return NextResponse.json({
      success: true,
      autoMarked: results.length,
      total: unanswered.length,
      results
    })
  } catch (error) {
    console.error('Batch auto-marking error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-mark answers' },
      { status: 500 }
    )
  }
}