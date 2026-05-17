'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  Users,
  Shield,
  Download,
  FileDown,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  AlertTriangle,
  Eye,
  Calendar
} from 'lucide-react'

type ReportType = 'examination' | 'user' | 'integrity'
type TimeRange = 'week' | 'month' | 'semester' | 'year'

export default function ReportsAndResults() {
  const [activeTab, setActiveTab] = useState<ReportType>('examination');
  const [timeRange, setTimeRange] = useState<TimeRange>('semester');

  const examStats: any[] = []

  const userStats: any[] = []

  const integrityStats: any[] = []

  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);

  const handleExportReport = () => {
    console.log('Exporting report for:', activeTab, 'time range:', timeRange);
    // Implement export report functionality
  };

  const handleDownloadCSV = () => {
    console.log('Downloading CSV for:', activeTab, 'time range:', timeRange);
    // Implement download CSV functionality
  };

  const handleViewIncident = (incidentId: string) => {
    console.log('Viewing incident details:', incidentId);
    // Implement view incident functionality
  };

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

  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-warning/10 text-warning',
      high: 'bg-destructive/10 text-destructive',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[severity as keyof typeof styles]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'under investigation': 'bg-destructive/10 text-destructive',
      reviewing: 'bg-warning/10 text-warning',
      resolved: 'bg-success/10 text-success',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports & Results</h1>
          <p className="text-sm text-muted-foreground">View and download examination, user, and integrity reports</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  timeRange === range.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={handleDownloadCSV}>
            <FileDown className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div>
        <nav className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportType)}
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

      {/* Examination Reports Tab */}
      {activeTab === 'examination' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {examStats.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-muted-foreground">No examination statistics available</p>
              </div>
            ) : (
              examStats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Reports Tab */}
      {activeTab === 'user' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {userStats.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-muted-foreground">No user statistics available</p>
              </div>
            ) : (
              userStats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Integrity Reports Tab */}
      {activeTab === 'integrity' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {integrityStats.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-muted-foreground">No integrity statistics available</p>
              </div>
            ) : (
              integrityStats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-destructive' : 'text-success'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Recent Incidents */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Recent Incidents
            </h2>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No incidents reported</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <Card key={incident.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{incident.type}</h3>
                          {getSeverityBadge(incident.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Student: {incident.student}</span>
                          <span>Module: {incident.module}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {incident.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(incident.status)}
                        <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => handleViewIncident(incident.id)}>
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
