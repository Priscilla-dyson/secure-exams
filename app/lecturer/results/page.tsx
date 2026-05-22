"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Save,
  AlertTriangle,
} from 'lucide-react'

interface Result {
  id: string
  attemptId: string
  studentId: string
  examId: string
  score: number
  totalMarks: number
  percentage: number
  grade: string | null
  published: boolean
  publishedAt: string | null
  exam: { title: string; module: { name: string; code: string } }
  student: { id: string; name: string; email: string; registrationNumber: string | null }
}

interface Exam {
  id: string
  title: string
  module: { name: string; code: string }
}

export default function ResultsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>('all')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchExams(), fetchResults()])
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      const data = await response.json()
      if (data.success) setExams(data.exams)
    } catch (error) {
      console.error('Error fetching exams:', error)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      const data = await response.json()
      if (data.success) setResults(data.results)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (resultId: string) => {
    try {
      const res = await fetch(`/api/results/${resultId}/publish`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setResults(results.map(r => r.id === resultId ? { ...r, published: true } : r))
      } else {
        alert(data.error || 'Failed to publish')
      }
    } catch (err) {
      console.error('Error publishing:', err)
    }
  }

  const filteredResults = selectedExamId === 'all'
    ? results
    : results.filter(r => r.examId === selectedExamId)

  const examIdsWithResults = new Set(results.map(r => r.examId))
  const examsWithResults = exams.filter(e => examIdsWithResults.has(e.id))

  const publishedCount = results.filter(r => r.published).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading exam results...</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-12 text-center max-w-md">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">No results yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Results will appear here once students submit exam attempts and grading is completed.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-md border ${publishedCount > 0 ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
        <div className="flex items-center gap-3">
          {publishedCount > 0 ? (
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {publishedCount > 0
                ? `${publishedCount} result(s) published to students`
                : 'No results have been published yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {results.length} total result(s) across {examsWithResults.length} exam(s)
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Label className="text-sm font-medium text-foreground">Filter by Exam</Label>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All exams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams ({results.length} results)</SelectItem>
            {examsWithResults.map(exam => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.module?.code} - {exam.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold text-foreground mt-2">{filteredResults.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Passed</p>
          <p className="text-2xl font-semibold text-success mt-2">{filteredResults.filter(r => r.percentage >= 50).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Failed</p>
          <p className="text-2xl font-semibold text-destructive mt-2">{filteredResults.filter(r => r.percentage < 50).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Published</p>
          <p className="text-2xl font-semibold text-foreground mt-2">{filteredResults.filter(r => r.published).length}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">%</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Published</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredResults.map((result) => {
                const passed = result.percentage >= 50
                return (
                  <tr key={result.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-foreground">{result.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{result.student?.registrationNumber || ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-foreground">{result.exam?.module?.code || '-'}</p>
                      <p className="text-xs text-muted-foreground">{result.exam?.title || ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-foreground">{result.score}</span>
                      <span className="text-xs text-muted-foreground">/{result.totalMarks}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${passed ? 'text-success' : 'text-destructive'}`}>{result.percentage}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium ${result.published ? 'text-success' : 'text-warning'}`}>
                        {result.published ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedResult(result)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={result.published ? 'outline' : 'default'}
                          onClick={() => handlePublish(result.id)}
                        >
                          {result.published ? 'Published' : 'Publish'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-md border border-border bg-background p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Result Details</h3>
              <Button variant="outline" onClick={() => setSelectedResult(null)}>Close</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Student</Label>
                <Input value={selectedResult.student?.name || ''} readOnly />
              </div>
              <div>
                <Label>Registration</Label>
                <Input value={selectedResult.student?.registrationNumber || '-'} readOnly />
              </div>
              <div>
                <Label>Score</Label>
                <Input value={`${selectedResult.score} / ${selectedResult.totalMarks}`} readOnly />
              </div>
              <div>
                <Label>Percentage</Label>
                <Input value={`${selectedResult.percentage}%`} readOnly />
              </div>
              <div>
                <Label>Grade</Label>
                <Input value={selectedResult.grade || '-'} readOnly />
              </div>
              <div>
                <Label>Published</Label>
                <Input value={selectedResult.published ? 'Yes' : 'No'} readOnly />
              </div>
            </div>

            <div className="mt-6">
              <Label>Feedback</Label>
              <Textarea placeholder="Enter feedback for this student..." rows={4} />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedResult(null)}>Close</Button>
              <Button><Save className="w-4 h-4 mr-2" />Save Feedback</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}