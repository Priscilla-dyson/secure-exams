'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
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
  Download,
  Shield,
  UserCog
} from 'lucide-react'

type TabType = 'programs' | 'modules' | 'classes' | 'departments'

interface Program {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  department: { id: string; name: string } | null
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
  department: { id: string; name: string } | null
}

interface Department {
  id: string
  name: string
  description: string | null
  isActive: boolean
  hod: { id: string; name: string; email: string; userId: string } | null
  subjects: { id: string; name: string; code: string }[]
  programs: { id: string; name: string; modules: { id: string; name: string; code: string }[] }[]
  _count: {
    lecturers: number
    programs: number
    subjects: number
  }
}

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState<TabType>('programs')
  const [loading, setLoading] = useState(true)

  // Programs
  const [programs, setPrograms] = useState<Program[]>([])
  const [showAddProgram, setShowAddProgram] = useState(false)
  const [showEditProgram, setShowEditProgram] = useState<Program | null>(null)
  const [programName, setProgramName] = useState('')
  const [programDepartmentId, setProgramDepartmentId] = useState('')
  const [isSubmittingProgram, setIsSubmittingProgram] = useState(false)

  // Modules
  const [modules, setModules] = useState<Module[]>([])
  const [showAddModule, setShowAddModule] = useState(false)
  const [showEditModule, setShowEditModule] = useState<Module | null>(null)
  const [moduleName, setModuleName] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [moduleProgramId, setModuleProgramId] = useState('')
  const [moduleClassId, setModuleClassId] = useState('')
  const [isSubmittingModule, setIsSubmittingModule] = useState(false)

  // Classes
  const [classes, setClasses] = useState<Class[]>([])

  // Lecturers
  const [lecturers, setLecturers] = useState<Lecturer[]>([])

  // Departments
  const [departments, setDepartments] = useState<Department[]>([])
  const [showAddDept, setShowAddDept] = useState(false)
  const [deptName, setDeptName] = useState('')
  const [deptDesc, setDeptDesc] = useState('')
  const [isSubmittingDept, setIsSubmittingDept] = useState(false)

  // HOD assignment
  const [assigningHodDeptId, setAssigningHodDeptId] = useState<string | null>(null)
  const [assigningHodLecturerId, setAssigningHodLecturerId] = useState<string>('')
  const [isAssigningHod, setIsAssigningHod] = useState(false)

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
          userId: u.userId,
          department: u.department || null
        })))
      }
    } catch (e) { console.error(e) }
  }, [])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      if (data.success) setDepartments(data.departments)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    Promise.all([
      fetchPrograms(), fetchModules(), fetchClasses(),
      fetchLecturers(), fetchDepartments()
    ]).finally(() => setLoading(false))
  }, [fetchPrograms, fetchModules, fetchClasses, fetchLecturers, fetchDepartments])

  // ─── PROGRAM HANDLERS ─────────────────────────────────────────────────────

  const handleAddProgram = async () => {
    if (!programName.trim()) { toast.error('Program name is required'); return }
    setIsSubmittingProgram(true)
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: programName.trim(),
          departmentId: programDepartmentId || null
        })
      })
      const data = await res.json()
      if (data.success) {
        await Promise.all([fetchPrograms(), fetchClasses()])
        setShowAddProgram(false)
        setProgramName('')
        setProgramDepartmentId('')
      } else {
        toast.error(data.error || 'Failed to create program')
      }
    } catch (e) {
      toast.error('Failed to create program')
    } finally {
      setIsSubmittingProgram(false)
    }
  }

  const handleEditProgram = async () => {
    if (!showEditProgram) return
    if (!programName.trim()) { toast.error('Program name is required'); return }
    setIsSubmittingProgram(true)
    try {
      const res = await fetch(`/api/admin/programs/${showEditProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: programName.trim(),
          departmentId: programDepartmentId || null
        })
      })
      const data = await res.json()
      if (data.success) {
        await Promise.all([fetchPrograms(), fetchClasses()])
        setShowEditProgram(null)
        setProgramName('')
        setProgramDepartmentId('')
      } else {
        toast.error(data.error || 'Failed to update program')
      }
    } catch (e) {
      toast.error('Failed to update program')
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
        toast.error(data.error || 'Failed to delete program')
      }
    } catch (e) {
      toast.error('Failed to delete program')
    }
  }

  // ─── MODULE HANDLERS ──────────────────────────────────────────────────────

  const handleAddModule = async () => {
    if (!moduleName.trim()) { toast.error('Module name is required'); return }
    if (!moduleProgramId) { toast.error('Please select a program'); return }
    if (!moduleClassId) { toast.error('Please select a class'); return }
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
        toast.error(data.error || 'Failed to create module')
      }
    } catch (e) {
      toast.error('Failed to create module')
    } finally {
      setIsSubmittingModule(false)
    }
  }

  const openEditModule = (mod: Module) => {
    setShowEditModule(mod)
    setModuleName(mod.name)
    setModuleCode(mod.code)
    setModuleProgramId(mod.programId)
    setModuleClassId(mod.class?.id || '')
  }

  const handleEditModule = async () => {
    if (!showEditModule) return
    if (!moduleName.trim() || !moduleCode.trim()) {
      toast.error('Module name and code are required')
      return
    }
    if (!moduleProgramId) { toast.error('Please select a program'); return }
    if (!moduleClassId) { toast.error('Please select a class'); return }
    setIsSubmittingModule(true)
    try {
      const res = await fetch(`/api/admin/modules/${showEditModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: moduleName.trim(),
          code: moduleCode.trim().toUpperCase(),
          programId: moduleProgramId,
          classId: moduleClassId
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchModules()
        setShowEditModule(null)
        setModuleName('')
        setModuleCode('')
        setModuleProgramId('')
        setModuleClassId('')
      } else {
        toast.error(data.error || 'Failed to update module')
      }
    } catch (e) {
      toast.error('Failed to update module')
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
        toast.error(data.error || 'Failed to delete module')
      }
    } catch (e) {
      toast.error('Failed to delete module')
    }
  }

  // ─── DEPARTMENT HANDLERS ─────────────────────────────────────────────────

  const handleAddDepartment = async () => {
    if (!deptName.trim()) {
      toast.error('Department name is required')
      return
    }
    setIsSubmittingDept(true)
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deptName.trim(),
          description: deptDesc.trim() || null
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchDepartments()
        setShowAddDept(false)
        setDeptName('')
        setDeptDesc('')
      } else {
        toast.error(data.error || 'Failed to create department')
      }
    } catch (e) {
      toast.error('Failed to create department')
    } finally {
      setIsSubmittingDept(false)
    }
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
        toast.error(data.error || 'Failed to update class')
      }
    } catch (e) {
      toast.error('Failed to update class')
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
                    <div className="flex items-center gap-2 mt-1">
                      {prog.department && (
                        <Badge variant="secondary" className="text-[10px]">
                          {prog.department.name}
                        </Badge>
                      )}
                      <Badge variant={prog.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {prog.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { 
                      setShowEditProgram(prog); 
                      setProgramName(prog.name); 
                      setProgramDepartmentId(prog.department?.id || '') 
                    }}
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
      )}
    </div>
  )

  // ─── MODULES TAB ──────────────────────────────────────────────────────────
  const MODULES_PAGE_SIZE = 10
  const [modulePage, setModulePage] = useState(1)

  const ModulesTab = () => {
    const totalModules = modules.length
    const totalPages = Math.ceil(totalModules / MODULES_PAGE_SIZE)
    const paginatedModules = modules.slice(0, modulePage * MODULES_PAGE_SIZE)
    const hasMore = paginatedModules.length < totalModules

    return (
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
                  {paginatedModules.map((mod) => (
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
                          <span className="text-sm text-foreground">{mod.lecturer.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-foreground">{mod._count?.exams || 0}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModule(mod)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                            title="Edit module"
                          >
                            <Edit2 className="h-4 w-4" />
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
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing {paginatedModules.length} of {totalModules} modules
                </p>
                {hasMore ? (
                  <button
                    onClick={() => setModulePage(p => p + 1)}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    View More ({totalModules - paginatedModules.length} remaining)
                  </button>
                ) : modulePage > 1 ? (
                  <button
                    onClick={() => setModulePage(1)}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Show Less
                  </button>
                ) : null}
              </div>
            )}
          </Card>
        )}
        <Card className="p-3 bg-muted/20 border-dashed">
          <p className="text-xs text-muted-foreground">
            Lecturer assignment for modules is handled by the Department HOD. Admin can only create and delete modules.
          </p>
        </Card>
      </div>
    )
  }

  // ─── DEPARTMENTS TAB ─────────────────────────────────────────────────────

  const openHodModal = (deptId: string, currentHodId?: string) => {
    setAssigningHodDeptId(deptId)
    setAssigningHodLecturerId(currentHodId || '')
  }

  const handleAssignHodSubmit = async () => {
    if (!assigningHodDeptId) return
    setIsAssigningHod(true)
    try {
      const res = await fetch(`/api/admin/departments/${assigningHodDeptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hodId: assigningHodLecturerId || null })
      })
      const data = await res.json()
      if (data.success) {
        await fetchDepartments()
        setAssigningHodDeptId(null)
        setAssigningHodLecturerId('')
        toast.success('HOD assigned successfully')
      } else {
        toast.error(data.error || 'Failed to assign HOD')
      }
    } catch (e) {
      toast.error('Failed to assign HOD')
    } finally {
      setIsAssigningHod(false)
    }
  }

  const DepartmentsTab = () => (
    <div className="space-y-4">
      {departments.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No departments available. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id} className={`p-5 transition-shadow ${!dept.isActive ? 'opacity-60' : 'hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                  </div>
                </div>
              </div>
              {/* HOD Info */}
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30 border border-border mb-3">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  {dept.hod ? (
                    <div>
                      <p className="text-sm font-medium text-foreground truncate">{dept.hod.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{dept.hod.email}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No HOD assigned</p>
                  )}
                </div>
                <button
                  onClick={() => openHodModal(dept.id, dept.hod?.id)}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition shrink-0"
                  title={dept.hod ? 'Change HOD' : 'Assign HOD'}
                >
                  <UserCog className="h-4 w-4" />
                </button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="p-2 rounded bg-muted/20">
                  <p className="font-semibold text-foreground">{dept._count.lecturers}</p>
                  <p className="text-muted-foreground">Lecturers</p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p className="font-semibold text-foreground">{dept._count.programs}</p>
                  <p className="text-muted-foreground">Programs</p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p className="font-semibold text-foreground">{dept._count.subjects}</p>
                  <p className="text-muted-foreground">Subjects</p>
                </div>
              </div>

              {/* Programs & their Modules */}
              {dept.programs && dept.programs.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Programs & Modules</p>
                  {dept.programs.slice(0, 3).map((prog) => (
                    <div key={prog.id} className="rounded-md bg-muted/20 border border-border p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <GraduationCap className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-xs font-medium text-foreground">{prog.name}</span>
                      </div>
                      {prog.modules && prog.modules.length > 0 ? (
                        <div className="flex flex-wrap gap-1 ml-5">
                          {prog.modules.slice(0, 4).map((mod) => (
                            <Badge key={mod.id} variant="outline" className="text-[10px]">
                              {mod.code}
                            </Badge>
                          ))}
                          {prog.modules.length > 4 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{prog.modules.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground ml-5 italic">No modules</p>
                      )}
                    </div>
                  ))}
                  {dept.programs.length > 3 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{dept.programs.length - 3} more programs
                    </p>
                  )}
                </div>
              )}

              {/* Subjects */}
              {dept.subjects && dept.subjects.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {dept.subjects.slice(0, 6).map((subj) => (
                      <Badge key={subj.id} variant="secondary" className="text-[10px]">
                        {subj.name}
                      </Badge>
                    ))}
                    {dept.subjects.length > 6 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{dept.subjects.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
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

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  const exportData = (type: string) => {
    window.open(`/api/admin/export?type=${type}`, '_blank')
  }

  // ─── TABS ──────────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'programs' as TabType, label: 'Programs', icon: GraduationCap, count: programs.length },
    { id: 'modules' as TabType, label: 'Modules', icon: BookOpen, count: modules.length },
    { id: 'classes' as TabType, label: 'Classes', icon: Building2, count: classes.length },
    { id: 'departments' as TabType, label: 'Departments', icon: Building2, count: departments.length },
  ]

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        <div className="relative group">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block min-w-[160px]">
            <div className="rounded-md border border-border bg-background shadow-lg py-1">
              <button onClick={() => exportData('programs')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent">Programs</button>
              <button onClick={() => exportData('modules')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent">Modules</button>
              <button onClick={() => exportData('classes')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent">Classes</button>
            </div>
          </div>
        </div>
        {activeTab === 'programs' && (
          <Button onClick={() => { setShowAddProgram(true); setProgramName(''); setProgramDepartmentId('') }}>
            <Plus className="w-4 h-4 mr-2" /> Add Program
          </Button>
        )}
        {activeTab === 'modules' && (
          <Button onClick={() => { setShowAddModule(true); setModuleProgramId(programs[0]?.id || '') }}>
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </Button>
        )}
        {activeTab === 'departments' && (
          <Button onClick={() => { setShowAddDept(true); setDeptName(''); setDeptDesc('') }}>
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        )}
      </div>

      {/* Tabs */}
      <nav className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
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
      {activeTab === 'departments' && <DepartmentsTab />}

      {/* Assign HOD Modal */}
      {assigningHodDeptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Assign Head of Department (HOD)
              </h3>
              <button
                type="button"
                onClick={() => { setAssigningHodDeptId(null); setAssigningHodLecturerId('') }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="hodLecturerSelect" className="text-sm font-medium text-foreground mb-1.5 block">Select Lecturer (HOD)</label>
                <select
                  id="hodLecturerSelect"
                  value={assigningHodLecturerId}
                  onChange={(e) => setAssigningHodLecturerId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Remove HOD (unassign)</option>
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name} ({lec.email || lec.userId}){lec.department ? ` — ${lec.department.name}` : ' — No department'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded-md bg-info/10 border border-info/20">
                <p className="text-xs text-muted-foreground">
                  Each department can have only one HOD. If the selected lecturer is already HOD of another department, they will be moved to this one.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => { setAssigningHodDeptId(null); setAssigningHodLecturerId('') }}>
                  Cancel
                </Button>
                <Button onClick={handleAssignHodSubmit} disabled={isAssigningHod}>
                  {isAssigningHod ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  {assigningHodLecturerId ? 'Assign as HOD' : 'Remove HOD'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Department</h3>
              <button
                type="button"
                onClick={() => setShowAddDept(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Department Name *</label>
                <Input
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Information Technology"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description (optional)</label>
                <Input
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Brief description of the department"
                />
              </div>
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  After creating a department, you can assign a HOD (Head of Department) who will manage lecturers and module assignments.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowAddDept(false)}>Cancel</Button>
                <Button onClick={handleAddDepartment} disabled={!deptName.trim() || isSubmittingDept}>
                  {isSubmittingDept ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Create Department
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Program Modal */}
      {showAddProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Program</h3>
              <button
                type="button"
                onClick={() => setShowAddProgram(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                title="Close"
              >
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
              <div>
                <label htmlFor="programDeptSelectAdd" className="text-sm font-medium text-foreground mb-1.5 block">Belongs to Department *</label>
                <select
                  id="programDeptSelectAdd"
                  value={programDepartmentId}
                  onChange={(e) => setProgramDepartmentId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select a department</option>
                  {departments
                    .filter((d) => d.isActive)
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
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
                <Button onClick={handleAddProgram} disabled={!programName.trim() || !programDepartmentId || isSubmittingProgram}>
                  {isSubmittingProgram ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Create Program
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Edit Program</h3>
              <button
                type="button"
                onClick={() => setShowEditProgram(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                title="Close"
              >
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
              <div>
                <label htmlFor="programDeptSelectEdit" className="text-sm font-medium text-foreground mb-1.5 block">Belongs to Department *</label>
                <select
                  id="programDeptSelectEdit"
                  value={programDepartmentId}
                  onChange={(e) => setProgramDepartmentId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select a department</option>
                  {departments
                    .filter((d) => d.isActive)
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
              </div>
              <div className="p-3 rounded-md bg-info/10 border border-info/20">
                <p className="text-xs text-muted-foreground">Class names will be updated for all years of this program.</p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowEditProgram(null)}>Cancel</Button>
                <Button onClick={handleEditProgram} disabled={!programName.trim() || !programDepartmentId || isSubmittingProgram}>
                  {isSubmittingProgram ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Module Modal */}
      {showEditModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Edit Module</h3>
              <button
                type="button"
                onClick={() => setShowEditModule(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Module Name *</label>
                <Input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Module Code *</label>
                <Input
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BScICT 1101"
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="editModuleProgramSelect" className="text-sm font-medium text-foreground mb-1.5 block">Program *</label>
                <select
                  id="editModuleProgramSelect"
                  value={moduleProgramId}
                  onChange={(e) => { setModuleProgramId(e.target.value); setModuleClassId('') }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select a program</option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="editModuleClassSelect" className="text-sm font-medium text-foreground mb-1.5 block">Class *</label>
                <select
                  id="editModuleClassSelect"
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
                  Update module name, code, program, or class assignment. Lecturer assignment is handled by the Department HOD.
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowEditModule(null)}>Cancel</Button>
                <Button onClick={handleEditModule} disabled={!moduleName.trim() || !moduleCode.trim() || !moduleProgramId || isSubmittingModule}>
                  {isSubmittingModule ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Module</h3>
              <button
                type="button"
                onClick={() => setShowAddModule(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Module Name *</label>
                <Input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Module Code *</label>
                <Input
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BScICT 1101"
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="moduleProgramSelect" className="text-sm font-medium text-foreground mb-1.5 block">Program *</label>
                <select
                  id="moduleProgramSelect"
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
                <label htmlFor="moduleClassSelect" className="text-sm font-medium text-foreground mb-1.5 block">Class *</label>
                <select
                  id="moduleClassSelect"
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
                  This module will be linked to the selected class. Each module is specific to one class only. Lecturer assignment is handled by the HOD.
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