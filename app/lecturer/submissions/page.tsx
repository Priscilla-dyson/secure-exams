'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, FileText, AlertTriangle, CheckCircle, Clock, UserX, ShieldAlert, Monitor, Minimize2, AlertOctagon, Save, Send, Loader2, CheckCheck } from 'lucide-react'

interface Exam {
  id: string
  title: string
  module: { name: string; code: string }
  status: string
  scheduledDate: string
  endDate: string
  _count?: { examAttempts: number }
}

interface StudentAnswer {
  id: string
  questionId: string
  answer: string | null
  selectedOptionId: string | null
  marks: number | null
  isCorrect: boolean | null
  question: {
    id: string
    type: string
    text: string
    marks: number
    order: number
    correctAnswer: string | null
    options: { id: string; text: string; isCorrect: boolean; order: number }[]
  }
}

interface Attempt {
  id: string
  examId: string
  studentId: string
  status: string
  startedAt: string
  submittedAt: string | null
  score: number | null
  totalMarks: number | null
  tabSwitchCount: number
  fullscreenViolations: number
  faceDetectionWarnings: number
  suspiciousActivity: boolean
  student: { id: string; name: string; email: string; registrationNumber?: string }
}

interface GradingData {
  attempt: {
    id: string
    student: { id: string; name: string; email: string; registrationNumber: string | null }
    exam: { id: string; title: string; totalMarks: number; module: { name: string; code: string } }
    answers: StudentAnswer[]
  }
}

export default function SubmissionsGradingPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showGradingPanel, setShowGradingPanel] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Attempt | null>(null)
  const [gradingData, setGradingData] = useState<GradingData | null>(null)
  const [gradingMarks, setGradingMarks] = useState<Record<string, string>>({})
  const [savingMarks, setSavingMarks] = useState<Record<string, boolean>>({})
  const [finalizing, setFinalizing] = useState(false)
  const [gradingStatus, setGradingStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [examFilter, setExamFilter] = useState<string>('all')

  useEffect(() => {
    fetchExams()
  }, [])

  useEffect(() => {
    // Auto-update exam statuses based on dates
    const interval = setInterval(() => {
      updateExamStatuses()
    }, 60000)
    return () => clearInterval(interval)
  }, [exams])

  const updateExamStatuses = () => {
    const now = new Date()
    exams.forEach(async (exam) => {
      let newStatus = exam.status
      if (exam.status === 'SCHEDULED' && exam.scheduledDate && new Date(exam.scheduledDate) <= now) {
        newStatus = 'ACTIVE'
      }
      if ((exam.status === 'SCHEDULED' || exam.status === 'ACTIVE') && exam.endDate && new Date(exam.endDate) <= now) {
        newStatus = 'COMPLETED'
      }
      if (newStatus !== exam.status) {
        try {
          await fetch(`/api/exams/${exam.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
          fetchExams()
        } catch (e) {
          console.error('Failed to update exam status:', e)
        }
      }
    })
  }

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams')
      const data = await res.json()
      if (data.success) {
        setExams(data.exams)
        if (data.exams.length > 0 && !selectedExamId) {
          setSelectedExamId(data.exams[0].id)
        }
        updateExamStatuses()
      }
    } catch (e) {
      console.error('Error fetching exams:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttempts = async (examId: string) => {
    if (!examId) return
    try {
      const res = await fetch(`/api/exams/${examId}/attempts`)
      const data = await res.json()
      if (data.success) {
        setAttempts(data.attempts)
      }
    } catch (e) {
      console.error('Error fetching attempts:', e)
    }
  }

  useEffect(() => {
    if (selectedExamId) fetchAttempts(selectedExamId)
  }, [selectedExamId])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUBMITTED: 'bg-warning/10 text-warning border-warning/20',
      IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
      GRADED: 'bg-success/10 text-success border-success/20',
      ABSENT: 'bg-muted text-muted-foreground border-border',
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${styles[status] || 'bg-muted text-muted-foreground border-border'}`}>
        {status === 'SUBMITTED' && <Clock className="h-3 w-3" />}
        {status === 'IN_PROGRESS' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'GRADED' && <CheckCheck className="h-3 w-3" />}
        {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
      </span>
    )
  }

  const getIntegrityStatus = (attempt: Attempt) => {
    const totalViolations = attempt.tabSwitchCount + attempt.fullscreenViolations + attempt.faceDetectionWarnings
    if (attempt.suspiciousActivity) return { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertOctagon }
    if (totalViolations > 5) return { label: 'High Risk', color: 'bg-red-50 text-red-700 border-red-200', icon: ShieldAlert }
    if (totalViolations > 2) return { label: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle }
    return { label: 'Clear', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle }
  }

  const openGradingPanel = async (attempt: Attempt) => {
    setSelectedStudent(attempt)
    setGradingData(null)
    setGradingMarks({})
    setGradingStatus(null)
    setShowGradingPanel(true)

    if (attempt.id.startsWith('absent-')) return

    try {
      const res = await fetch(`/api/lecturer/grading/${attempt.id}`)
      const data = await res.json()
      if (data.success) {
        setGradingData(data)
        // Initialize marks from existing grades
        const initialMarks: Record<string, string> = {}
        data.attempt.answers.forEach((a: StudentAnswer) => {
          if (a.marks !== null) {
            initialMarks[a.id] = String(a.marks)
          }
        })
        setGradingMarks(initialMarks)
      }
    } catch (e) {
      console.error('Error fetching grading data:', e)
    }
  }

  const saveAnswerMark = async (answerId: string) => {
    if (!selectedStudent) return
    const marks = gradingMarks[answerId]
    if (marks === undefined || marks === '') return

    setSavingMarks(prev => ({ ...prev, [answerId]: true }))
    setGradingStatus(null)

    try {
      const res = await fetch(`/api/lecturer/grading/${selectedStudent.id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, marks: parseInt(marks) })
      })
      const data = await res.json()
      if (data.success) {
        // Update the grading data with new marks
        setGradingData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            attempt: {
              ...prev.attempt,
              answers: prev.attempt.answers.map(a =>
                a.id === answerId ? { ...a, marks: parseInt(marks) } : a
              )
            }
          }
        })
        setGradingStatus({ type: 'success', message: 'Mark saved' })
        if (data.allGraded) {
          setGradingStatus({ type: 'success', message: 'All questions graded! Click "Finalize Grading" to complete.' })
        }
      } else {
        setGradingStatus({ type: 'error', message: data.error || 'Failed to save mark' })
        // Reset to actual value
        setGradingMarks(prev => ({ ...prev, [answerId]: '' }))
      }
    } catch (e) {
      setGradingStatus({ type: 'error', message: 'Failed to save mark' })
    } finally {
      setSavingMarks(prev => ({ ...prev, [answerId]: false }))
    }
  }

  const finalizeGrading = async () => {
    if (!selectedStudent) return

    setFinalizing(true)
    setGradingStatus(null)

    try {
      const res = await fetch(`/api/lecturer/grading/${selectedStudent.id}/finalize`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.success) {
        setGradingStatus({ type: 'success', message: `Grading finalized! Score: ${data.score}/${data.totalMarks} (${data.percentage}%) - Grade: ${data.grade}` })
        // Refresh attempts list
        fetchAttempts(selectedExamId)
        // Update local state
        setSelectedStudent(prev => prev ? { ...prev, status: 'GRADED', score: data.score, totalMarks: data.totalMarks } : null)
      } else {
        setGradingStatus({ type: 'error', message: data.details || data.error || 'Failed to finalize' })
      }
    } catch (e) {
      setGradingStatus({ type: 'error', message: 'Failed to finalize grading' })
    } finally {
      setFinalizing(false)
    }
  }

  const gradedCount = attempts.filter(a => a.status === 'GRADED').length
  const submittedCount = attempts.filter(a => a.status === 'SUBMITTED').length
  const inProgressCount = attempts.filter(a => a.status === 'IN_PROGRESS').length
  const violationsCount = attempts.filter(a => a.tabSwitchCount > 0 || a.fullscreenViolations > 0 || a.faceDetectionWarnings > 0 || a.suspiciousActivity).length

  // Calculate totals from grading data
  const gradedAnswers = gradingData?.attempt.answers || []
  const totalGradedScore = gradedAnswers.reduce((sum, a) => sum + (a.marks || 0), 0)
  const allGraded = gradedAnswers.length > 0 && gradedAnswers.every(a => a.marks !== null)
  const mcqAnswers = gradedAnswers.filter(a => a.question.type === 'MULTIPLE_CHOICE')
  const manualAnswers = gradedAnswers.filter(a => a.question.type !== 'MULTIPLE_CHOICE')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-12 text-center max-w-md">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">No exams found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create an exam first to view student submissions.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-72">
          <Label className="text-sm font-medium text-foreground">Select Exam</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose an exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map(exam => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.module?.code} - {exam.title} ({exam.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" disabled>
          <FileText className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{attempts.length}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{submittedCount}</p>
          <p className="text-sm text-muted-foreground">Submitted</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{gradedCount}</p>
          <p className="text-sm text-muted-foreground">Graded</p>
        </Card>
        <Card className="p-4 text-center">
          <p className={`text-2xl font-bold ${violationsCount > 0 ? 'text-destructive' : 'text-foreground'}`}>{violationsCount}</p>
          <p className="text-sm text-muted-foreground">Violations</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Anti-Cheat</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tab Switches</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fullscreen</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No submissions found for this exam</p>
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => {
                  const integrity = getIntegrityStatus(attempt)
                  const IntegrityIcon = integrity.icon
                  return (
                    <tr key={attempt.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground">{attempt.student?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{attempt.student?.email || ''}</p>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(attempt.status)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${integrity.color}`}>
                          <IntegrityIcon className="h-3 w-3" />
                          {integrity.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${attempt.tabSwitchCount > 0 ? 'text-destructive font-medium' : 'text-foreground'}`}>
                          {attempt.tabSwitchCount}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${attempt.fullscreenViolations > 0 ? 'text-destructive font-medium' : 'text-foreground'}`}>
                          {attempt.fullscreenViolations}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm">
                        {attempt.score !== null ? `${attempt.score}/${attempt.totalMarks}` : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant={attempt.status === 'GRADED' ? 'outline' : 'default'}
                            onClick={() => openGradingPanel(attempt)}
                            disabled={attempt.id.startsWith('absent-')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {attempt.status === 'GRADED' ? 'View' : 'Grade'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showGradingPanel && selectedStudent && selectedStudent.id.startsWith('absent-') && (
        <Dialog open={showGradingPanel} onOpenChange={setShowGradingPanel}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Student Absent</DialogTitle>
            </DialogHeader>
            <div className="p-6 text-center">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">{selectedStudent.student?.name}</p>
              <p className="text-sm text-muted-foreground mt-2">This student did not take this exam.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowGradingPanel(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showGradingPanel && selectedStudent && !selectedStudent.id.startsWith('absent-') && (
        <Dialog open={showGradingPanel} onOpenChange={setShowGradingPanel}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Grading: {selectedStudent.student?.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedStudent.status === 'GRADED' ? '✓ Graded' : 'Pending'}
                </span>
              </DialogTitle>
            </DialogHeader>

            {!gradingData ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student & Exam Info */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Student</Label>
                    <p className="text-sm font-medium">{gradingData.attempt.student.name}</p>
                    <p className="text-xs text-muted-foreground">{gradingData.attempt.student.registrationNumber || gradingData.attempt.student.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Exam</Label>
                    <p className="text-sm font-medium">{gradingData.attempt.exam.module.code} - {gradingData.attempt.exam.title}</p>
                    <p className="text-xs text-muted-foreground">Total Marks: {gradingData.attempt.exam.totalMarks}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Score</Label>
                    <p className={`text-lg font-bold ${selectedStudent.status === 'GRADED' ? 'text-primary' : 'text-warning'}`}>
                      {totalGradedScore} / {gradingData.attempt.exam.totalMarks}
                    </p>
                    {allGraded && selectedStudent.status !== 'GRADED' && (
                      <p className="text-xs text-success font-medium">All questions graded - ready to finalize</p>
                    )}
                  </div>
                </div>

                {/* Anti-Cheating Section */}
                <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Anti-Cheating Violations
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-border text-center">
                      <Monitor className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Tab Switches</p>
                      <p className={`text-lg font-bold ${selectedStudent.tabSwitchCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {selectedStudent.tabSwitchCount}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border text-center">
                      <Minimize2 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Fullscreen Exits</p>
                      <p className={`text-lg font-bold ${selectedStudent.fullscreenViolations > 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {selectedStudent.fullscreenViolations}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border text-center">
                      <UserX className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Face Warnings</p>
                      <p className={`text-lg font-bold ${selectedStudent.faceDetectionWarnings > 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {selectedStudent.faceDetectionWarnings}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border text-center">
                      <AlertOctagon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Suspicious</p>
                      <p className={`text-lg font-bold ${selectedStudent.suspiciousActivity ? 'text-destructive' : 'text-green-600'}`}>
                        {selectedStudent.suspiciousActivity ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status message */}
                {gradingStatus && (
                  <div className={`p-3 rounded-md border text-sm ${
                    gradingStatus.type === 'success'
                      ? 'bg-success/10 border-success/20 text-success'
                      : 'bg-destructive/10 border-destructive/20 text-destructive'
                  }`}>
                    {gradingStatus.type === 'success' ? <CheckCircle className="h-4 w-4 inline mr-1" /> : <AlertTriangle className="h-4 w-4 inline mr-1" />}
                    {gradingStatus.message}
                  </div>
                )}

                {/* Questions & Answers */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    Student Answers ({gradedAnswers.length} questions)
                  </h4>

                  {gradedAnswers.map((answer, index) => {
                    const isMCQ = answer.question.type === 'MULTIPLE_CHOICE'
                    const isAutoGraded = isMCQ && answer.marks !== null
                    const selectedOption = isMCQ && answer.selectedOptionId
                      ? answer.question.options.find(o => o.id === answer.selectedOptionId)
                      : null
                    const correctOption = isMCQ
                      ? answer.question.options.find(o => o.isCorrect)
                      : null

                    return (
                      <div key={answer.id} className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              Q{index + 1}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {answer.question.type === 'MULTIPLE_CHOICE' ? 'MCQ' :
                               answer.question.type === 'SHORT_ANSWER' ? 'Short Answer' :
                               answer.question.type === 'ESSAY' ? 'Essay' :
                               answer.question.type === 'MATH' ? 'Math' : answer.question.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">({answer.question.marks} marks)</span>
                          </div>
                          {isAutoGraded && (
                            <Badge className="bg-success/10 text-success border-success/20">
                              Auto-graded: {answer.marks}/{answer.question.marks}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm font-medium text-foreground mb-3">{answer.question.text}</p>

                        {isMCQ ? (
                          <div className="space-y-1.5">
                            {answer.question.options.map(opt => {
                              const isSelected = opt.id === answer.selectedOptionId
                              return (
                                <div key={opt.id} className={`flex items-center gap-2 p-2 rounded text-sm border ${
                                  isSelected && opt.isCorrect ? 'border-green-300 bg-green-50' :
                                  isSelected && !opt.isCorrect ? 'border-red-300 bg-red-50' :
                                  !isSelected && opt.isCorrect ? 'border-green-200 bg-green-50/50' :
                                  'border-border'
                                }`}>
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                    isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                                  }`}>
                                    {String.fromCharCode(65 + opt.order - 1)}
                                  </span>
                                  <span>{opt.text}</span>
                                  {isSelected && <span className="ml-auto text-xs font-medium">Selected</span>}
                                  {!isSelected && opt.isCorrect && <span className="ml-auto text-xs font-medium text-green-600">Correct Answer</span>}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded p-3 border border-border">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{answer.answer || '(No answer provided)'}</p>
                          </div>
                        )}

                        {/* Grading Input */}
                        {!isAutoGraded && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Marks:</Label>
                              <Input
                                type="number"
                                min={0}
                                max={answer.question.marks}
                                className="w-20 h-8 text-sm"
                                placeholder="0"
                                value={gradingMarks[answer.id] !== undefined ? gradingMarks[answer.id] : ''}
                                onChange={(e) => setGradingMarks(prev => ({ ...prev, [answer.id]: e.target.value }))}
                                disabled={selectedStudent.status === 'GRADED'}
                              />
                              <span className="text-xs text-muted-foreground">/ {answer.question.marks}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveAnswerMark(answer.id)}
                              disabled={!gradingMarks[answer.id] || savingMarks[answer.id] || selectedStudent.status === 'GRADED'}
                            >
                              {savingMarks[answer.id] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3 mr-1" />
                              )}
                              Save
                            </Button>
                            {answer.marks !== null && (
                              <span className="text-xs text-success font-medium">
                                Saved: {answer.marks}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Auto-graded (MCQ)</p>
                      <p className="text-lg font-bold text-foreground">
                        {mcqAnswers.reduce((s, a) => s + (a.marks || 0), 0)} / {mcqAnswers.reduce((s, a) => s + a.question.marks, 0)}
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Manual (To Grade)</p>
                      <p className="text-lg font-bold text-foreground">
                        {manualAnswers.filter(a => a.marks !== null).length} / {manualAnswers.length} graded
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Total Score</p>
                      <p className={`text-lg font-bold ${allGraded ? 'text-primary' : 'text-warning'}`}>
                        {totalGradedScore} / {gradingData.attempt.exam.totalMarks}
                      </p>
                    </Card>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" onClick={() => setShowGradingPanel(false)}>
                    Close
                  </Button>
                  {selectedStudent.status !== 'GRADED' && (
                    <Button
                      onClick={finalizeGrading}
                      disabled={!allGraded || finalizing}
                    >
                      {finalizing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Finalize Grading
                    </Button>
                  )}
                  {selectedStudent.status === 'GRADED' && (
                    <Badge className="bg-success/10 text-success border-success/20 text-sm px-4 py-2">
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Graded - {totalGradedScore}/{gradingData.attempt.exam.totalMarks}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}