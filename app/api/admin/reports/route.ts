import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'examination'

    const result: any = { success: true }

    if (type === 'examination') {
      // Total exams
      const totalExams = await prisma.exam.count()

      // Exams that have results (completed + have result records)
      const completedExams = await prisma.exam.count({ where: { status: 'COMPLETED' } })

      // Results with scores
      const results = await prisma.result.findMany({
        include: { exam: { select: { passingMarks: true, totalMarks: true } } }
      })

      const totalResults = results.length
      const passedResults = results.filter(r => r.score >= r.exam.passingMarks).length
      const passRate = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0

      // Average score
      const avgScore = totalResults > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalResults)
        : 0

      // Completion rate
      const totalAttempts = await prisma.examAttempt.count()
      const submittedAttempts = await prisma.examAttempt.count({ where: { status: 'SUBMITTED' } })
      const completionRate = totalAttempts > 0 ? Math.round((submittedAttempts / totalAttempts) * 100) : 0

      result.data = {
        stats: [
          { title: 'Total Exams', value: totalExams, icon: 'FileText' },
          { title: 'Pass Rate', value: `${passRate}%`, icon: 'TrendingUp' },
          { title: 'Average Score', value: `${avgScore}%`, icon: 'BarChart3' },
          { title: 'Completion Rate', value: `${completionRate}%`, icon: 'CheckCircle' }
        ],
        passRate,
        avgScore,
        completionRate
      }
    } else if (type === 'student') {
      // Student performance
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: {
          id: true,
          name: true,
          email: true,
          results: {
            include: { exam: { select: { title: true, passingMarks: true } } }
          }
        }
      })

      const studentStats = students.map(s => {
        const passed = s.results.filter(r => r.score >= r.exam.passingMarks).length
        const failed = s.results.length - passed
        const avgScore = s.results.length > 0
          ? Math.round(s.results.reduce((sum, r) => sum + r.percentage, 0) / s.results.length)
          : 0
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          totalExams: s.results.length,
          passed,
          failed,
          avgScore
        }
      }).sort((a, b) => b.avgScore - a.avgScore)

      result.data = { students: studentStats }
    } else if (type === 'integrity') {
      // Integrity data from ExamAttempt suspicious flags
      const suspiciousAttempts = await prisma.examAttempt.findMany({
        where: { suspiciousActivity: true },
        include: {
          student: { select: { id: true, name: true, email: true } },
          exam: { select: { id: true, title: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50
      })

      const totalSuspicious = await prisma.examAttempt.count({ where: { suspiciousActivity: true } })
      const totalTabSwitches = await prisma.examAttempt.aggregate({ _sum: { tabSwitchCount: true } })
      const totalFaceWarnings = await prisma.examAttempt.aggregate({ _sum: { faceDetectionWarnings: true } })

      // Failed logins
      const failedLogins = await prisma.systemLog.count({
        where: { type: 'AUTH', action: 'LOGIN_FAILED' }
      })

      result.data = {
        stats: [
          { title: 'Suspicious Attempts', value: totalSuspicious, icon: 'AlertTriangle' },
          { title: 'Tab Switches', value: totalTabSwitches._sum.tabSwitchCount || 0, icon: 'AlertTriangle' },
          { title: 'Face Warnings', value: totalFaceWarnings._sum.faceDetectionWarnings || 0, icon: 'AlertTriangle' },
          { title: 'Failed Logins', value: failedLogins, icon: 'XCircle' }
        ],
        incidents: suspiciousAttempts
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}