"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FileDown,
} from "lucide-react";

type ReportType = 'examination' | 'user' | 'integrity';
type TimeRange = 'week' | 'month' | 'semester' | 'year';

export default function ReportsAndResults() {
  const [activeTab, setActiveTab] = useState<ReportType>('examination');
  const [timeRange, setTimeRange] = useState<TimeRange>('semester');

  const examStats = [
    {
      title: 'Pass Rate',
      value: '78.5%',
      change: '+2.3%',
      trend: 'up',
      icon: CheckCircle,
    },
    {
      title: 'Fail Rate',
      value: '21.5%',
      change: '-2.3%',
      trend: 'down',
      icon: XCircle,
    },
    {
      title: 'Attendance Rate',
      value: '94.2%',
      change: '+1.1%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Average Score',
      value: '72.8',
      change: '+3.2',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  const userStats = [
    {
      title: 'Active Students',
      value: '1,248',
      change: '+45',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Lecturers',
      value: '87',
      change: '+3',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Lecturer Activity',
      value: '89%',
      change: '+5%',
      trend: 'up',
      icon: FileText,
    },
    {
      title: 'Student Engagement',
      value: '76%',
      change: '+2%',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  const integrityStats = [
    {
      title: 'AI Violations',
      value: '23',
      change: '-8',
      trend: 'down',
      icon: AlertTriangle,
    },
    {
      title: 'Suspicious Behavior',
      value: '45',
      change: '+12',
      trend: 'up',
      icon: Shield,
    },
    {
      title: 'False Positives',
      value: '8',
      change: '-3',
      trend: 'down',
      icon: CheckCircle,
    },
    {
      title: 'Investigations',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: Eye,
    },
  ];

  const recentIncidents = [
    {
      id: '1',
      type: 'AI Violation',
      student: 'John Doe',
      module: 'CS-301',
      description: 'Multiple windows detected during exam',
      severity: 'high',
      time: '2 hours ago',
      status: 'under investigation',
    },
    {
      id: '2',
      type: 'Suspicious Behavior',
      student: 'Jane Smith',
      module: 'MATH-201',
      description: 'Unusual typing patterns detected',
      severity: 'medium',
      time: '4 hours ago',
      status: 'reviewing',
    },
    {
      id: '3',
      type: 'AI Violation',
      student: 'Mike Johnson',
      module: 'CS-302',
      description: 'Face not visible for extended period',
      severity: 'high',
      time: '6 hours ago',
      status: 'resolved',
    },
  ];

  const tabs = [
    { id: 'examination', label: 'Examination Reports', icon: BarChart3 },
    { id: 'user', label: 'User Reports', icon: Users },
    { id: 'integrity', label: 'Integrity Reports', icon: Shield },
  ];

  const timeRanges = [
    { id: 'week', label: 'Last Week' },
    { id: 'month', label: 'Last Month' },
    { id: 'semester', label: 'This Semester' },
    { id: 'year', label: 'This Year' },
  ];

  const getStatsByTab = () => {
    switch (activeTab) {
      case 'examination':
        return examStats;
      case 'user':
        return userStats;
      case 'integrity':
        return integrityStats;
      default:
        return examStats;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      high: 'bg-destructive/10 text-destructive',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-muted text-muted-foreground',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[severity as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'under investigation': 'bg-warning/10 text-warning',
      reviewing: 'bg-primary/10 text-primary',
      resolved: 'bg-success/10 text-success',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>{range.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            <FileDown className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportType)}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {getStatsByTab().map((stat, index) => (
          <div key={index} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {stat.title}
              </p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className={`mt-1 text-xs ${
              stat.trend === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Integrity Incidents */}
      {activeTab === 'integrity' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Recent Incidents
          </h2>
          <div className="rounded-md border border-border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Incident
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Module
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Severity
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
                  {recentIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-accent/50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{incident.type}</p>
                          <p className="text-xs text-muted-foreground">{incident.time}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{incident.student}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{incident.module}</td>
                      <td className="px-4 py-4 text-sm text-foreground max-w-xs truncate">
                        {incident.description}
                      </td>
                      <td className="px-4 py-4">{getSeverityBadge(incident.severity)}</td>
                      <td className="px-4 py-4">{getStatusBadge(incident.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1 text-muted-foreground hover:text-foreground" title="View Details">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Performance Trends
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Department Comparison
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Department performance chart would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
