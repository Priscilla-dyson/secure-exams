"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Send, 
  Save,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  Flag,
  ShieldCheck,
  ChevronRight,
  Edit,
  Search
} from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function ResultsPage() {
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [resultStatus, setResultStatus] = useState<'hidden' | 'published'>('hidden')
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      const data = await response.json()
      if (data.success) {
        setExams(data.exams)
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentExam = exams.find(e => e.id === selectedExam)

  if (loading) {
    return (
      <SidebarLayout userRole="lecturer">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading exam results...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (!currentExam && exams.length > 0) {
    setSelectedExam(exams[0].id)
  }

  if (exams.length === 0) {
    return (
      <SidebarLayout userRole="lecturer">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No exam results available</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pass: 'bg-success/10 text-success',
      fail: 'bg-destructive/10 text-destructive',
      absent: 'bg-muted text-muted-foreground'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {status === 'pass' && <CheckCircle className="h-3 w-3" />}
        {status === 'fail' && <XCircle className="h-3 w-3" />}
        {status === 'absent' && <UserX className="h-3 w-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-6">
        {/* Result Status Banner */}
        <div className={`p-4 rounded-md border ${
          resultStatus === 'hidden' 
            ? 'bg-warning/10 border-warning/20' 
            : 'bg-success/10 border-success/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {resultStatus === 'hidden' ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  Results are currently {resultStatus === 'hidden' ? 'hidden from students' : 'published to students'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {resultStatus === 'hidden' 
                    ? 'Students cannot see their results yet. Click "Publish Results" when ready.' 
                    : 'Students can now view their results and feedback.'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setResultStatus(resultStatus === 'hidden' ? 'published' : 'hidden')}
            >
              {resultStatus === 'hidden' ? 'Publish Now' : 'Hide Results'}
            </Button>
          </div>
        </div>

        {/* Exam Selection and Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-5">
              <div className="mb-4">
                <Label className="text-sm font-medium text-foreground">Select Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No exams available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-semibold text-foreground">{currentExam.totalStudents}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-semibold text-foreground">{currentExam.submitted}</p>
                  <p className="text-xs text-muted-foreground">{currentExam.absent} absent</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-semibold text-foreground">{currentExam.passCount}/{currentExam.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">{currentExam.totalStudents > 0 ? Math.round((currentExam.passCount / currentExam.totalStudents) * 100) : 0}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-semibold text-foreground">{currentExam.averageScore}</p>
                </div>
              </div>

              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Highest Score</p>
                  <p className="text-2xl font-semibold text-foreground">{currentExam.highestScore}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Lowest Score</p>
                  <p className="text-2xl font-semibold text-foreground">{currentExam.lowestScore}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Integrity Issues</p>
                  <p className="text-2xl font-semibold text-warning">{currentExam.integrityWarnings + currentExam.integrityViolations}</p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results (CSV)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report (PDF)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Email Results to Students
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Student Results Table */}
        <Card>
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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Integrity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentExam.students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No students found for this exam</p>
                    </td>
                  </tr>
                ) : (
                  currentExam.students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.regNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-foreground">{student.marks}</span>
                          {student.marks !== null && (
                            <span className="text-xs text-muted-foreground">/100</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-success" />
                          <span className="text-sm text-foreground">Present</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-success" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{student.integrityScore}%</span>
                            {student.warnings > 0 && (
                              <span className="text-xs text-warning ml-1">({student.warnings} warnings)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-md border border-border bg-background p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Student Results Details</h3>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>Student Name</Label>
                  <Input value={selectedStudent.name} readOnly />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input value={selectedStudent.regNumber} readOnly />
                </div>
                <div>
                  <Label>Score</Label>
                  <Input value={selectedStudent.marks?.toString() || ''} readOnly />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input value={selectedStudent.status} readOnly />
                </div>
                <div>
                  <Label>Integrity Score</Label>
                  <Input value={selectedStudent.integrityScore?.toString() || ''} readOnly />
                </div>
              </div>
              
              <div className="mt-6">
                <Label>Feedback</Label>
                <Textarea 
                  placeholder="Enter feedback for this student..."
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Feedback
                </Button>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Student
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
