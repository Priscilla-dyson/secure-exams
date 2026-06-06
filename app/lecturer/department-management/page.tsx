'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, BookOpen, Building2, UserCheck, ShieldCheck } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function DepartmentManagement() {
  const [loading, setLoading] = useState(true)
  const [lecturers, setLecturers] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'lecturers' | 'modules'>('lecturers')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lecRes, modRes] = await Promise.all([
        fetch('/api/lecturer/department?type=lecturers'),
        fetch('/api/lecturer/department?type=modules')
      ])
      const lecData = await lecRes.json()
      const modData = await modRes.json()
      if (lecData.success) setLecturers(lecData.data)
      if (modData.success) setModules(modData.data)
    } catch (err) {
      console.error('Department fetch error:', err)
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
        <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View lecturers, modules, and classes in your department.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('lecturers')}
            className={`border-b-2 pb-3 text-sm font-semibold transition ${
              activeTab === 'lecturers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lecturers ({lecturers.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`border-b-2 pb-3 text-sm font-semibold transition ${
              activeTab === 'modules' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Modules ({modules.length})
            </span>
          </button>
        </nav>
      </div>

      {/* Lecturers Tab */}
      {activeTab === 'lecturers' && (
        <div className="space-y-3">
          {lecturers.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No lecturers found in your department.</p>
            </Card>
          ) : (
            lecturers.map((lec) => (
              <Card key={lec.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {lec.isHod ? (
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <UserCheck className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{lec.name}</p>
                        {lec.isHod && <Badge className="text-[10px]">HOD</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{lec.email || lec.userId}</p>
                    </div>
                  </div>
                  <Badge variant={lec.status === 'active' ? 'default' : 'secondary'}>
                    {lec.status}
                  </Badge>
                </div>
                {lec.lecturedModules && lec.lecturedModules.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Assigned Modules:</p>
                    <div className="flex flex-wrap gap-2">
                      {lec.lecturedModules.map((m: any) => (
                        <Badge key={m.id} variant="outline" className="text-xs">
                          {m.code} - {m.class?.name || 'N/A'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Lecturer</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Exams</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No modules found.</td>
                  </tr>
                ) : (
                  modules.map((mod) => (
                    <tr key={mod.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4 text-sm font-mono text-foreground">{mod.code}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{mod.name}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{mod.class?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{mod.lecturer?.name || 'Unassigned'}</td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{mod._count?.exams || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}