import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, unauthorizedResponse } from '@/lib/middleware'

// GET /api/lecturer/modules - Get all modules assigned to the logged-in lecturer
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()
    if (user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Only lecturers can access this' }, { status: 403 })
    }

    const modules = await prisma.module.findMany({
      where: { lecturerId: user.id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            year: true
          }
        },
        program: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { exams: true }
        }
      },
      orderBy: [{ program: { name: 'asc' } }, { name: 'asc' }]
    })

    return NextResponse.json({ success: true, modules })
  } catch (error) {
    console.error('Get lecturer modules error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}