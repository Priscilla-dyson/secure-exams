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
  const [showAllPast, setShowAllPast] = useState(false)
  const [showAllDeptExams, setShowAllDeptExams] = useState(false)
  const [assignedModules, setAssignedModules] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [isHod, setIsHod] = useState(false)
  const [departmentActivities, setDepartmentActivities] = useState<any>(null)
  const [loadingDept, setLoadingDept] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser || JSON.parse(currentUser).role !== 'LECTURER') {
        router.replace('/login')
        return
      }
      const parsed = JSON.parse(currentUser)
      setUser(parsed)
      // Check if HOD from URL param (set on login redirect) or from user data
      const urlParams = new URLSearchParams(window.location.search)
      const hodParam = urlParams.get('hod')
      setIsHod(parsed.isHod === true || hodParam === 'true')
    }
    Promise.all([fetchExams(), fetchModules(), fetchResults()])
    setIsLoading(false)
  }, [router])

  // If HOD, also fetch department data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hodParam = urlParams.get('hod')
    if (user?.isHod === true || hodParam === 'true') {
      fetchDepartmentActivities()
      fetchDepartmentOverview()
    }
  }, [user])

  const [departmentOverview, setDepartmentOverview] = useState<any>(null)

  const fetchDepartmentOverview = async () => {
    try {
      const res = await fetch('/api/lecturer/department?type=overview')
      const data = await res.json()
      if (data.success) {
        setDepartmentOverview(data.data)
      }
    } catch (e) {
      console.error('Error fetching department overview:', e)
    }
  }

  const fetchDepartmentActivities = async () => {
    setLoadingDept(true)
    try {
      const res = await fetch('/api/lecturer/department?type=activities')
      const data = await res.json()
      if (data.success) {
        setDepartmentActivities(data.data)
      }
    } catch (e) {
      console.error('Error fetching department activities:', e)
    } finally {
      setLoadingDept(false)
    }
  }

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

      {/* Unified stat cards: personal lecturer info for ALL users */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">My Modules</span>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{assignedModules.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">My Exams</span>
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
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Completed Exams</h3>
            {pastExams.length > 5 && (
              <button
                onClick={() => setShowAllPast(!showAllPast)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {showAllPast ? 'Show Less' : `View All (${pastExams.length})`}
              </button>
            )}
          </div>
          <div className="divide-y divide-border">
            {(showAllPast ? pastExams : pastExams.slice(0, 5)).map((exam) => (
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

      {/* HOD Department Activities Section */}
      {isHod && (
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5">
          <div className="px-4 py-3 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {departmentActivities?.department || 'Department'} - All Activities
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overview of everything happening in your department
                </p>
              </div>
              <Link href="/lecturer/department-exams">
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View All Department Exams
                </Button>
              </Link>
            </div>
          </div>

          {loadingDept ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
            </div>
          ) : departmentActivities ? (
            <div className="divide-y divide-border">
              {/* Activity Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                <div className="bg-white rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{departmentActivities.activities.totalExams}</p>
                  <p className="text-xs text-muted-foreground">Total Exams</p>
                </div>
                <div className="bg-white rounded-lg border border-green-200 p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{departmentActivities.activities.activeExams}</p>
                  <p className="text-xs text-muted-foreground">Active/Scheduled</p>
                </div>
                <div className="bg-white rounded-lg border border-amber-200 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{departmentActivities.activities.pendingGrading}</p>
                  <p className="text-xs text-muted-foreground">Pending Grading</p>
                </div>
                <div className="bg-white rounded-lg border border-blue-200 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{departmentActivities.activities.activeStudents}</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
              </div>

              {/* Recent Exams Table */}
              {departmentActivities.exams && departmentActivities.exams.length > 0 && (
                <>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Showing {(showAllDeptExams ? departmentActivities.exams.length : Math.min(8, departmentActivities.exams.length))} of {departmentActivities.exams.length} exams
                    </p>
                    {departmentActivities.exams.length > 8 && (
                      <button
                        onClick={() => setShowAllDeptExams(!showAllDeptExams)}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {showAllDeptExams ? 'Show Less' : `View All (${departmentActivities.exams.length})`}
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Exam</th>
                          <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Module</th>
                          <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Creator</th>
                          <th className="px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                          <th className="px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Attempts</th>
                          <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Questions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(showAllDeptExams ? departmentActivities.exams : departmentActivities.exams.slice(0, 8)).map((exam: any) => (
                        <tr key={exam.id} className="hover:bg-accent/50">
                          <td className="px-4 py-2.5 text-sm text-foreground">{exam.title}</td>
                          <td className="px-4 py-2.5 text-sm text-muted-foreground">{exam.module?.code}</td>
                          <td className="px-4 py-2.5 text-sm text-muted-foreground">{exam.creator?.name}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              exam.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                              exam.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                              exam.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                              exam.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {exam.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-center text-foreground">{exam._count?.examAttempts || 0}</td>
                          <td className="px-4 py-2.5 text-sm text-right text-foreground">{exam._count?.questions || 0}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Could not load department data. Make sure you are assigned as HOD of a department.</p>
            </div>
          )}
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