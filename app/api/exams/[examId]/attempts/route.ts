import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const { examId } = await params

    // Get the exam with its module to know the class
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        module: {
          include: {
            class: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Get all students in the class for this module
    const studentsInClass = await prisma.user.findMany({
      where: {
        classId: exam.module.classId,
        role: 'STUDENT',
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        registrationNumber: true,
        class: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get all attempts for this exam with full violation data
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      orderBy: { startedAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true,
            classId: true,
            class: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    // Build a map of student IDs that have attempted
    const attemptedStudentIds = new Set(attempts.map(a => a.studentId))

    // Add students who haven't attempted as "absent" entries
    const absentStudents = studentsInClass
      .filter(s => !attemptedStudentIds.has(s.id))
      .map(s => ({
        id: `absent-${s.id}`,
        examId,
        studentId: s.id,
        status: 'ABSENT',
        startedAt: null,
        submittedAt: null,
        score: null,
        totalMarks: exam.totalMarks,
        tabSwitchCount: 0,
        fullscreenViolations: 0,
        faceDetectionWarnings: 0,
        suspiciousActivity: false,
        student: {
          id: s.id,
          name: s.name,
          email: s.email,
          registrationNumber: s.registrationNumber,
          classId: s.class?.id || null,
          class: s.class || null
        }
      }))

    return NextResponse.json({
      success: true,
      attempts: [...attempts, ...absentStudents],
      className: exam.module.class?.name || 'Unknown'
    })
  } catch (error) {
    console.error('Error fetching exam attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}