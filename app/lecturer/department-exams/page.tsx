'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ClipboardList } from 'lucide-react'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700'
}

export default function DepartmentExams() {
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<any[]>([])

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/lecturer/department?type=exams')
      const data = await res.json()
      if (data.success) setExams(data.data)
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
        <h1 className="text-2xl font-bold text-foreground">Department Exams</h1>
        <p className="text-sm text-muted-foreground mt-1">View all exams across your department.</p>
      </div>

      <div className="rounded-md border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Module</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Creator</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Attempts</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No exams found in your department.</p>
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-foreground">{exam.title}</p>
                      {exam.scheduledDate && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(exam.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {exam.module?.code} - {exam.module?.name}
                    </td>
                    <td className="px-4 py-4 text-sm capitalize text-foreground">{exam.type}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{exam.creator?.name || exam.module?.lecturer?.name || '-'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[exam.status] || 'bg-gray-100 text-gray-700'}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-foreground">{exam._count?.examAttempts || 0}</td>
                    <td className="px-4 py-4 text-sm text-right text-foreground">{exam.duration} min</td>
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