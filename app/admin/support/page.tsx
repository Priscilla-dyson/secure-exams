'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare,
  Megaphone,
  Search,
  Plus,
  Filter,
  Archive,
  Bell,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

type TabType = 'tickets' | 'announcements'
type TicketStatus = 'open' | 'responded' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  role: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastResponse?: string;
  assignedTo?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  author: string;
  createdAt: string;
  expiresAt?: string;
  targetAudience: string;
}

export default function SupportAndAnnouncements() {
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const handleCreateNew = () => {
    console.log('Create new based on active tab:', activeTab);
    if (activeTab === 'tickets') {
      setShowNewTicket(true);
    } else {
      setShowNewAnnouncement(true);
    }
  };

  const handleViewTicket = (ticketId: string) => {
    console.log('View ticket:', ticketId);
    // Implement view ticket functionality
  };

  const handleRespondTicket = (ticketId: string) => {
    console.log('Respond to ticket:', ticketId);
    // Implement respond to ticket functionality
  };

  const handleCloseTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to close this ticket?')) {
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'closed' as TicketStatus } : t));
    }
  };

  const handleArchiveAnnouncement = (announcementId: string) => {
    console.log('Archive announcement:', announcementId);
    // Implement archive announcement functionality
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusBadge = (status: TicketStatus) => {
    const styles = {
      open: 'bg-destructive/10 text-destructive',
      responded: 'bg-warning/10 text-warning',
      resolved: 'bg-success/10 text-success',
      closed: 'bg-muted text-muted-foreground',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status === 'open' && <div className="h-1.5 w-1.5 rounded-full bg-destructive" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const styles = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-warning/10 text-warning',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-destructive/10 text-destructive',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const ticketStats = [
    { label: 'Open', count: tickets.filter(t => t.status === 'open').length, color: 'text-destructive' },
    { label: 'Responded', count: tickets.filter(t => t.status === 'responded').length, color: 'text-warning' },
    { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'text-success' },
    { label: 'Closed', count: tickets.filter(t => t.status === 'closed').length, color: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Support & Announcements</h1>
          <p className="text-sm text-muted-foreground">Manage support tickets and system announcements</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

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

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {ticketStats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-semibold ${stat.color}`}>{stat.count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </Card>

          {/* Tickets Table */}
          <div className="rounded-md border border-border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ticket
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Submitted By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Last Activity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <p className="text-sm text-muted-foreground">No support tickets found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-accent/50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">{ticket.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm text-foreground">{ticket.submittedBy}</p>
                            <p className="text-xs text-muted-foreground capitalize">{ticket.role}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">{getPriorityBadge(ticket.priority)}</td>
                        <td className="px-4 py-4">{getStatusBadge(ticket.status)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {ticket.lastResponse || ticket.createdAt}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1 text-muted-foreground hover:text-foreground" title="View" onClick={() => handleViewTicket(ticket.id)}>
                              <User className="h-4 w-4" />
                            </button>
                            {ticket.status === 'open' && (
                              <button className="p-1 text-muted-foreground hover:text-foreground" title="Respond" onClick={() => handleRespondTicket(ticket.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {ticket.status === 'resolved' && (
                              <button className="p-1 text-muted-foreground hover:text-foreground" title="Close" onClick={() => handleCloseTicket(ticket.id)}>
                                <Archive className="h-4 w-4" />
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
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No announcements found</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-md border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                        {announcement.priority === 'urgent' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-1 text-xs font-medium">
                            <Bell className="h-3 w-3" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {announcement.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {announcement.createdAt}
                        </span>
                        {announcement.expiresAt && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Expires: {announcement.expiresAt}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => handleArchiveAnnouncement(announcement.id)}>
                        <Archive className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
