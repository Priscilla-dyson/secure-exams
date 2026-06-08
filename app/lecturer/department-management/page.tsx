'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Users, BookOpen, Building2, UserCheck, ShieldCheck, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'

export default function DepartmentManagement() {
  const [loading, setLoading] = useState(true)
  const [lecturers, setLecturers] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'lecturers' | 'modules'>('lecturers')
  const [assigningModuleId, setAssigningModuleId] = useState<string | null>(null)
  const [selectedLecturerId, setSelectedLecturerId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

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

  const handleAssignLecturer = async (moduleId: string) => {
    if (!selectedLecturerId) {
      toast.error('Please select a lecturer')
      return
    }
    setIsAssigning(true)
    try {
      const res = await fetch('/api/lecturer/department/assign-lecturer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, lecturerId: selectedLecturerId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lecturer assigned successfully')
        setAssigningModuleId(null)
        setSelectedLecturerId('')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to assign lecturer')
      }
    } catch (err) {
      toast.error('Failed to assign lecturer')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveLecturer = async (moduleId: string) => {
    if (!confirm('Remove lecturer from this module?')) return
    setIsAssigning(true)
    try {
      const res = await fetch('/api/lecturer/department/assign-lecturer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, lecturerId: null })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lecturer removed')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to remove lecturer')
      }
    } catch (err) {
      toast.error('Failed to remove lecturer')
    } finally {
      setIsAssigning(false)
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
        <p className="text-sm text-muted-foreground mt-1">View lecturers, modules, and assign modules to lecturers in your department.</p>
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
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No modules found.</td>
                  </tr>
                ) : (
                  modules.map((mod) => (
                    <tr key={mod.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4 text-sm font-mono text-foreground">{mod.code}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{mod.name}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{mod.class?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {assigningModuleId === mod.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={selectedLecturerId}
                              onChange={(e) => setSelectedLecturerId(e.target.value)}
                              className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground"
                              aria-label="Select lecturer to assign"
                            >
                              <option value="">Select lecturer...</option>
                              {lecturers.map((lec) => (
                                <option key={lec.id} value={lec.id}>{lec.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignLecturer(mod.id)}
                              disabled={isAssigning || !selectedLecturerId}
                              className="p-1 text-primary hover:text-primary/80 disabled:text-muted-foreground"
                              title="Assign"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setAssigningModuleId(null); setSelectedLecturerId('') }}
                              className="p-1 text-muted-foreground hover:text-foreground"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2">
                            {mod.lecturer?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-foreground">{mod._count?.exams || 0}</td>
                      <td className="px-4 py-4 text-right">
                        {assigningModuleId !== mod.id && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setAssigningModuleId(mod.id); setSelectedLecturerId(mod.lecturer?.id || '') }}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                              title="Assign lecturer"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                            {mod.lecturer && (
                              <button
                                onClick={() => handleRemoveLecturer(mod.id)}
                                disabled={isAssigning}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition"
                                title="Remove lecturer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
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