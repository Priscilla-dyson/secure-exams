"use client";

import { useState, useEffect } from 'react'
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
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalClasses: 0,
    totalModules: 0,
    totalExams: 0,
    activeExams: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      if (usersData.success) {
        const students = usersData.users.filter((u: any) => u.role === 'STUDENT')
        const lecturers = usersData.users.filter((u: any) => u.role === 'LECTURER')
        
        // Fetch classes count
        const classesResponse = await fetch('/api/classes')
        const classesData = await classesResponse.json()
        
        // Fetch modules count
        const modulesResponse = await fetch('/api/modules')
        const modulesData = await modulesResponse.json()
        
        // Fetch exams count
        const examsResponse = await fetch('/api/exams')
        const examsData = await examsResponse.json()
        
        setStats({
          totalStudents: students.length,
          totalLecturers: lecturers.length,
          totalClasses: classesData.classes?.length || 0,
          totalModules: modulesData.modules?.length || 0,
          totalExams: examsData.exams?.length || 0,
          activeExams: examsData.exams?.filter((e: any) => e.status === 'ACTIVE').length || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, change: 'Active users' },
    { label: 'Total Lecturers', value: stats.totalLecturers, icon: UserCheck, change: 'Faculty members' },
    { label: 'Total Classes', value: stats.totalClasses, icon: Building2, change: 'Program groups' },
    { label: 'Total Modules', value: stats.totalModules, icon: BookOpen, change: 'Course modules' },
    { label: 'Total Exams', value: stats.totalExams, icon: FileText, change: 'All exams' },
    { label: 'Active Exams', value: stats.activeExams, icon: Clock, change: 'Currently running' },
  ]

  const recentActivities: any[] = []

  const quickActions = [
    { label: 'Add Student', icon: UserPlus, href: '/admin/users' },
    { label: 'Add Lecturer', icon: UserCheck, href: '/admin/users' },
    { label: 'Create Class', icon: Building2, href: '/admin/academic' },
    { label: 'Create Module', icon: BookOpen, href: '/admin/academic' },
  ]

  const systemStatus = [
    { label: 'Database', icon: Database, status: 'Connected', color: 'text-green-600' },
    { label: 'Server', icon: Server, status: 'Running', color: 'text-green-600' },
    { label: 'API', icon: Shield, status: 'Active', color: 'text-green-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-sm text-muted-foreground">Loading statistics...</p>
          </div>
        ) : statsCards.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-sm text-muted-foreground">No statistics available</p>
          </div>
        ) : (
          statsCards.map((stat, index) => (
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
          ))
        )}
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
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
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
                ))
              )}
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
              {quickActions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No quick actions available</p>
                </div>
              ) : (
                quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center gap-3 rounded-md border border-border bg-card p-3 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <action.icon className="h-4 w-4 text-primary" />
                    <span>{action.label}</span>
                  </a>
                ))
              )}
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
                {systemStatus.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No system status information</p>
                  </div>
                ) : (
                  systemStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
