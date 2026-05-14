"use client";

import { useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Pause,
  Square,
  Plus,
  Search,
  Filter,
  Users,
  UserX,
  Activity,
  Shield,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";

type ExamStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

interface Exam {
  id: string;
  title: string;
  module: string;
  moduleCode: string;
  lecturer: string;
  date: string;
  duration: string;
  status: ExamStatus;
  enrolledStudents: number;
  attendingStudents: number;
}

export default function ExaminationOversight() {
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const exams: Exam[] = [
    {
      id: '1',
      title: 'Data Structures Mid Semester',
      module: 'Data Structures & Algorithms',
      moduleCode: 'CS-301',
      lecturer: 'Dr. Sarah Johnson',
      date: '2025-01-20 09:00',
      duration: '2 hours',
      status: 'active',
      enrolledStudents: 120,
      attendingStudents: 118,
    },
    {
      id: '2',
      title: 'Database Management Quiz',
      module: 'Database Management',
      moduleCode: 'CS-302',
      lecturer: 'Dr. John Smith',
      date: '2025-01-22 14:00',
      duration: '45 minutes',
      status: 'scheduled',
      enrolledStudents: 85,
      attendingStudents: 0,
    },
    {
      id: '3',
      title: 'Linear Algebra Final',
      module: 'Linear Algebra',
      moduleCode: 'MATH-201',
      lecturer: 'Dr. Michael Brown',
      date: '2025-01-18 10:00',
      duration: '3 hours',
      status: 'completed',
      enrolledStudents: 95,
      attendingStudents: 92,
    },
  ];

  const filteredExams = exams.filter(exam => {
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ExamStatus) => {
    const styles = {
      scheduled: 'bg-warning/10 text-warning',
      active: 'bg-success/10 text-success',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const activeExams = exams.filter(exam => exam.status === 'active');
  const totalStudents = activeExams.reduce((sum, exam) => sum + exam.attendingStudents, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Active Exams
            </p>
            <Activity className="h-4 w-4 text-success" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{activeExams.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Currently running</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Students Writing
            </p>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{totalStudents}</p>
          <p className="mt-1 text-xs text-muted-foreground">Currently active</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              AI Alerts
            </p>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">3</p>
          <p className="mt-1 text-xs text-muted-foreground">Suspicious activity</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              System Health
            </p>
            <Shield className="h-4 w-4 text-success" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">Good</p>
          <p className="mt-1 text-xs text-muted-foreground">All systems operational</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-64 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExamStatus | 'all')}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Active Exam Monitoring */}
      {activeExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Active Exam Monitoring
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {activeExams.map((exam) => (
              <div key={exam.id} className="rounded-md border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">{exam.moduleCode} - {exam.module}</p>
                    <p className="text-sm text-muted-foreground mt-1">Lecturer: {exam.lecturer}</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p className="text-sm font-medium text-foreground">
                          {exam.attendingStudents}/{exam.enrolledStudents}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time Remaining</p>
                        <p className="text-sm font-medium text-foreground">1h 24m</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(exam.status)}
                    <div className="flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground" title="Monitor">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-warning" title="Extend Time">
                        <Clock className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-destructive" title="Force Stop">
                        <Square className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Exams Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
          All Examinations
        </h2>
        <div className="rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Exam Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Lecturer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{exam.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {exam.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{exam.moduleCode}</p>
                        <p className="text-xs text-muted-foreground">{exam.module}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{exam.lecturer}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{exam.date}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{exam.duration}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <span className="text-foreground">{exam.attendingStudents}</span>
                        <span className="text-muted-foreground">/{exam.enrolledStudents}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(exam.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-muted-foreground hover:text-foreground" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-foreground" title="View Reports">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        {exam.status === 'active' && (
                          <button className="p-1 text-muted-foreground hover:text-destructive" title="Emergency Stop">
                            <Square className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
