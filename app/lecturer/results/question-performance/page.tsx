'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import styles from './page.module.css'
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react'

interface QuestionStat {
  id: string
  text: string
  order: number
  category: string
  marks: number
  type?: string
  isParent?: boolean
  options?: { id: string; text: string; isCorrect: boolean }[]
  optionDistribution?: { optionId: string; text: string; count: number; isCorrect: boolean }[]
  subQuestions?: QuestionStat[]
  stats: {
    totalStudents: number
    answered: number
    correct: number
    wrong: number
    noAnswer: number
    avgScore: number
    passRate: number
    failRate: number
    noAnswerRate: number
  }
}

export default function QuestionPerformancePage() {
  const searchParams = useSearchParams()
  const examId = searchParams.get('examId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    exam: {
      id: string
      title: string
      totalMarks: number
      passingMarks: number
      module: { code: string; name: string }
      className: string
    }
    overallStats: {
      totalStudents: number
      totalQuestions: number
      averageScore: number
      overallPassRate: number
      questionsWithLowPassRate: number
    }
    questions: QuestionStat[]
  } | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'order' | 'passRate' | 'failRate'>('order')

  const [exams, setExams] = useState<{ id: string; title: string; module: { code: string; name: string } }[]>([])
  const [selectingExam, setSelectingExam] = useState(!examId || examId === 'all')

  useEffect(() => {
    if (examId && examId !== 'all') {
      fetchPerformance()
      setSelectingExam(false)
    } else {
      fetchExamsList()
      setSelectingExam(true)
      setLoading(false)
    }
  }, [examId])

  const fetchExamsList = async () => {
    try {
      const res = await fetch('/api/exams')
      const result = await res.json()
      if (result.success) {
        setExams(result.exams)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchPerformance = async () => {
    try {
      const res = await fetch(`/api/exams/${examId}/question-performance`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load data')
      }
    } catch (e) {
      setError('Failed to load question performance data')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    const next = new Set(expandedQuestions)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedQuestions(next)
  }

  const sortedQuestions = data?.questions ? [...data.questions].sort((a, b) => {
    if (sortBy === 'passRate') return a.stats.passRate - b.stats.passRate
    if (sortBy === 'failRate') return b.stats.failRate - a.stats.failRate
    return a.order - b.order
  }) : []

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      MULTIPLE_CHOICE: 'bg-blue-100 text-blue-700',
      TRUE_FALSE: 'bg-purple-100 text-purple-700',
      SHORT_ANSWER: 'bg-amber-100 text-amber-700',
      ESSAY: 'bg-green-100 text-green-700',
      MATH: 'bg-pink-100 text-pink-700',
      STRUCTURED: 'bg-indigo-100 text-indigo-700',
      DRAWING: 'bg-orange-100 text-orange-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const getPassRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600'
    if (rate >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const getPassRateBg = (rate: number) => {
    if (rate >= 70) return 'bg-green-50 border-green-200'
    if (rate >= 50) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading question performance...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Unable to Load Data</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </Card>
      </div>
    )
  }

  // Exam picker when no exam or "all" is selected
  if (selectingExam || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Question Performance Analysis</h1>
        </div>
        <p className="text-sm text-muted-foreground">Select an exam to analyze question-level performance.</p>

        {exams.length === 0 ? (
          <Card className="p-8 text-center max-w-md mx-auto">
            <p className="text-lg font-medium text-foreground">No exams found</p>
            <p className="text-sm text-muted-foreground mt-2">Create an exam first to analyze question performance.</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {exams.map(exam => (
              <Link key={exam.id} href={`/lecturer/results/question-performance?examId=${exam.id}`}>
                <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{exam.module?.code}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{exam.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{exam.module?.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Question Performance Analysis</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            {data.exam.module.code} — {data.exam.title}
          </p>
          {data.exam.className && (
            <p className="text-xs text-muted-foreground ml-10 mt-0.5">
              <Users className="w-3 h-3 inline mr-1" />
              {data.exam.className} · {data.overallStats.totalStudents} students · {data.overallStats.totalQuestions} questions
            </p>
          )}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground mt-1">{data.overallStats.totalStudents}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold text-primary mt-1">{data.overallStats.averageScore}</p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pass Rate</p>
              <p className={`text-2xl font-bold mt-1 ${
                data.overallStats.overallPassRate >= 70 ? 'text-green-600' : 
                data.overallStats.overallPassRate >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {data.overallStats.overallPassRate}%
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Low Perf. Questions</p>
              <p className={`text-2xl font-bold mt-1 ${
                data.overallStats.questionsWithLowPassRate > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {data.overallStats.questionsWithLowPassRate}
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {data.questions.length} Question{data.questions.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <div className="flex gap-1">
            {(['order', 'passRate', 'failRate'] as const).map(s => (
              <Button
                key={s}
                size="sm"
                variant={sortBy === s ? 'default' : 'outline'}
                className="h-7 text-xs px-2"
                onClick={() => setSortBy(s)}
              >
                {s === 'order' ? 'Order' : s === 'passRate' ? 'Pass Rate ↑' : 'Fail Rate ↓'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Performance Cards */}
      <div className="space-y-4">
        {sortedQuestions.map((question, index) => {
          const isExpanded = expandedQuestions.has(question.id)
          const isLowPerforming = question.stats.passRate < 50
          const isMediumPerforming = question.stats.passRate >= 50 && question.stats.passRate < 70
          const isHighPerforming = question.stats.passRate >= 70

          return (
            <Card
              key={question.id}
              className={`border-2 overflow-hidden ${
                isLowPerforming ? 'border-red-200' :
                isMediumPerforming ? 'border-amber-200' :
                'border-green-200'
              }`}
            >
              {/* Question Header */}
              <div className="p-4 cursor-pointer" onClick={() => toggleExpand(question.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {question.order}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getCategoryBadge(question.category)}`}>
                        {question.isParent ? 'STRUCTURED' : question.category.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{question.marks} marks</span>
                      {isLowPerforming && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Low Performance
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{question.text}</p>
                    {question.subQuestions && question.subQuestions.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.subQuestions.length} sub-parts
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Pass/Fail/NoAnswer quick stats */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="font-medium">{question.stats.passRate}%</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs">
                        <XCircle className="w-3 h-3" />
                        <span className="font-medium">{question.stats.failRate}%</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs">
                        <HelpCircle className="w-3 h-3" />
                        <span className="font-medium">{question.stats.noAnswerRate}%</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="progress-bar-pass"
                    style={{ '--pct': `${question.stats.passRate}%` } as React.CSSProperties}
                  />
                  <div
                    className="progress-bar-fail"
                    style={{ '--pct': `${question.stats.failRate}%` } as React.CSSProperties}
                  />
                  <div
                    className="progress-bar-na"
                    style={{ '--pct': `${question.stats.noAnswerRate}%` } as React.CSSProperties}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-green-600 font-medium">{question.stats.correct} correct</span>
                  <span className="text-[10px] text-red-600 font-medium">{question.stats.wrong} wrong</span>
                  <span className="text-[10px] text-gray-400 font-medium">{question.stats.noAnswer} no answer</span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/20">
                  {/* Detailed stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Total Students</p>
                      <p className="text-lg font-bold text-foreground mt-1">{question.stats.totalStudents}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                      <p className="text-lg font-bold text-primary mt-1">{question.stats.avgScore}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
                      <p className="text-xs text-muted-foreground">Passed</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{question.stats.correct}</p>
                      <p className="text-[10px] text-green-500">{question.stats.passRate}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-200 text-center">
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="text-lg font-bold text-red-600 mt-1">{question.stats.wrong}</p>
                      <p className="text-[10px] text-red-500">{question.stats.failRate}%</p>
                    </div>
                  </div>

                  {/* For STRUCTURED questions, show sub-question breakdown */}
                  {question.isParent && question.subQuestions && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Sub-Question Breakdown ({question.subQuestions.length} parts)
                      </h4>
                      {question.subQuestions.map((sq, sqIdx) => (
                        <div key={sq.id} className="bg-white border border-border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {String.fromCharCode(97 + sqIdx)})
                              </span>
                              <Badge variant="outline" className={`text-[10px] ${getCategoryBadge(sq.category)}`}>
                                {sq.category.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{sq.marks} marks</span>
                            </div>
                            <span className={`text-xs font-semibold ${getPassRateColor(sq.stats.passRate)}`}>
                              {sq.stats.passRate}% pass rate
                            </span>
                          </div>
                          <p className="text-xs text-foreground mb-2">{sq.text}</p>
                          <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 mb-1">
                            <div className="progress-bar-pass" style={{ '--pct': `${sq.stats.passRate}%` } as React.CSSProperties} />
                            <div className="progress-bar-fail" style={{ '--pct': `${sq.stats.failRate}%` } as React.CSSProperties} />
                            <div className="progress-bar-na" style={{ '--pct': `${sq.stats.noAnswerRate}%` } as React.CSSProperties} />
                          </div>
                          <div className="flex gap-3 text-[10px]">
                            <span className="text-green-600">{sq.stats.correct} correct</span>
                            <span className="text-red-600">{sq.stats.wrong} wrong</span>
                            <span className="text-gray-400">{sq.stats.noAnswer} no answer</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* For MCQ questions, show option distribution */}
                  {question.category === 'MULTIPLE_CHOICE' && question.optionDistribution && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Answer Distribution
                      </h4>
                      <div className="space-y-1.5">
                        {question.optionDistribution.map((opt) => {
                          const percentage = question.stats.totalStudents > 0
                            ? Math.round((opt.count / question.stats.totalStudents) * 100)
                            : 0
                          return (
                            <div
                              key={opt.optionId}
                              className={`flex items-center gap-2 p-2 rounded text-sm border ${
                                opt.isCorrect
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-border bg-white'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm ${opt.isCorrect ? 'font-medium text-green-700' : 'text-foreground'}`}>
                                    {opt.text}
                                    {opt.isCorrect && <span className="ml-1 text-xs text-green-500">✓ (correct)</span>}
                                  </span>
                                  <span className={`text-sm font-semibold ${opt.isCorrect ? 'text-green-700' : 'text-foreground'}`}>
                                    {opt.count} ({percentage}%)
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${opt.isCorrect ? 'progress-bar-option-correct' : 'progress-bar-option-incorrect'}`}
                                    style={{ '--pct': `${percentage}%` } as React.CSSProperties}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Summary footer */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Performance Insights</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.overallStats.questionsWithLowPassRate > 0
                ? `${data.overallStats.questionsWithLowPassRate} question(s) have a pass rate below 50%. Consider reviewing these questions as they may be too difficult or unclear.`
                : 'All questions have a pass rate of 50% or higher. The exam appears to be well-balanced.'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total of {data.overallStats.totalStudents} student(s) took this exam. Questions with high "no answer" rates may indicate unclear wording or insufficient time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}