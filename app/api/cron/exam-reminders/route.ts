import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, examReminderEmail } from '@/lib/email'

// GET /api/cron/exam-reminders - Check for exams starting in ~3 hours and send reminders
// This can be called by an external cron job or via server-side interval
export async function GET() {
  try {
    const now = new Date()
    // Find exams starting between 2.5 and 3.5 hours from now
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    const twoPointFiveHoursFromNow = new Date(now.getTime() + 2.5 * 60 * 60 * 1000)

    const upcomingExams = await prisma.exam.findMany({
      where: {
        status: 'SCHEDULED',
        published: true,
        scheduledDate: {
          gte: twoPointFiveHoursFromNow,
          lte: threeHoursFromNow
        }
      },
      include: {
        module: {
          include: {
            class: {
              include: {
                students: {
                  where: { status: 'active' },
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      }
    })

    let remindersSent = 0

    for (const exam of upcomingExams) {
      const students = exam.module?.class?.students || []
      const startTime = exam.scheduledDate
        ? new Date(exam.scheduledDate).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
        : 'TBD'

      for (const student of students) {
        if (student.email) {
          const { subject, html } = examReminderEmail(
            student.name,
            exam.title,
            exam.module.name,
            startTime
          )
          const sent = await sendEmail(student.email, subject, html)
          if (sent) remindersSent++
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      examsFound: upcomingExams.length,
      message: `Sent ${remindersSent} reminder(s) for ${upcomingExams.length} exam(s)`
    })
  } catch (error) {
    console.error('Exam reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}