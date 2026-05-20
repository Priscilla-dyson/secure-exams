import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// POST /api/results/[id]/publish - Publish a result (Lecturer only)
export async function POST(
  request: NextRequest,
  context: any
) {
  const { params } = context
  try {
    const user = await authorize(request, ['LECTURER', 'ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const result = await prisma.result.findUnique({
      where: { id: params.id },
      include: {
        exam: true
      }
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    // Lecturers can only publish results for their own exams
    if (user.role === 'LECTURER' && result.exam.creatorId !== user.id) {
      return forbiddenResponse('Not authorized to publish this result')
    }

    const updatedResult = await prisma.result.update({
      where: { id: params.id },
      data: {
        published: true,
        publishedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, result: updatedResult })
  } catch (error) {
    console.error('Publish result error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
