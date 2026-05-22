import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/lecturer/grading/[attemptId] - Get all answers for an attempt for grading
export async function GET(
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
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true
          }
        },
        exam: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            creatorId: true,
            module: {
              select: { name: true, code: true }
            }
          }
        },
        answers: {
          include: {
            question: {
              include: {
                options: { orderBy: { order: 'asc' } }
              }
            }
          },
          orderBy: {
            question: { order: 'asc' }
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Lecturers can only grade their own exams
    if (user.role === 'LECTURER' && attempt.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to grade this attempt')
    }

    return NextResponse.json({ success: true, attempt })
  } catch (error) {
    console.error('Error fetching attempt for grading:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}