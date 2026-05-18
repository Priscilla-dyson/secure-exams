import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/results - Get results (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)

    if (!user) {
      return unauthorizedResponse()
    }

    let results

    if (user.role === 'STUDENT') {
      // Students see only their published results
      results = await prisma.result.findMany({
        where: {
          studentId: user.id,
          published: true
        },
        include: {
          exam: {
            include: {
              module: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (user.role === 'LECTURER') {
      // Lecturers see results for their exams
      results = await prisma.result.findMany({
        where: {
          exam: {
            creatorId: user.id
          }
        },
        include: {
          exam: {
            include: {
              module: true
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              registrationNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (user.role === 'ADMIN') {
      // Admins see all results
      results = await prisma.result.findMany({
        include: {
          exam: {
            include: {
              module: true
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              registrationNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
