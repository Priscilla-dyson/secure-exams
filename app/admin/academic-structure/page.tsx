"use client";

import { useState } from "react";
import {
  Building2,
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Calendar,
  Upload,
  Download,
  ChevronRight,
} from "lucide-react";

type TabType = 'departments' | 'modules' | 'academic-year' | 'enrollment';

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

  const departments: Department[] = [
    {
      id: '1',
      name: 'Computer Science',
      code: 'CS',
      head: 'Dr. Sarah Johnson',
      lecturerCount: 15,
      studentCount: 450,
    },
    {
      id: '2',
      name: 'Mathematics',
      code: 'MATH',
      head: 'Dr. Michael Brown',
      lecturerCount: 12,
      studentCount: 320,
    },
    {
      id: '3',
      name: 'Physics',
      code: 'PHY',
      head: 'Dr. Emily Davis',
      lecturerCount: 10,
      studentCount: 280,
    },
  ];

  const modules: Module[] = [
    {
      id: '1',
      code: 'CS-301',
      name: 'Data Structures & Algorithms',
      department: 'Computer Science',
      lecturer: 'Dr. Sarah Johnson',
      studentCount: 120,
      semester: 'Semester 2',
    },
    {
      id: '2',
      code: 'CS-302',
      name: 'Database Management',
      department: 'Computer Science',
      lecturer: 'Dr. John Smith',
      studentCount: 85,
      semester: 'Semester 2',
    },
    {
      id: '3',
      code: 'MATH-201',
      name: 'Linear Algebra',
      department: 'Mathematics',
      lecturer: 'Dr. Michael Brown',
      studentCount: 95,
      semester: 'Semester 2',
    },
  ];

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'academic-year', label: 'Academic Year', icon: Calendar },
    { id: 'enrollment', label: 'Enrollment', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {activeTab === 'departments' ? 'Add Department' : 
             activeTab === 'modules' ? 'Add Module' :
             activeTab === 'academic-year' ? 'Set Academic Year' : 'Bulk Enroll'}
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-64 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`border-b-2 pb-3 text-sm font-semibold capitalize transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive">
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
                {modules.map((module) => (
                  <tr key={module.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4 font-mono text-sm text-foreground">{module.code}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{module.name}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{module.department}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{module.lecturer}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{module.studentCount}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{module.semester}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-foreground">
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Year Tab */}
      {activeTab === 'academic-year' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Current Academic Year</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                  <input
                    type="text"
                    defaultValue="2024/2025"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Semester</label>
                  <select defaultValue="2" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <select defaultValue="active" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Update Academic Year
                </button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Academic Calendar</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground">Semester Start</span>
                  <span className="text-sm font-medium text-foreground">Jan 15, 2025</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground">Mid-Term Break</span>
                  <span className="text-sm font-medium text-foreground">Mar 10-17, 2025</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground">Semester End</span>
                  <span className="text-sm font-medium text-foreground">Jun 15, 2025</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">Exam Period</span>
                  <span className="text-sm font-medium text-foreground">Jun 1-15, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Tab */}
      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Bulk Student Enrollment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Select Module</label>
                  <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <option>CS-301 - Data Structures & Algorithms</option>
                    <option>CS-302 - Database Management</option>
                    <option>MATH-201 - Linear Algebra</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Upload CSV File</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="file"
                      accept=".csv"
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-2 file:cursor-pointer"
                    />
                    <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                      Upload
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  CSV format: Student ID, First Name, Last Name, Email
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Enrollments</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">CS-301</p>
                    <p className="text-xs text-muted-foreground">45 students enrolled</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">MATH-201</p>
                    <p className="text-xs text-muted-foreground">32 students enrolled</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">CS-302</p>
                    <p className="text-xs text-muted-foreground">28 students enrolled</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
