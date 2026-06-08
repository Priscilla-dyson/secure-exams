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

    // Get all attempts for this exam with full violation data and anti-cheat logs
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
        },
        antiCheatLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    // Build a map of student IDs that have attempted
    const attemptedStudentIds = new Set(attempts.map(a => a.studentId))

    // Deduplicate attempts - if a student has multiple attempts, keep only the most recent significant one
    // Priority: GRADED > SUBMITTED > IN_PROGRESS
    const deduplicatedAttempts: typeof attempts = []
    const studentAttemptMap = new Map<string, typeof attempts[0]>()
    
    for (const attempt of attempts) {
      const existing = studentAttemptMap.get(attempt.studentId)
      if (!existing) {
        studentAttemptMap.set(attempt.studentId, attempt)
      } else {
        // Priority: GRADED > SUBMITTED > IN_PROGRESS
        const priorityOrder: Record<string, number> = { 'GRADED': 3, 'SUBMITTED': 2, 'IN_PROGRESS': 1, 'ABSENT': 0 }
        const existingPriority = priorityOrder[existing.status] || 0
        const newPriority = priorityOrder[attempt.status] || 0
        if (newPriority > existingPriority) {
          studentAttemptMap.set(attempt.studentId, attempt)
        }
        // If the old (duplicate) IN_PROGRESS attempt is being replaced by a SUBMITTED/GRADED one,
        // also clean up the IN_PROGRESS attempt's anti-cheat logs to avoid orphaned data
        if (newPriority > existingPriority && existing.status === 'IN_PROGRESS') {
          try {
            // Delete the old IN_PROGRESS attempt since there's a newer submitted one
            await prisma.examAttempt.deleteMany({
              where: {
                id: existing.id,
                status: 'IN_PROGRESS'
              }
            })
          } catch (e) {
            // Non-critical cleanup, ignore errors
          }
        }
      }
    }
    
    deduplicatedAttempts.push(...studentAttemptMap.values())

    // Add students who haven't attempted as "absent" entries
    const presentStudentIds = new Set(deduplicatedAttempts.map(a => a.studentId))
    const absentStudents = studentsInClass
      .filter(s => !presentStudentIds.has(s.id))
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
      attempts: [...deduplicatedAttempts, ...absentStudents],
      className: exam.module.class?.name || 'Unknown'
    })
  } catch (error) {
    console.error('Error fetching exam attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}