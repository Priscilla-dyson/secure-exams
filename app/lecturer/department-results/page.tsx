'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Award, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react'

export default function DepartmentResults() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/lecturer/department?type=results')
      const data = await res.json()
      if (data.success) {
        setResults(data.data)
        setStats(data.stats)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Department Results</h1>
        <p className="text-sm text-muted-foreground mt-1">View performance results across your department.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Results</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{stats.totalResults}</p>
              </div>
              <Award className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{stats.avgPercentage}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">{stats.passed}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-semibold text-red-600 mt-1">{stats.failed}</p>
              </div>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-md border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Module</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Percentage</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No published results found.</p>
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4 text-sm text-foreground">{r.student?.name || r.student?.userId}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{r.exam?.title}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{r.exam?.module?.code}</td>
                    <td className="px-4 py-4 text-sm text-center text-foreground">{r.score}/{r.totalMarks}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-medium ${r.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={r.percentage >= 50 ? 'default' : 'destructive'}>
                        {r.grade || (r.percentage >= 50 ? 'PASS' : 'FAIL')}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}