"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  BarChart3,
  Calendar,
  Users,
  GraduationCap,
  PlayCircle,
  FileEdit,
  Award,
  TrendingUp
} from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout';

export default function LecturerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const stats = {
    totalModules: 0,
    totalExams: 0,
    pendingGrading: 0,
    resultsReleased: 0
  }

  const upcomingExams: any[] = []
  const activeExams: any[] = []
  const draftExams: any[] = []
  const completedExams: any[] = []
  const notifications: any[] = []

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser || JSON.parse(currentUser).role !== 'lecturer') {
        router.replace('/login')
        return
      }
      setUser(JSON.parse(currentUser))
    }
    setIsLoading(false)
  }, [router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Total Modules
            </p>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{stats.totalModules}</p>
          <p className="mt-1 text-xs text-muted-foreground">Active this semester</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Total Exams
            </p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{stats.totalExams}</p>
          <p className="mt-1 text-xs text-muted-foreground">All time</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Pending Grading
            </p>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{stats.pendingGrading}</p>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Results Released
            </p>
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{stats.resultsReleased}</p>
          <p className="mt-1 text-xs text-muted-foreground">Published</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Exams */}
        <div className="lg:col-span-2">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Upcoming Exams
              </h2>
              <Link href="/lecturer/exam-management" className="text-xs text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingExams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No upcoming exams scheduled</p>
                </div>
              ) : (
                upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{exam.module}</p>
                      <p className="text-xs text-muted-foreground">{exam.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{exam.date}</p>
                      <p className="text-xs text-muted-foreground">{exam.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Active Exams */}
        <div>
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Active Exams
              </h2>
            </div>
            <div className="space-y-3">
              {activeExams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No active exams</p>
                </div>
              ) : (
                activeExams.map((exam) => (
                  <div key={exam.id} className="rounded-md border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                      <span className="text-xs font-medium text-success">LIVE</span>
                      <span className="text-xs text-muted-foreground">{exam.endTime}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{exam.module}</p>
                    <p className="text-xs text-muted-foreground">{exam.type}</p>
                    <p className="text-xs text-muted-foreground mt-2">{exam.activeStudents} students</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Quick Actions
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/lecturer/exam-management">
            <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Create Exam</p>
                <p className="text-xs text-muted-foreground">New examination</p>
              </div>
            </div>
          </Link>
          <Link href="/lecturer/question-bank">
            <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <FileEdit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Manage Questions</p>
                <p className="text-xs text-muted-foreground">Question bank</p>
              </div>
            </div>
          </Link>
          <Link href="/lecturer/submissions">
            <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Grade Submissions</p>
                <p className="text-xs text-muted-foreground">Review answers</p>
              </div>
            </div>
          </Link>
          <Link href="/lecturer/results">
            <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">View Results</p>
                <p className="text-xs text-muted-foreground">Analytics</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Notifications */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Recent Notifications
          </h2>
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No new notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  notification.type === 'alert' ? 'bg-destructive/10' : 'bg-primary/10'
                }`}>
                  <AlertCircle className={`h-4 w-4 ${
                    notification.type === 'alert' ? 'text-destructive' : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{notification.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </div>
    </SidebarLayout>
  )
}
