'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Search,
  RefreshCw,
  Eye,
  Users,
  Loader2,
  FileText
} from 'lucide-react'

interface Exam {
  id: string
  title: string
  status: string
  duration: number
  module: { code: string; name: string }
  creator: { name: string; email: string }
  _count: { examAttempts: number }
}

interface Attempt {
  id: string
  status: string
  startedAt: string
  submittedAt: string | null
  student: { name: string; email: string }
}

export default function ExaminationOversight() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptsLoading, setAttemptsLoading] = useState(false)

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams')
      const data = await res.json()
      if (data.success) setExams(data.exams)
    } catch (err) {
      console.error('Error fetching exams:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttempts = async (examId: string) => {
    setAttemptsLoading(true)
    setSelectedExam(examId)
    try {
      const res = await fetch(`/api/exams/${examId}/attempts`)
      const data = await res.json()
      if (data.success) setAttempts(data.attempts)
    } catch (err) {
      console.error('Error fetching attempts:', err)
    } finally {
      setAttemptsLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const filteredExams = exams.filter(exam => {
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.module.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const activeExams = exams.filter(e => e.status === 'ACTIVE')

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-muted text-muted-foreground',
      SCHEDULED: 'bg-blue-100 text-blue-700',
      ACTIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-slate-100 text-slate-700',
      CANCELLED: 'bg-red-100 text-red-700'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex items-center justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={fetchExams}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-64 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Active Exam Monitoring (VIEW ONLY) */}
      {activeExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Active Exams
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {activeExams.map((exam) => (
              <div key={exam.id} className="rounded-md border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">{exam.module.code} — {exam.module.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Lecturer: {exam.creator.name}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Attempts</p>
                        <p className="text-sm font-medium text-foreground">{exam._count.examAttempts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium text-foreground">{exam.duration} min</p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title="View attempts"
                    onClick={() => fetchAttempts(exam.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* All Exams Table */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            All Examinations
          </h2>
          <div className="rounded-md border border-border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Module</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Lecturer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Attempts</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      </td>
                    </tr>
                  ) : filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center">
                        <p className="text-sm text-muted-foreground">No examinations found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-accent/50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-foreground">{exam.title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-foreground">{exam.module.code}</p>
                          <p className="text-xs text-muted-foreground">{exam.module.name}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground">{exam.creator.name}</td>
                        <td className="px-4 py-4 text-sm text-foreground">{exam._count.examAttempts}</td>
                        <td className="px-4 py-4">{getStatusBadge(exam.status)}</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            className="p-1 text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                            title="View attempt logs"
                            onClick={() => fetchAttempts(exam.id)}
                          >
                            <Eye className="h-4 w-4" />
                            Logs
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Exam Logs Side Panel */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            {selectedExam ? 'Student Attempts' : 'Select an exam'}
          </h2>
          <div className="rounded-md border border-border bg-card">
            {!selectedExam ? (
              <div className="text-center py-12">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click "Logs" on any exam to view student attempts</p>
              </div>
            ) : attemptsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No attempts for this exam</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="p-4">
                    <p className="text-sm font-medium text-foreground">{attempt.student.name}</p>
                    <p className="text-xs text-muted-foreground">{attempt.student.email}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        attempt.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' :
                        attempt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {attempt.status.replace('_', ' ')}
                      </span>
                      <span>Started: {new Date(attempt.startedAt).toLocaleString()}</span>
                    </div>
                    {attempt.submittedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}