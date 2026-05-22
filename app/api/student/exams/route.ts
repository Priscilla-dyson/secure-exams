import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/student/exams - Get exams for the logged-in student (filtered by their class)
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['STUDENT'])

    if (!user) {
      return unauthorizedResponse()
    }

    // Only show exams for modules in the student's class
    if (!user.classId) {
      return NextResponse.json({ success: true, exams: [] })
    }

    const now = new Date()

    // Get the student's class modules - show ALL published exams
    const exams = await prisma.exam.findMany({
      where: {
        published: true,
        module: {
          classId: user.classId
        }
      },
      include: {
        module: {
          select: {
            id: true,
            name: true,
            code: true,
            class: {
              select: {
                id: true,
                name: true
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

        // Determine if exam was missed (COMPLETED and no attempt, or end date passed and no attempt)
        const endDate = exam.endDate
        let isMissed = false
        
        if (!attempt) {
          if (exam.status === 'COMPLETED') {
            isMissed = true
          } else if (endDate && new Date(endDate) < now && exam.status !== 'DRAFT') {
            isMissed = true
          } else if (exam.scheduledDate) {
            const examEndTime = new Date(exam.scheduledDate.getTime() + exam.duration * 60000)
            if (examEndTime < now && exam.status !== 'DRAFT') {
              isMissed = true
            }
          }
        }

        return {
          ...exam,
          hasAttempted: !!attempt,
          attemptStatus: attempt?.status || (isMissed ? 'missed' : null)
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