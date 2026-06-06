import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['LECTURER'])
    if (!user) return unauthorizedResponse()
    if (!user.isHod || !user.department) {
      return NextResponse.json({ error: 'Not authorized as HOD' }, { status: 403 })
    }

    const department = user.department

    // Find the program matching this HOD's department
    const program = await prisma.program.findFirst({
      where: { name: { contains: department, mode: 'insensitive' }, isActive: true }
    })

    // Get all exam attempts in the department's program
    const examAttempts = program ? await prisma.examAttempt.findMany({
      where: {
        exam: {
          module: { programId: program.id }
        }
      },
      select: {
        id: true,
        tabSwitchCount: true,
        fullscreenViolations: true,
        faceDetectionWarnings: true,
        suspiciousActivity: true,
        studentId: true,
        examId: true,
        exam: {
          select: {
            title: true,
            module: { select: { code: true, name: true } }
          }
        },
        student: {
          select: { name: true, userId: true, registrationNumber: true }
        },
        antiCheatLogs: {
          select: {
            violationType: true,
            details: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) : []

    // Calculate department-level stats
    const totalAttempts = examAttempts.length
    const totalTabSwitches = examAttempts.reduce((sum, a) => sum + a.tabSwitchCount, 0)
    const totalFullscreenExits = examAttempts.reduce((sum, a) => sum + a.fullscreenViolations, 0)
    const totalFaceWarnings = examAttempts.reduce((sum, a) => sum + a.faceDetectionWarnings, 0)
    const totalSuspicious = examAttempts.filter(a => a.suspiciousActivity).length

    // Students with violations
    const studentViolations: Record<string, { name: string; id: string; reg: string; tabSwitches: number; fullscreen: number; faceWarnings: number; suspicious: boolean; attempts: number }> = {}
    
    examAttempts.forEach(a => {
      const key = a.studentId
      if (!studentViolations[key]) {
        studentViolations[key] = {
          name: a.student.name,
          id: a.student.userId,
          reg: a.student.registrationNumber || '',
          tabSwitches: 0,
          fullscreen: 0,
          faceWarnings: 0,
          suspicious: false,
          attempts: 0
        }
      }
      studentViolations[key].tabSwitches += a.tabSwitchCount
      studentViolations[key].fullscreen += a.fullscreenViolations
      studentViolations[key].faceWarnings += a.faceDetectionWarnings
      if (a.suspiciousActivity) studentViolations[key].suspicious = true
      studentViolations[key].attempts++
    })

    // Calculate integrity scores for students
    const studentScores = Object.values(studentViolations).map(s => {
      const totalViolations = s.tabSwitches + s.fullscreen + s.faceWarnings
      // Score: 100 - (violations per attempt * penalty)
      const penaltyPerViolation = 5
      const violationsPerAttempt = s.attempts > 0 ? totalViolations / s.attempts : 0
      const score = Math.max(0, Math.min(100, Math.round(100 - (violationsPerAttempt * penaltyPerViolation))))
      return {
        name: s.name,
        userId: s.id,
        registrationNumber: s.reg,
        integrityScore: score,
        totalViolations,
        tabSwitches: s.tabSwitches,
        fullscreenViolations: s.fullscreen,
        faceWarnings: s.faceWarnings,
        suspicious: s.suspicious,
        attempts: s.attempts
      }
    }).sort((a, b) => a.integrityScore - b.integrityScore)

    // Most common violation types
    const violationTypeCount: Record<string, number> = {}
    examAttempts.forEach(a => {
      a.antiCheatLogs.forEach(log => {
        const type = log.violationType
        violationTypeCount[type] = (violationTypeCount[type] || 0) + 1
      })
    })

    const violationTypes = Object.entries(violationTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    // Get the 10 students with highest violations
    const topViolators = studentScores.slice(0, 10)

    // Detailed violations list for reports
    const violationsList = examAttempts
      .filter(a => a.tabSwitchCount > 0 || a.fullscreenViolations > 0 || a.faceDetectionWarnings > 0 || a.suspiciousActivity)
      .slice(0, 50)
      .map(a => ({
        studentName: a.student.name,
        studentId: a.student.userId,
        registrationNumber: a.student.registrationNumber,
        examTitle: a.exam.title,
        moduleCode: a.exam.module?.code || '',
        moduleName: a.exam.module?.name || '',
        tabSwitches: a.tabSwitchCount,
        fullscreenViolations: a.fullscreenViolations,
        faceWarnings: a.faceDetectionWarnings,
        suspicious: a.suspiciousActivity
      }))

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalExamsConducted: totalAttempts,
          totalViolations: totalTabSwitches + totalFullscreenExits + totalFaceWarnings,
          tabSwitchingIncidents: totalTabSwitches,
          fullscreenExits: totalFullscreenExits,
          faceDetectionWarnings: totalFaceWarnings,
          suspiciousBehaviorAlerts: totalSuspicious,
          studentsWithViolations: studentScores.filter(s => s.totalViolations > 0).length,
          totalStudentsTracked: Object.keys(studentViolations).length
        },
        violationTypes,
        studentScores,
        topViolators,
        violationsList
      }
    })

  } catch (error) {
    console.error('Department integrity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}