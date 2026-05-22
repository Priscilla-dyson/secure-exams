'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LifeBuoy,
  RefreshCw,
  CheckCircle,
  Loader2,
  Clock
} from 'lucide-react'

interface SupportTicket {
  id: string
  type: string
  action: string
  userId: string
  details: string
  createdAt: string
  user: { name: string; email: string; role: string } | null
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      // Fetch system logs that represent user issues
      const res = await fetch('/api/admin/logs?limit=50&type=all')
      const data = await res.json()
      if (data.success) {
        setTickets(data.logs)
      }
    } catch (err) {
      console.error('Error fetching support data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Filter password reset requests and suspicious logs
  const passwordResets = tickets.filter(t =>
    t.action?.toLowerCase().includes('password') ||
    t.action?.toLowerCase().includes('reset')
  )

  const issues = tickets.filter(t =>
    t.type === 'SECURITY' ||
    t.action?.toLowerCase().includes('failed') ||
    t.details?.toLowerCase().includes('error')
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" onClick={fetchTickets}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password Reset Requests */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
              Password Reset Requests
            </h2>
            {passwordResets.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No password reset requests</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {passwordResets.slice(0, 10).map((ticket) => (
                  <Card key={ticket.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {ticket.user?.name || 'Unknown'} ({ticket.user?.role || 'N/A'})
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ticket.user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.action} — {ticket.details || 'No details'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Issues & Events */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
              Issues & Security Events
            </h2>
            {issues.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No issues reported</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {issues.slice(0, 10).map((ticket) => (
                  <Card key={ticket.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        ticket.type === 'SECURITY' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        <LifeBuoy className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {ticket.action || ticket.type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ticket.user?.name || 'System'} ({ticket.user?.role || 'N/A'})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.details || 'No details'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* All Recent System Events */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3">
              Recent System Events
            </h2>
            {tickets.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No system events recorded</p>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tickets.slice(0, 30).map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-accent/50">
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {ticket.user?.name || 'System'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              ticket.type === 'SECURITY' ? 'bg-red-100 text-red-700' :
                              ticket.type === 'AUTH' ? 'bg-blue-100 text-blue-700' :
                              ticket.type === 'EXAM' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ticket.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{ticket.action}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                            {ticket.details || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}