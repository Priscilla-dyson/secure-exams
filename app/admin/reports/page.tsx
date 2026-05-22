'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BarChart3,
  Users,
  Shield,
  Download,
  FileDown,
  CheckCircle,
  TrendingUp,
  FileText,
  AlertTriangle,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react'

type ReportType = 'examination' | 'student' | 'integrity'

interface StudentPerf {
  id: string
  name: string
  email: string
  totalExams: number
  passed: number
  failed: number
  avgScore: number
}

interface Incident {
  id: string
  exam: { title: string }
  student: { name: string; email: string }
  tabSwitchCount: number
  fullscreenViolations: number
  faceDetectionWarnings: number
  updatedAt: string
}

export default function ReportsAndResults() {
  const [activeTab, setActiveTab] = useState<ReportType>('examination')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports?type=${activeTab}`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error('Reports fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!data) return

    let csv = ''
    const filename = `${activeTab}-report.csv`

    if (activeTab === 'examination') {
      csv = 'Metric,Value\n' +
        data.stats.map((s: any) => `${s.title},${s.value}`).join('\n')
    } else if (activeTab === 'student') {
      csv = 'Name,Email,Total Exams,Passed,Failed,Average Score\n' +
        data.students.map((s: StudentPerf) =>
          `"${s.name}","${s.email}",${s.totalExams},${s.passed},${s.failed},${s.avgScore}`
        ).join('\n')
    } else if (activeTab === 'integrity') {
      csv = 'Student,Exam,Tab Switches,Fullscreen Violations,Face Warnings\n' +
        (data.incidents || []).map((i: Incident) =>
          `"${i.student.name}","${i.exam.title}",${i.tabSwitchCount},${i.fullscreenViolations},${i.faceDetectionWarnings}`
        ).join('\n')
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'examination' as ReportType, label: 'Exam Performance', icon: BarChart3 },
    { id: 'student' as ReportType, label: 'Student Performance', icon: Users },
    { id: 'integrity' as ReportType, label: 'Integrity Reports', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <Button variant="outline" onClick={handleExportCSV} disabled={!data}>
          <FileDown className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div>
        <nav className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !data ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      ) : (
        <>
          {/* Examination Reports */}
          {activeTab === 'examination' && data.stats && (
            <div className="grid gap-6 md:grid-cols-4">
              {data.stats.map((stat: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                    </div>
                    {stat.icon === 'FileText' && <FileText className="h-5 w-5 text-muted-foreground" />}
                    {stat.icon === 'TrendingUp' && <TrendingUp className="h-5 w-5 text-muted-foreground" />}
                    {stat.icon === 'BarChart3' && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
                    {stat.icon === 'CheckCircle' && <CheckCircle className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Student Performance */}
          {activeTab === 'student' && data.students && (
            <div className="rounded-md border border-border bg-background">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exams Taken</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Passed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Failed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <p className="text-sm text-muted-foreground">No student data available</p>
                        </td>
                      </tr>
                    ) : (
                      data.students.map((student: StudentPerf) => (
                        <tr key={student.id} className="hover:bg-accent/50">
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-foreground">{student.totalExams}</td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-green-600 font-medium">{student.passed}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-red-600 font-medium">{student.failed}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-sm font-medium ${
                              student.avgScore >= 50 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {student.avgScore}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Integrity Reports */}
          {activeTab === 'integrity' && (
            <>
              {/* Stats */}
              {data.stats && (
                <div className="grid gap-6 md:grid-cols-4">
                  {data.stats.map((stat: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Incidents */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Recent Incidents
                </h2>
                {!data.incidents || data.incidents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No integrity incidents reported</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.incidents.map((incident: Incident) => (
                      <Card key={incident.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{incident.exam.title}</h3>
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                                Suspicious
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Student: {incident.student.name} ({incident.student.email})
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Tab switches: {incident.tabSwitchCount}</span>
                              <span>Fullscreen violations: {incident.fullscreenViolations}</span>
                              <span>Face warnings: {incident.faceDetectionWarnings}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(incident.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}