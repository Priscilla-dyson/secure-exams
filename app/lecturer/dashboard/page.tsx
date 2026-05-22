"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle, 
  Plus,
  Eye,
  BarChart3,
  Calendar,
  FileEdit,
  ArrowRight
} from 'lucide-react'

export default function LecturerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [exams, setExams] = useState<any[]>([])
  const [assignedModules, setAssignedModules] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser || JSON.parse(currentUser).role !== 'LECTURER') {
        router.replace('/login')
        return
      }
      setUser(JSON.parse(currentUser))
    }
    Promise.all([fetchExams(), fetchModules(), fetchResults()])
    setIsLoading(false)
  }, [router])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      if (data.success) setExams(data.exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/lecturer/modules');
      const data = await response.json();
      if (data.success) setAssignedModules(data.modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      if (data.success) setResults(data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const now = new Date();
  const upcomingExams = exams.filter(e => 
    e.status === 'SCHEDULED' && e.scheduledDate && new Date(e.scheduledDate) > now
  );
  const activeExams = exams.filter(e => e.status === 'ACTIVE');
  const pastExams = exams.filter(e => 
    e.status === 'COMPLETED' || 
    (e.status === 'SCHEDULED' && e.scheduledDate && new Date(e.scheduledDate) < now)
  );

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Welcome back, <span className="font-medium text-foreground">{user?.name || 'Lecturer'}</span></p>
        <Link href="/lecturer/exam-management">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Exam</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Modules</span>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{assignedModules.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exams</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{exams.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drafts</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{exams.filter(e => e.status === 'DRAFT').length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Published</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{results.filter(r => r.published).length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Upcoming Exams</h3>
            <Link href="/lecturer/exam-management" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingExams.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming exams</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{exam.module?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{exam.title} &middot; {exam.duration} min</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {new Date(exam.scheduledDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Active Exams</h3>
          </div>
          {activeExams.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active exams</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeExams.map((exam) => (
                <div key={exam.id} className="px-4 py-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{exam.module?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{exam.title} &middot; {exam.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {pastExams.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Completed Exams</h3>
          </div>
          <div className="divide-y divide-border">
            {pastExams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{exam.module?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{exam.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">{exam._count?.examAttempts || 0} submissions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/lecturer/exam-management" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Create Exam</p>
            <p className="text-xs text-muted-foreground truncate">New examination</p>
          </div>
        </Link>
        <Link href="/lecturer/submissions" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Submissions</p>
            <p className="text-xs text-muted-foreground truncate">Grade answers</p>
          </div>
        </Link>
        <Link href="/lecturer/results" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Results</p>
            <p className="text-xs text-muted-foreground truncate">Analytics</p>
          </div>
        </Link>
        <Link href="/lecturer/profile" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <FileEdit className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Profile</p>
            <p className="text-xs text-muted-foreground truncate">Settings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}