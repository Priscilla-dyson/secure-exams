import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const { examId } = await params

    // Verify exam exists and belongs to this lecturer (or is in their department for HOD)
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        module: {
          include: {
            class: { select: { id: true, name: true } },
            program: { select: { id: true, name: true, departmentId: true } }
          }
        },
        creator: { select: { id: true, name: true, departmentId: true } }
      }
    })

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Check access: must be exam creator, admin, or HOD of same department
    const isCreator = exam.creatorId === user.id
    const isHod = user.isHod === true
    const sameDept = user.departmentId && (exam.creator.departmentId === user.departmentId || exam.module.program.departmentId === user.departmentId)
    
    if (!isCreator && user.role !== 'ADMIN' && !(isHod && sameDept)) {
      return NextResponse.json({ error: 'Not authorized to view this exam' }, { status: 403 })
    }

    // Get all attempts that are SUBMITTED or GRADED (completed attempts)
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        status: { in: ['SUBMITTED', 'GRADED'] }
      },
      select: { id: true, studentId: true }
    })

    const attemptIds = attempts.map(a => a.id)
    const totalAttempts = attempts.length

    // Get all questions for this exam
    const questions = await prisma.question.findMany({
      where: { examId },
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
    })

    // For each question, get the student answers and compute stats
    const questionPerformance = await Promise.all(questions.map(async (question) => {
      // For STRUCTURED questions, analyze sub-questions
      if (question.category === 'STRUCTURED' || (question.subQuestions && question.subQuestions.length > 0)) {
        const subQuestionStats = await Promise.all((question.subQuestions || []).map(async (sq) => {
          const answers = await prisma.studentAnswer.findMany({
            where: {
              attemptId: { in: attemptIds },
              questionId: sq.id
            },
            select: {
              id: true,
              marks: true,
              isCorrect: true,
              answer: true,
              selectedOptionId: true
            }
          })

          const answered = answers.filter(a => a.answer !== null && a.answer !== '' || a.selectedOptionId !== null)
          const correct = answers.filter(a => a.isCorrect === true || (a.marks !== null && a.marks > 0))
          const wrong = answers.filter(a => (a.isCorrect === false) || (a.marks !== null && a.marks === 0))
          const noAnswer = answers.filter(a => (a.answer === null || a.answer === '') && a.selectedOptionId === null)

          // Average score
          const totalMarksEarned = answers.reduce((sum, a) => sum + (a.marks || 0), 0)
          const avgScore = totalAttempts > 0 ? (totalMarksEarned / totalAttempts) : 0

          // NOTE: For HODs and Admins, question text is included here because
          // performance analytics requires context about which questions performed poorly.
          // This is analytical data, not pre-exam question leaks.
          return {
            id: sq.id,
            text: sq.text,
            order: sq.order,
            category: sq.category,
            marks: sq.marks,
            stats: {
              totalStudents: totalAttempts,
              answered: answered.length,
              correct: correct.length,
              wrong: wrong.length,
              noAnswer: noAnswer.length,
              avgScore: Math.round(avgScore * 100) / 100,
              passRate: totalAttempts > 0 ? Math.round((correct.length / totalAttempts) * 100) : 0,
              failRate: totalAttempts > 0 ? Math.round((wrong.length / totalAttempts) * 100) : 0,
              noAnswerRate: totalAttempts > 0 ? Math.round((noAnswer.length / totalAttempts) * 100) : 0,
            }
          }
        }))

        // Aggregate sub-question stats for the parent question
        const totalSubMarks = subQuestionStats.reduce((sum, sq) => sum + sq.marks, 0)
        const totalCorrect = subQuestionStats.reduce((sum, sq) => sum + sq.stats.correct, 0)
        const totalWrong = subQuestionStats.reduce((sum, sq) => sum + sq.stats.wrong, 0)
        const totalNoAnswer = subQuestionStats.reduce((sum, sq) => sum + sq.stats.noAnswer, 0)

        return {
          id: question.id,
          text: question.text,
          order: question.order,
          category: question.category,
          marks: question.marks,
          type: 'STRUCTURED',
          isParent: true,
          subQuestions: subQuestionStats,
          stats: {
            totalStudents: totalAttempts,
            answered: totalAttempts - totalNoAnswer,
            correct: totalCorrect,
            wrong: totalWrong,
            noAnswer: totalNoAnswer,
            avgScore: subQuestionStats.length > 0
              ? Math.round((subQuestionStats.reduce((s, sq) => s + sq.stats.avgScore, 0) / subQuestionStats.length) * 100) / 100
              : 0,
            passRate: totalAttempts > 0 ? Math.round((totalCorrect / (totalAttempts * subQuestionStats.length || 1)) * 100) : 0,
            failRate: totalAttempts > 0 ? Math.round((totalWrong / (totalAttempts * subQuestionStats.length || 1)) * 100) : 0,
            noAnswerRate: totalAttempts > 0 ? Math.round((totalNoAnswer / (totalAttempts * subQuestionStats.length || 1)) * 100) : 0,
          }
        }
      }

      // Non-structured question: get answers directly
      const answers = await prisma.studentAnswer.findMany({
        where: {
          attemptId: { in: attemptIds },
          questionId: question.id
        },
        select: {
          id: true,
          marks: true,
          isCorrect: true,
          answer: true,
          selectedOptionId: true
        }
      })

      const answered = answers.filter(a => 
        (a.answer !== null && a.answer !== '') || a.selectedOptionId !== null
      )
      const correct = answers.filter(a => 
        a.isCorrect === true || (a.marks !== null && a.marks !== undefined && a.marks > 0)
      )
      const wrong = answers.filter(a => 
        (a.isCorrect === false) || (a.marks !== null && a.marks === 0)
      )
      const noAnswer = answers.filter(a => 
        (a.answer === null || a.answer === '') && a.selectedOptionId === null
      )

      // For MCQ, track which options were selected
      let optionDistribution: { optionId: string; text: string; count: number; isCorrect: boolean }[] | undefined
      if (question.category === 'MULTIPLE_CHOICE' && question.options.length > 0) {
        const optionCounts: Record<string, { text: string; count: number; isCorrect: boolean }> = {}
        for (const opt of question.options) {
          optionCounts[opt.id] = { text: opt.text, count: 0, isCorrect: opt.isCorrect }
        }
        for (const ans of answers) {
          if (ans.selectedOptionId && optionCounts[ans.selectedOptionId]) {
            optionCounts[ans.selectedOptionId].count++
          }
        }
        optionDistribution = Object.entries(optionCounts).map(([optionId, data]) => ({
          optionId,
          text: data.text,
          count: data.count,
          isCorrect: data.isCorrect
        })).sort((a, b) => b.count - a.count)
      }

      const totalMarksEarned = answers.reduce((sum, a) => sum + (a.marks || 0), 0)
      const avgScore = totalAttempts > 0 ? (totalMarksEarned / totalAttempts) : 0

      return {
        id: question.id,
        text: question.text,
        order: question.order,
        category: question.category,
        marks: question.marks,
        type: question.type,
        options: question.options.map(o => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
        optionDistribution,
        stats: {
          totalStudents: totalAttempts,
          answered: answered.length,
          correct: correct.length,
          wrong: wrong.length,
          noAnswer: noAnswer.length,
          avgScore: Math.round(avgScore * 100) / 100,
          passRate: totalAttempts > 0 ? Math.round((correct.length / totalAttempts) * 100) : 0,
          failRate: totalAttempts > 0 ? Math.round((wrong.length / totalAttempts) * 100) : 0,
          noAnswerRate: totalAttempts > 0 ? Math.round((noAnswer.length / totalAttempts) * 100) : 0,
        }
      }
    }))

    // Overall exam stats
    const overallStats = {
      totalStudents: totalAttempts,
      totalQuestions: questions.length,
      averageScore: questionPerformance.length > 0
        ? Math.round((questionPerformance.reduce((sum, q) => sum + q.stats.avgScore, 0) / questionPerformance.length) * 100) / 100
        : 0,
      overallPassRate: questionPerformance.length > 0
        ? Math.round((questionPerformance.reduce((sum, q) => sum + q.stats.passRate, 0) / questionPerformance.length) * 100) / 100
        : 0,
      questionsWithLowPassRate: questionPerformance.filter(q => q.stats.passRate < 50).length,
    }

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          title: exam.title,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          module: { code: exam.module.code, name: exam.module.name },
          className: exam.module.class?.name
        },
        overallStats,
        questions: questionPerformance,
      }
    })
  } catch (error) {
    console.error('Question performance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}