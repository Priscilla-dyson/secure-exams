'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  BookOpen, 
  Calendar, 
  Users, 
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck
} from 'lucide-react'

type TabType = 'departments' | 'modules' | 'academic-year' | 'enrollment'

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  lecturerCount: number;
  studentCount: number;
}

interface Module {
  id: string;
  code: string;
  name: string;
  department: string;
  lecturer: string;
  studentCount: number;
  semester: string;
}

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [searchTerm, setSearchTerm] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const handleAddNew = () => {
    console.log('Add new item based on active tab:', activeTab);
    // Implement add functionality based on active tab
  };

  const handleEditDepartment = (deptId: string) => {
    console.log('Edit department:', deptId);
    // Implement edit department functionality
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(d => d.id !== deptId));
    }
  };

  const handleEditModule = (moduleId: string) => {
    console.log('Edit module:', moduleId);
    // Implement edit module functionality
  };

  const handleAssignLecturer = (moduleId: string) => {
    console.log('Assign lecturer to module:', moduleId);
    // Implement assign lecturer functionality
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'academic-year', label: 'Academic Year', icon: Calendar },
    { id: 'enrollment', label: 'Enrollment', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Academic Structure</h1>
          <p className="text-sm text-muted-foreground">Manage departments, modules, and academic calendar</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments, modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      {/* Tabs */}
      <div>
        <nav className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
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

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No departments found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <div key={dept.id} className="rounded-md border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">{dept.code}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => handleEditDepartment(dept.id)}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteDepartment(dept.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Head:</span>
                      <span className="text-foreground">{dept.head}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lecturers:</span>
                      <span className="text-foreground">{dept.lecturerCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Students:</span>
                      <span className="text-foreground">{dept.studentCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Module Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Module Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Lecturer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No modules found</p>
                    </td>
                  </tr>
                ) : (
                  modules.map((module) => (
                    <tr key={module.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4 font-mono text-sm text-foreground">{module.code}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{module.name}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{module.department}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{module.lecturer}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{module.studentCount}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{module.semester}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => handleEditModule(module.id)}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => handleAssignLecturer(module.id)}>
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteModule(module.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Year Tab */}
      {activeTab === 'academic-year' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Current Academic Year</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Academic Year</p>
                  <p className="text-lg font-medium text-foreground">2024-2025</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Semester</p>
                  <p className="text-lg font-medium text-foreground">Semester 2</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Semester Start</span>
                  <span className="text-sm text-foreground">January 15, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mid-Semester Break</span>
                  <span className="text-sm text-foreground">March 20-27, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Final Exams</span>
                  <span className="text-sm text-foreground">May 10-25, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Semester End</span>
                  <span className="text-sm text-foreground">May 30, 2025</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Enrollment Tab */}
      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Enrollment Overview</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-semibold text-foreground">1,248</p>
                <p className="text-xs text-muted-foreground">+12% from last year</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">New Enrollments</p>
                <p className="text-3xl font-semibold text-foreground">324</p>
                <p className="text-xs text-muted-foreground">This semester</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Graduating Students</p>
                <p className="text-3xl font-semibold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">Expected this year</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
