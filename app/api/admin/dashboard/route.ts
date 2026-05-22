import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    // ============ STATS ============
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } })
    const totalLecturers = await prisma.user.count({ where: { role: 'LECTURER' } })
    const totalExams = await prisma.exam.count()
    const activeExams = await prisma.exam.count({ where: { status: 'ACTIVE' } })
    const totalClasses = await prisma.class.count()
    const totalModules = await prisma.module.count()
    const totalResults = await prisma.result.count()
    const totalAttempts = await prisma.examAttempt.count()

    // Users by status
    const activeUsers = await prisma.user.count({ where: { status: 'active' } })
    const suspendedUsers = await prisma.user.count({ where: { status: 'suspended' } })

    // ============ RECENT LOGINS (last 20) ============
    const recentLogins = await prisma.systemLog.findMany({
      where: { type: 'AUTH', action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    // ============ RECENT USER ACTIVITY (last 20) ============
    const recentUserActivity = await prisma.systemLog.findMany({
      where: { type: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    // ============ RECENT EXAM ACTIVITY (last 20) ============
    const recentExamActivity = await prisma.examAttempt.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        exam: { select: { id: true, title: true } },
        student: { select: { id: true, name: true } }
      }
    })

    // ============ RECENT SECURITY EVENTS ============
    const recentSecurityEvents = await prisma.systemLog.findMany({
      where: { type: 'SECURITY' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    // Recent suspicious exam attempts
    const recentSuspicious = await prisma.examAttempt.findMany({
      where: { suspiciousActivity: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        exam: { select: { id: true, title: true } },
        student: { select: { id: true, name: true, email: true } }
      }
    })

    // ============ ALERTS ============
    const failedLogins = await prisma.systemLog.count({
      where: { type: 'AUTH', action: 'LOGIN_FAILED' }
    })
    const suspiciousAttempts = await prisma.examAttempt.count({
      where: { suspiciousActivity: true }
    })
    const recentFailedLogins = await prisma.systemLog.count({
      where: { type: 'AUTH', action: 'LOGIN_FAILED', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    })

    // ============ SYSTEM TOTALS ============
    const totalLogEntries = await prisma.systemLog.count()
    const todayLogEntries = await prisma.systemLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    })

    return NextResponse.json({
      success: true,
      data: {
        // Stats
        totalStudents,
        totalLecturers,
        totalExams,
        activeExams,
        totalClasses,
        totalModules,
        totalResults,
        totalAttempts,
        activeUsers,
        suspendedUsers,
        totalLogEntries,
        todayLogEntries,

        // Timeline data
        recentLogins,
        recentUserActivity,
        recentExamActivity,
        recentSecurityEvents,
        recentSuspicious,

        // Alerts
        alerts: {
          failedLogins,
          suspiciousAttempts,
          recentFailedLogins
        }
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}