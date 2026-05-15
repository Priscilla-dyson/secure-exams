'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Eye, EyeOff, FileText, AlertTriangle, CheckCircle, Clock, UserX } from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function SubmissionsGradingPage() {
  const [selectedExam, setSelectedExam] = useState('advanced-algorithms')
  const [showGradingPanel, setShowGradingPanel] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [resultsReleased, setResultsReleased] = useState(false)

  const submissions: any[] = []

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-success/10 text-success',
      in_progress: 'bg-warning/10 text-warning',
      absent: 'bg-destructive/10 text-destructive',
      auto_submitted: 'bg-success/10 text-success'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {status === 'submitted' && <CheckCircle className="h-3 w-3" />}
        {status === 'in_progress' && <Clock className="h-3 w-3" />}
        {status === 'absent' && <UserX className="h-3 w-3" />}
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    )
  }

  const getIntegrityBadge = (status: string) => {
    const styles = {
      clear: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      violation: 'bg-destructive/10 text-destructive',
      monitoring: 'bg-primary/10 text-primary'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {status === 'clear' && <CheckCircle className="h-3 w-3" />}
        {status === 'warning' && <AlertTriangle className="h-3 w-3" />}
        {status === 'violation' && <AlertTriangle className="h-3 w-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.submissionStatus === 'submitted' || s.submissionStatus === 'auto_submitted').length,
    inProgress: submissions.filter(s => s.submissionStatus === 'in_progress').length,
    absent: submissions.filter(s => s.submissionStatus === 'absent').length,
    graded: submissions.filter(s => s.totalGrade !== null).length,
    pending: submissions.filter(s => s.totalGrade === null && s.submissionStatus !== 'absent').length
  }

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setResultsReleased(!resultsReleased)}
            >
              {resultsReleased ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {resultsReleased ? 'Hide Results' : 'Release Results'}
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.submitted}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.graded}</p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Registration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Submission Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Time Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Integrity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No submissions found for this exam</p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{submission.name}</p>
                          <p className="text-xs text-muted-foreground">{submission.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {submission.registrationNumber}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(submission.submissionStatus)}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {submission.timeSubmitted}
                      </td>
                      <td className="px-4 py-4">
                        {submission.integrityStatus !== '-' && getIntegrityBadge(submission.integrityStatus)}
                        {submission.integrityStatus === '-' && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          submission.attendanceStatus === 'present' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {submission.attendanceStatus === 'present' && <CheckCircle className="h-3 w-3" />}
                          {submission.attendanceStatus === 'absent' && <UserX className="h-3 w-3" />}
                          {submission.attendanceStatus.charAt(0).toUpperCase() + submission.attendanceStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {submission.totalGrade !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{submission.totalGrade}</span>
                              {submission.autoGrade !== null && submission.manualGrade !== null && (
                                <span className="text-xs text-muted-foreground">
                                  (Auto: {submission.autoGrade}, Manual: {submission.manualGrade})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(submission.id)
                              setShowGradingPanel(true)
                            }}
                          >
                            Grade
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grading Modal */}
        {showGradingPanel && selectedStudent && (
          <Dialog open={showGradingPanel} onOpenChange={setShowGradingPanel}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Grade Submission</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Student Name</Label>
                    <Input 
                      value={submissions.find(s => s.id === selectedStudent)?.name || ''} 
                      readOnly 
                    />
                  </div>
                  <div>
                    <Label>Registration Number</Label>
                    <Input 
                      value={submissions.find(s => s.id === selectedStudent)?.registrationNumber || ''} 
                      readOnly 
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Auto Grade</Label>
                  <Input 
                    value={submissions.find(s => s.id === selectedStudent)?.autoGrade?.toString() || ''} 
                    readOnly 
                  />
                </div>
                
                <div>
                  <Label>Manual Adjustment</Label>
                  <Input 
                    type="number"
                    placeholder="Enter manual grade adjustment"
                  />
                </div>
                
                <div>
                  <Label>Feedback</Label>
                  <Textarea 
                    placeholder="Enter feedback for student"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowGradingPanel(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowGradingPanel(false)}>
                    Save Grade
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarLayout>
  )
}
