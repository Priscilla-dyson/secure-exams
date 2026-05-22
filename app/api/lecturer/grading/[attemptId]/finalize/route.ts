import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/lecturer/grading/[attemptId]/finalize - Finalize grading for an attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])
    if (!user) return unauthorizedResponse()

    const { attemptId } = await params

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            creatorId: true,
            passingMarks: true,
            module: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Lecturers can only finalize their own exams
    if (user.role === 'LECTURER' && attempt.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to finalize grading for this attempt')
    }

    // Check if all questions have been graded
    const ungradedAnswers = attempt.answers.filter(a => a.marks === null)
    if (ungradedAnswers.length > 0) {
      return NextResponse.json({
        error: 'Cannot finalize grading',
        details: `${ungradedAnswers.length} question(s) still need to be graded`,
        ungradedCount: ungradedAnswers.length
      }, { status: 400 })
    }

    // Calculate total score from all graded answers
    let totalScore = 0
    for (const answer of attempt.answers) {
      totalScore += answer.marks || 0
    }

    const totalMarks = attempt.exam.totalMarks
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0

    // Determine grade
    let grade: string
    if (percentage >= 75) grade = 'A'
    else if (percentage >= 70) grade = 'B+'
    else if (percentage >= 60) grade = 'B'
    else if (percentage >= 50) grade = 'C'
    else grade = 'F'

    // Update attempt status to GRADED and set score
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'GRADED',
        score: totalScore,
        totalMarks: totalMarks
      }
    })

    // Update or create the Result record
    const result = await prisma.result.upsert({
      where: { attemptId },
      create: {
        attemptId,
        studentId: attempt.studentId,
        examId: attempt.examId,
        score: totalScore,
        totalMarks: totalMarks,
        percentage,
        grade,
        published: false
      },
      update: {
        score: totalScore,
        totalMarks: totalMarks,
        percentage,
        grade,
        published: false
      }
    })

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      result,
      score: totalScore,
      totalMarks,
      percentage,
      grade
    })
  } catch (error) {
    console.error('Error finalizing grading:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}