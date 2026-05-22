'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  BookOpen,
  Building2,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Users
} from 'lucide-react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type TabType = 'programs' | 'modules' | 'classes'

interface Program {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  _count: {
    students: number
    classes: number
    modules: number
  }
}

interface Class {
  id: string
  name: string
  programId: string
  program: { id: string; name: string }
  year: number
  isActive: boolean
  studentCount: number
  createdAt: string
}

interface Module {
  id: string
  name: string
  code: string
  programId: string
  program: { id: string; name: string }
  classId: string
  class: { id: string; name: string; year: number } | null
  lecturer: { id: string; name: string; email: string } | null
  _count: { exams: number }
}

interface Lecturer {
  id: string
  name: string
  email: string
  userId: string
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState<TabType>('programs')
  const [loading, setLoading] = useState(true)

  // Programs
  const [programs, setPrograms] = useState<Program[]>([])
  const [showAddProgram, setShowAddProgram] = useState(false)
  const [showEditProgram, setShowEditProgram] = useState<Program | null>(null)
  const [programName, setProgramName] = useState('')
  const [isSubmittingProgram, setIsSubmittingProgram] = useState(false)

  // Modules
  const [modules, setModules] = useState<Module[]>([])
  const [showAddModule, setShowAddModule] = useState(false)
  const [moduleName, setModuleName] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [moduleProgramId, setModuleProgramId] = useState('')
  const [moduleClassId, setModuleClassId] = useState('')
  const [isSubmittingModule, setIsSubmittingModule] = useState(false)

  // Classes
  const [classes, setClasses] = useState<Class[]>([])

  // Lecturers
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [assigningModuleId, setAssigningModuleId] = useState<string | null>(null)
  const [selectedLecturerId, setSelectedLecturerId] = useState('')
  const [isAssigningLecturer, setIsAssigningLecturer] = useState(false)

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/programs')
      const data = await res.json()
      if (data.success) setPrograms(data.programs)
    } catch (e) { console.error(e) }
  }, [])

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/modules')
      const data = await res.json()
      if (data.success) setModules(data.modules)
    } catch (e) { console.error(e) }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      if (data.success) setClasses(data.classes)
    } catch (e) { console.error(e) }
  }, [])

  const fetchLecturers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?role=LECTURER')
      const data = await res.json()
      if (data.success) {
        setLecturers(data.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email || '',
          userId: u.userId
        })))
      }
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    Promise.all([fetchPrograms(), fetchModules(), fetchClasses(), fetchLecturers()])
      .finally(() => setLoading(false))
  }, [fetchPrograms, fetchModules, fetchClasses, fetchLecturers])

  // ─── PROGRAM HANDLERS ─────────────────────────────────────────────────────

  const handleAddProgram = async () => {
    if (!programName.trim()) { alert('Program name is required'); return }
    setIsSubmittingProgram(true)
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: programName.trim() })
      })
      const data = await res.json()
      if (data.success) {
        await Promise.all([fetchPrograms(), fetchClasses()])
        setShowAddProgram(false)
        setProgramName('')
      } else {
        alert(data.error || 'Failed to create program')
      }
    } catch (e) {
      alert('Failed to create program')
    } finally {
      setIsSubmittingProgram(false)
    }
  }

  const handleEditProgram = async () => {
    if (!showEditProgram) return
    if (!programName.trim()) { alert('Program name is required'); return }
    setIsSubmittingProgram(true)
    try {
      const res = await fetch(`/api/admin/programs/${showEditProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: programName.trim() })
      })
      const data = await res.json()
      if (data.success) {
        await Promise.all([fetchPrograms(), fetchClasses()])
        setShowEditProgram(null)
        setProgramName('')
      } else {
        alert(data.error || 'Failed to update program')
      }
    } catch (e) {
      alert('Failed to update program')
    } finally {
      setIsSubmittingProgram(false)
    }
  }

  const handleDeleteProgram = async (program: Program) => {
    if (!confirm(`Delete "${program.name}"? This will also remove all auto-generated classes.`)) return
    try {
      const res = await fetch(`/api/admin/programs/${program.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        await Promise.all([fetchPrograms(), fetchClasses()])
      } else {
        alert(data.error || 'Failed to delete program')
      }
    } catch (e) {
      alert('Failed to delete program')
    }
  }

  // ─── MODULE HANDLERS ──────────────────────────────────────────────────────

  const handleAddModule = async () => {
    if (!moduleName.trim()) { alert('Module name is required'); return }
    if (!moduleProgramId) { alert('Please select a program'); return }
    if (!moduleClassId) { alert('Please select a class'); return }
    setIsSubmittingModule(true)
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: moduleName.trim(),
          code: moduleCode.trim(),
          programId: moduleProgramId,
          classId: moduleClassId
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchModules()
        setShowAddModule(false)
        setModuleName('')
        setModuleCode('')
        setModuleProgramId('')
        setModuleClassId('')
      } else {
        alert(data.error || 'Failed to create module')
      }
    } catch (e) {
      alert('Failed to create module')
    } finally {
      setIsSubmittingModule(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module?')) return
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        await fetchModules()
      } else {
        alert(data.error || 'Failed to delete module')
      }
    } catch (e) {
      alert('Failed to delete module')
    }
  }

  // ─── LECTURER ASSIGNMENT ──────────────────────────────────────────────────

  const handleAssignLecturer = async () => {
    if (!assigningModuleId) return
    setIsAssigningLecturer(true)
    try {
      const res = await fetch(`/api/admin/modules/${assigningModuleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturerId: selectedLecturerId || null })
      })
      const data = await res.json()
      if (data.success) {
        await fetchModules()
        setAssigningModuleId(null)
        setSelectedLecturerId('')
      } else {
        alert(data.error || 'Failed to assign lecturer')
      }
    } catch (e) {
      alert('Failed to assign lecturer')
    } finally {
      setIsAssigningLecturer(false)
    }
  }

  const openAssignLecturer = (mod: Module) => {
    setAssigningModuleId(mod.id)
    setSelectedLecturerId(mod.lecturer?.id || '')
  }

  // ─── CLASS HANDLERS ───────────────────────────────────────────────────────

  const handleToggleClass = async (classItem: Class) => {
    try {
      const res = await fetch(`/api/admin/classes?id=${classItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !classItem.isActive })
      })
      const data = await res.json()
      if (data.success) {
        await fetchClasses()
      } else {
        alert(data.error || 'Failed to update class')
      }
    } catch (e) {
      alert('Failed to update class')
    }
  }

  // ─── PROGRAMS TAB ─────────────────────────────────────────────────────────

  const ProgramsTab = () => (
    <div className="space-y-4">
      {programs.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No programs available</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((prog) => (
              <Card key={prog.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{prog.name}</h3>
                      <Badge variant={prog.isActive ? 'default' : 'secondary'} className="mt-1 text-[10px]">
                        {prog.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setShowEditProgram(prog); setProgramName(prog.name) }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                      title="Edit program"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(prog)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition"
                      title="Delete program"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border text-center">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{prog._count.classes}</p>
                    <p className="text-[11px] text-muted-foreground">Classes</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{prog._count.modules}</p>
                    <p className="text-[11px] text-muted-foreground">Modules</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{prog._count.students}</p>
                    <p className="text-[11px] text-muted-foreground">Students</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )

  // ─── MODULES TAB ──────────────────────────────────────────────────────────

  const ModulesTab = () => (
    <div className="space-y-4">
      {modules.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No modules available</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Module Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Program</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Lecturer</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Exams</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-foreground">{mod.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{mod.code}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{mod.program?.name || '-'}</Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{mod.class?.name || '-'}</td>
                    <td className="px-4 py-4">
                      {mod.lecturer?.name ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{mod.lecturer.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-foreground">{mod._count?.exams || 0}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAssignLecturer(mod)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                          title={mod.lecturer ? 'Change lecturer' : 'Assign lecturer'}
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition"
                          title="Delete module"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )

  // ─── CLASSES TAB ──────────────────────────────────────────────────────────

  const ClassesTab = () => (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Classes are auto-generated</p>
            <p className="text-xs text-muted-foreground">
              When a program is created, 4 classes (Year 1-4) are automatically generated. You can only view or toggle active/inactive.
            </p>
          </div>
        </div>
      </Card>

      {classes.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No classes available</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className={`p-5 transition-shadow ${!cls.isActive ? 'opacity-60' : 'hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md ${cls.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Building2 className={`h-5 w-5 ${cls.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground">{cls.program?.name || '-'} • Year {cls.year}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleClass(cls)}
                  className={`p-1.5 rounded transition ${
                    cls.isActive
                      ? 'text-success hover:bg-success/10'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  title={cls.isActive ? 'Deactivate class' : 'Activate class'}
                >
                  {cls.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                <span className="text-muted-foreground">Students</span>
                <span className="font-semibold text-foreground">{cls.studentCount}</span>
              </div>
              <Badge
                variant={cls.isActive ? 'default' : 'secondary'}
                className="mt-3"
              >
                {cls.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // ─── LOADING STATE ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  // ─── TABS ──────────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'programs' as TabType, label: 'Programs', icon: GraduationCap, count: programs.length },
    { id: 'modules' as TabType, label: 'Modules', icon: BookOpen, count: modules.length },
    { id: 'classes' as TabType, label: 'Classes', icon: Building2, count: classes.length },
  ]

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Action buttons — title is rendered by sidebar layout */}
      <div className="flex items-center justify-end">
        {activeTab === 'programs' && (
          <Button onClick={() => { setShowAddProgram(true); setProgramName('') }}>
            <Plus className="w-4 h-4 mr-2" /> Add Program
          </Button>
        )}
        {activeTab === 'modules' && (
          <Button onClick={() => { setShowAddModule(true); setModuleProgramId(programs[0]?.id || '') }}>
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </Button>
        )}
      </div>

      {/* Tabs */}
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
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      {activeTab === 'programs' && <ProgramsTab />}
      {activeTab === 'modules' && <ModulesTab />}
      {activeTab === 'classes' && <ClassesTab />}

      {/* ── Assign Lecturer Modal ──────────────────────────────────────────── */}
      {assigningModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Assign Lecturer
              </h3>
              <button onClick={() => { setAssigningModuleId(null); setSelectedLecturerId('') }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Select Lecturer</label>
                <select
                  value={selectedLecturerId}
                  onChange={(e) => setSelectedLecturerId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Unassign (no lecturer)</option>
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>{lec.name} ({lec.email || lec.userId})</option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  Select a lecturer to assign to this module. Select "Unassign" to remove the current lecturer.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => { setAssigningModuleId(null); setSelectedLecturerId('') }}>
                  Cancel
                </Button>
                <Button onClick={handleAssignLecturer} disabled={isAssigningLecturer}>
                  {isAssigningLecturer ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  {selectedLecturerId ? 'Assign Lecturer' : 'Remove Lecturer'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add Program Modal ──────────────────────────────────────────────── */}
      {showAddProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Program</h3>
              <button onClick={() => setShowAddProgram(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Program Name *</label>
                <Input
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. ICT, Nursing, Business"
                  autoFocus
                />
              </div>
              <div className="p-3 rounded-md bg-success/10 border border-success/20">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Auto-generation
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  4 classes will be created: {programName || '(name)'} Year 1-4
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowAddProgram(false)}>Cancel</Button>
                <Button onClick={handleAddProgram} disabled={!programName.trim() || isSubmittingProgram}>
                  {isSubmittingProgram ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Create Program
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Edit Program Modal ─────────────────────────────────────────────── */}
      {showEditProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Edit Program</h3>
              <button onClick={() => setShowEditProgram(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Program Name *</label>
                <Input
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="Program name"
                  autoFocus
                />
              </div>
              <div className="p-3 rounded-md bg-info/10 border border-info/20">
                <p className="text-xs text-muted-foreground">
                  Class names will be updated for all years of this program.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowEditProgram(null)}>Cancel</Button>
                <Button onClick={handleEditProgram} disabled={!programName.trim() || isSubmittingProgram}>
                  {isSubmittingProgram ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add Module Modal ───────────────────────────────────────────────── */}
      {showAddModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Module</h3>
              <button onClick={() => setShowAddModule(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Module Name *</label>
                <Input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Database Systems"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Module Code *</label>
                <Input
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                  placeholder="e.g. COS101, DBT301, MAT201"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A unique code for this module (e.g. COS101). Auto-converted to uppercase.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Program *</label>
                <select
                  value={moduleProgramId}
                  onChange={(e) => setModuleProgramId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select a program</option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Class *</label>
                <select
                  value={moduleClassId}
                  onChange={(e) => setModuleClassId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select a class</option>
                  {classes
                    .filter((c) => c.programId === moduleProgramId && c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name} (Year {c.year})</option>
                    ))}
                </select>
              </div>
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  This module will be linked to the selected class: {moduleClassId ? classes.find(c => c.id === moduleClassId)?.name || 'selected class' : '(select a class above)'}. 
                  Each module is specific to one class only. You can assign a lecturer later from the modules table.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowAddModule(false)}>Cancel</Button>
                <Button onClick={handleAddModule} disabled={!moduleName.trim() || !moduleCode.trim() || !moduleProgramId || isSubmittingModule}>
                  {isSubmittingModule ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Create Module
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}