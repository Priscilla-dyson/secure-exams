'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldAlert, AlertTriangle, Monitor, Eye, Users, TrendingUp } from 'lucide-react'

export default function DepartmentIntegrity() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [showAllViolators, setShowAllViolators] = useState(false)
  const [showAllViolations, setShowAllViolations] = useState(false)

  useEffect(() => {
    fetchIntegrity()
  }, [])

  const fetchIntegrity = async () => {
    try {
      const res = await fetch('/api/lecturer/department/integrity')
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error('Integrity fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200'
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Integrity</h1>
          <p className="text-sm text-muted-foreground mt-1">No integrity data available for your department.</p>
        </div>
      </div>
    )
  }

  const { summary, topViolators, violationsList } = data

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exam Integrity Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor academic integrity across your department.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Violations</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{summary.totalViolations}</p>
            </div>
            <ShieldAlert className="h-8 w-8 text-red-500/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{summary.totalExamsConducted} exams conducted</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tab Switching</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{summary.tabSwitchingIncidents}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Most common violation</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fullscreen Exits</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{summary.fullscreenExits}</p>
            </div>
            <Monitor className="h-8 w-8 text-orange-500/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{summary.suspiciousBehaviorAlerts} suspicious alerts</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Students Tracked</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{summary.totalStudentsTracked}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{summary.studentsWithViolations} with violations</p>
        </Card>
      </div>

      {/* Violation Types */}
      {data.violationTypes && data.violationTypes.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Violation Types by Frequency</h3>
          <div className="space-y-2">
            {data.violationTypes.map((vt: any) => (
              <div key={vt.type} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-40">{vt.type.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-red-500" 
                    style={{ width: `${Math.min(100, (vt.count / data.violationTypes[0].count) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-10 text-right">{vt.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Student Integrity Scores */}
      {topViolators && topViolators.length > 0 && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-foreground">Student Integrity Scores (Lowest First)</h3>
            {topViolators.length > 20 && (
              <button
                onClick={() => setShowAllViolators(!showAllViolators)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {showAllViolators ? 'Show Less' : `View All (${topViolators.length})`}
              </button>
            )}
          </div>
          <div className="rounded-md border border-border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Integrity Score</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Violations</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Tab Switches</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Fullscreen</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(showAllViolators ? topViolators : topViolators.slice(0, 20)).map((student: any, idx: number) => (
                    <tr key={student.userId} className="hover:bg-accent/50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.registrationNumber || student.userId}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${getScoreBg(student.integrityScore)}`}>
                          {student.integrityScore}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{student.totalViolations}</td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{student.tabSwitches}</td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{student.fullscreenViolations}</td>
                      <td className="px-4 py-4 text-center">
                        {student.suspicious ? (
                          <Badge variant="destructive" className="text-[10px]">Suspicious</Badge>
                        ) : student.totalViolations > 0 ? (
                          <Badge variant="secondary" className="text-[10px]">Warning</Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px]">Clean</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Violations Report */}
      {violationsList && violationsList.length > 0 && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Violations Report</h3>
            {violationsList.length > 20 && (
              <button
                onClick={() => setShowAllViolations(!showAllViolations)}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {showAllViolations ? 'Show Less' : `View All (${violationsList.length})`}
              </button>
            )}
          </div>
          <div className="rounded-md border border-border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Module</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Tab Switches</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Fullscreen</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Face</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(showAllViolations ? violationsList : violationsList.slice(0, 20)).map((v: any, idx: number) => (
                    <tr key={idx} className="hover:bg-accent/50">
                      <td className="px-4 py-4">
                        <p className="text-sm text-foreground">{v.studentName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{v.registrationNumber || v.studentId}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{v.moduleCode}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{v.examTitle}</td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{v.tabSwitches}</td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{v.fullscreenViolations}</td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{v.faceWarnings}</td>
                      <td className="px-4 py-4 text-center">
                        {v.suspicious ? (
                          <Badge variant="destructive" className="text-[10px]">Alert</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Monitor</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}