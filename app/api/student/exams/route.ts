import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/student/exams - Get scheduled exams for student
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['STUDENT'])

    if (!user) {
      return unauthorizedResponse()
    }

    const exams = await prisma.exam.findMany({
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
        }
      },
      orderBy: { scheduledDate: 'asc' }
    })

    // Check if student has already attempted each exam
    const examsWithAttemptStatus = await Promise.all(
      exams.map(async (exam) => {
        const attempt = await prisma.examAttempt.findFirst({
          where: {
            examId: exam.id,
            studentId: user.id
          }
        })

        return {
          ...exam,
          hasAttempted: !!attempt,
          attemptStatus: attempt?.status
        }
      })
    )

    return NextResponse.json({ success: true, exams: examsWithAttemptStatus })
  } catch (error) {
    console.error('Get student exams error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
