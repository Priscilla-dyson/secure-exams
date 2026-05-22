"use client";

import { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  BookOpen,
  FileText,
  Clock,
  Activity,
  AlertTriangle,
  Shield,
  Server,
  Database,
  LogIn,
  CheckCircle,
  XCircle,
  UserPlus,
  UserX,
  RotateCcw,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAllLogins, setShowAllLogins] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [showAllExams, setShowAllExams] = useState(false)
  const [showAllSecurity, setShowAllSecurity] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  const statsCards = [
    { label: 'Total Students', value: data.totalStudents, icon: Users, change: `${data.activeUsers} active users` },
    { label: 'Total Lecturers', value: data.totalLecturers, icon: UserCheck, change: 'Faculty members' },
    { label: 'Total Exams', value: data.totalExams, icon: FileText, change: `${data.activeExams} active now` },
    { label: 'Active Exams', value: data.activeExams, icon: Clock, change: 'Currently running' },
    { label: 'Classes', value: data.totalClasses, icon: BookOpen, change: 'Academic programs' },
    { label: 'Modules', value: data.totalModules, icon: BookOpen, change: 'Course modules' },
    { label: 'Exam Attempts', value: data.totalAttempts, icon: Activity, change: 'Total submissions' },
    { label: 'Results', value: data.totalResults, icon: FileText, change: 'Graded results' },
  ]

  const hasAlerts = data.alerts.failedLogins > 0 || data.alerts.suspiciousAttempts > 0

  const getActivityIcon = (action: string) => {
    if (action === 'USER_CREATED') return UserPlus
    if (action === 'USER_DELETED') return UserX
    if (action === 'PASSWORD_RESET') return RotateCcw
    if (action === 'USER_UPDATED') return Eye
    return Activity
  }

  const getActivityColor = (action: string) => {
    if (action === 'USER_CREATED') return 'bg-green-100 text-green-700'
    if (action === 'USER_DELETED') return 'bg-red-100 text-red-700'
    if (action === 'PASSWORD_RESET') return 'bg-amber-100 text-amber-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.todayLogEntries} activities today · {data.totalLogEntries} total system events
        </p>
        <button
          onClick={fetchData}
          className="text-xs text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        {/* Left Column - Recent Logins */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Logins */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Recent Logins ({data.recentLogins.length})
              </h2>
              {data.recentLogins.length > 3 && (
                <button
                  onClick={() => setShowAllLogins(!showAllLogins)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showAllLogins ? 'Show Less' : `View All (${data.recentLogins.length})`}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.recentLogins.length === 0 ? (
                <div className="text-center py-6 rounded-md border border-border bg-card">
                  <p className="text-sm text-muted-foreground">No login activity recorded yet</p>
                </div>
              ) : (
                data.recentLogins.slice(0, showAllLogins ? data.recentLogins.length : 3).map((log: any, index: number) => (
                  <div key={log.id || index} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      log.action === 'LOGIN_SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.action === 'LOGIN_SUCCESS' ? <LogIn className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {log.user?.name || 'Unknown'} 
                        <span className="text-xs text-muted-foreground ml-1">({log.user?.role || 'N/A'})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.action === 'LOGIN_SUCCESS' ? 'Logged in' : 'Failed login'} · {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent User Activity */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Recent User Activity ({data.recentUserActivity.length})
              </h2>
              {data.recentUserActivity.length > 3 && (
                <button
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showAllActivity ? 'Show Less' : `View All (${data.recentUserActivity.length})`}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.recentUserActivity.length === 0 ? (
                <div className="text-center py-6 rounded-md border border-border bg-card">
                  <p className="text-sm text-muted-foreground">No user activity recorded yet</p>
                </div>
              ) : (
                data.recentUserActivity.slice(0, showAllActivity ? data.recentUserActivity.length : 3).map((log: any, index: number) => {
                  const Icon = getActivityIcon(log.action)
                  const color = getActivityColor(log.action)
                  return (
                    <div key={log.id || index} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.details || log.action} · {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Recent Exam Activity */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Recent Exam Activity ({data.recentExamActivity.length})
              </h2>
              {data.recentExamActivity.length > 3 && (
                <button
                  onClick={() => setShowAllExams(!showAllExams)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showAllExams ? 'Show Less' : `View All (${data.recentExamActivity.length})`}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.recentExamActivity.length === 0 ? (
                <div className="text-center py-6 rounded-md border border-border bg-card">
                  <p className="text-sm text-muted-foreground">No exam activity yet</p>
                </div>
              ) : (
                data.recentExamActivity.slice(0, showAllExams ? data.recentExamActivity.length : 3).map((attempt: any, index: number) => (
                  <div key={attempt.id || index} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{attempt.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.exam?.title || 'Unknown exam'} · {attempt.status.replace('_', ' ').toLowerCase()} · {new Date(attempt.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Status */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                System Status
              </h2>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Database</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Server</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Running</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">API</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Active</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total events logged</span>
                    <span className="text-foreground font-medium">{data.totalLogEntries}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Events today</span>
                    <span className="text-foreground font-medium">{data.todayLogEntries}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Alerts */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Alerts
              </h2>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              {!hasAlerts ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No alerts — system is healthy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.alerts.failedLogins > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="text-foreground">
                        {data.alerts.failedLogins} total failed login(s)
                        {data.alerts.recentFailedLogins > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({data.alerts.recentFailedLogins} in last 24h)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {data.alerts.suspiciousAttempts > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="text-foreground">{data.alerts.suspiciousAttempts} suspicious exam attempt(s)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Recent Security Events */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Security Events
              </h2>
              {(data.recentSecurityEvents.length > 2 || data.recentSuspicious.length > 2) && (
                <button
                  onClick={() => setShowAllSecurity(!showAllSecurity)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showAllSecurity ? 'Show Less' : `View All (${data.recentSecurityEvents.length + data.recentSuspicious.length})`}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.recentSecurityEvents.length === 0 && data.recentSuspicious.length === 0 ? (
                <div className="text-center py-6 rounded-md border border-border bg-card">
                  <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No security events</p>
                </div>
              ) : (
                <>
                  {data.recentSecurityEvents.slice(0, showAllSecurity ? data.recentSecurityEvents.length : 2).map((evt: any, index: number) => (
                    <div key={`sec-${index}`} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{evt.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {evt.user?.name || 'System'} · {new Date(evt.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {data.recentSuspicious.slice(0, showAllSecurity ? data.recentSuspicious.length : 2).map((s: any, index: number) => (
                    <div key={`sus-${index}`} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Suspicious: {s.student?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.exam?.title || 'Unknown'} · {new Date(s.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}