import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/exams - Get all exams (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    let exams

    if (user.role === 'LECTURER') {
      // Lecturers see their own exams
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
            select: {
              id: true,
              type: true,
              marks: true
            }
          },
          _count: {
            select: {
              examAttempts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (user.role === 'STUDENT') {
      // Students see published scheduled exams
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
      // Admins see all exams
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
          questions: {
            select: {
              id: true,
              type: true,
              marks: true
            }
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

    return NextResponse.json({ success: true, exams })
  } catch (error) {
    console.error('Get exams error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exams - Create a new exam (Lecturer only)
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

    if (!title || !moduleId || !duration) {
      return NextResponse.json(
        { error: 'Title, module, and duration are required' },
        { status: 400 }
      )
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
        scheduledTime,
        endDate: endDate ? new Date(endDate) : null,
        endTime,
        status: 'DRAFT'
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
      }
    })

    return NextResponse.json({ success: true, exam }, { status: 201 })
  } catch (error) {
    console.error('Create exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
