"use client";

import {
  Users,
  UserCheck,
  BookOpen,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  Plus,
  Upload,
  UserPlus,
  BarChart3,
  Shield,
  Server,
  Database,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function AdminDashboard() {
  const statsCards = [
    { icon: Users, label: "Total Students", value: "1,248", change: "+12%" },
    { icon: UserCheck, label: "Total Lecturers", value: "87", change: "+5%" },
    { icon: FileText, label: "Total Exams", value: "456", change: "+23%" },
    { icon: Activity, label: "Active Sessions", value: "23", change: "3 ongoing" },
    { icon: Building2, label: "Departments", value: "12", change: "+1" },
    { icon: BookOpen, label: "Modules", value: "89", change: "+8%" },
  ];

  const recentActivities = [
    {
      icon: UserPlus,
      action: "New lecturer added",
      detail: "Dr. Sarah Johnson - Computer Science",
      time: "2 minutes ago",
      tone: "success",
    },
    {
      icon: FileText,
      action: "Exam completed",
      detail: "Data Structures - 45 students submitted",
      time: "15 minutes ago",
      tone: "info",
    },
    {
      icon: CheckCircle,
      action: "Results published",
      detail: "Software Engineering - Mid Semester",
      time: "1 hour ago",
      tone: "success",
    },
    {
      icon: Users,
      action: "Bulk student upload",
      detail: "124 new students added to system",
      time: "3 hours ago",
      tone: "info",
    },
    {
      icon: AlertTriangle,
      action: "System alert",
      detail: "High CPU usage on exam server",
      time: "4 hours ago",
      tone: "warning",
    },
  ];

  const quickActions = [
    { icon: UserPlus, label: "Add User", href: "/admin/users" },
    { icon: BookOpen, label: "Add Module", href: "/admin/academic-structure" },
    { icon: Building2, label: "Add Department", href: "/admin/academic-structure" },
    { icon: UserCheck, label: "Assign Lecturer", href: "/admin/academic-structure" },
    { icon: BarChart3, label: "View Reports", href: "/admin/reports" },
  ];

  const systemStatus = [
    { icon: Shield, label: "AI Monitoring", status: "Active", color: "text-success" },
    { icon: Server, label: "Server Status", status: "Operational", color: "text-success" },
    { icon: Database, label: "Database", status: "Healthy", color: "text-success" },
    { icon: Activity, label: "System Load", status: "Normal", color: "text-success" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Recent Activities
              </h2>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    activity.tone === 'success' ? 'bg-success/10 text-success' :
                    activity.tone === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <div>
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex items-center gap-3 rounded-md border border-border bg-card p-3 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  <span>{action.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* System Status */}
          <section className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                System Status
              </h2>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <div className="space-y-3">
                {systemStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
