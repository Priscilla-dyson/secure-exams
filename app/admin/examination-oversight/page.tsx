'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  RefreshCw,
  Eye,
  Clock,
  Square,
  Filter,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react'

type ExamStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

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

  const [exams, setExams] = useState<Exam[]>([]);

  const handleRefresh = () => {
    console.log('Refreshing exam data...');
    // Implement refresh functionality
  };

  const handleMonitorExam = (examId: string) => {
    console.log('Monitoring exam:', examId);
    // Implement monitor functionality
  };

  const handleExtendTime = (examId: string) => {
    if (confirm('Are you sure you want to extend time for this exam?')) {
      console.log('Extending time for exam:', examId);
      // Implement extend time functionality
    }
  };

  const handleForceStop = (examId: string) => {
    if (confirm('Are you sure you want to force stop this exam? This action cannot be undone.')) {
      console.log('Force stopping exam:', examId);
      setExams(exams.map(e => e.id === examId ? { ...e, status: 'cancelled' as ExamStatus } : e));
    }
  };

  const handleViewDetails = (examId: string) => {
    console.log('Viewing exam details:', examId);
    // Implement view details functionality
  };

  const handleEditExam = (examId: string) => {
    console.log('Editing exam:', examId);
    // Implement edit exam functionality
  };

  const filteredExams = exams.filter(exam => {
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeExams = exams.filter(exam => exam.status === 'active');

  const getStatusBadge = (status: ExamStatus) => {
    const styles = {
      scheduled: 'bg-primary/10 text-primary',
      active: 'bg-success/10 text-success',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Examination Oversight</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage all examinations in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
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
      </Card>

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
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium text-foreground">{exam.duration}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground" title="Monitor" onClick={() => handleMonitorExam(exam.id)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-warning" title="Extend Time" onClick={() => handleExtendTime(exam.id)}>
                      <Clock className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive" title="Force Stop" onClick={() => handleForceStop(exam.id)}>
                      <Square className="h-4 w-4" />
                    </button>
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
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No examinations found</p>
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => (
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
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1 text-muted-foreground hover:text-foreground" title="View Details" onClick={() => handleViewDetails(exam.id)}>
                            <Eye className="h-4 w-4" />
                          </button>
                          {exam.status === 'scheduled' && (
                            <button className="p-1 text-muted-foreground hover:text-warning" title="Edit" onClick={() => handleEditExam(exam.id)}>
                              <Clock className="h-4 w-4" />
                            </button>
                          )}
                          {exam.status === 'active' && (
                            <button className="p-1 text-muted-foreground hover:text-destructive" title="Emergency Stop" onClick={() => handleForceStop(exam.id)}>
                              <Square className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
