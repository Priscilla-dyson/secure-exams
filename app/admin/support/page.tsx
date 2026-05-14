"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Megaphone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Reply,
  Archive,
  Bell,
  Wrench,
  BookOpen,
} from "lucide-react";

type TicketStatus = 'open' | 'responded' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TabType = 'tickets' | 'announcements';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'academic' | 'account';
  submittedBy: string;
  role: 'student' | 'lecturer';
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
  type: 'exam' | 'maintenance' | 'academic' | 'general';
  priority: 'normal' | 'important' | 'urgent';
  author: string;
  createdAt: string;
  expiresAt?: string;
  targetAudience: 'all' | 'students' | 'lecturers' | 'admin';
}

export default function SupportAndAnnouncements() {
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);

  const tickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      title: 'Cannot submit exam',
      description: 'Submit button is not working during Data Structures exam',
      category: 'technical',
      submittedBy: 'Miles Tembo',
      role: 'student',
      status: 'open',
      priority: 'urgent',
      createdAt: '30 minutes ago',
    },
    {
      id: 'TKT-002',
      title: 'Question bank upload issue',
      description: 'Unable to upload questions for upcoming exam',
      category: 'technical',
      submittedBy: 'Dr. Sarah Johnson',
      role: 'lecturer',
      status: 'responded',
      priority: 'high',
      createdAt: '2 hours ago',
      lastResponse: '1 hour ago',
      assignedTo: 'John Admin',
    },
    {
      id: 'TKT-003',
      title: 'Grade inquiry',
      description: 'Question about final grade in Database Management',
      category: 'academic',
      submittedBy: 'Jane Smith',
      role: 'student',
      status: 'resolved',
      priority: 'medium',
      createdAt: '1 day ago',
      lastResponse: '12 hours ago',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ANN-001',
      title: 'Scheduled Maintenance',
      content: 'System will be unavailable on Saturday from 2:00 AM to 6:00 AM for routine maintenance.',
      type: 'maintenance',
      priority: 'important',
      author: 'System Administrator',
      createdAt: '2 days ago',
      expiresAt: '2025-01-25',
      targetAudience: 'all',
    },
    {
      id: 'ANN-002',
      title: 'Mid-Semester Exam Schedule',
      content: 'Mid-semester examinations will begin on February 15, 2025. Please check your individual schedules.',
      type: 'exam',
      priority: 'normal',
      author: 'Academic Office',
      createdAt: '1 week ago',
      targetAudience: 'students',
    },
    {
      id: 'ANN-003',
      title: 'New AI Monitoring Features',
      content: 'Enhanced AI monitoring features have been deployed to improve exam integrity.',
      type: 'general',
      priority: 'normal',
      author: 'IT Department',
      createdAt: '3 days ago',
      targetAudience: 'lecturers',
    },
  ];

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
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewTicket(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
          <button
            onClick={() => setShowNewAnnouncement(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <Megaphone className="h-4 w-4" />
            New Announcement
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-64 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="responded">Responded</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
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

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Ticket Stats */}
          <div className="grid grid-cols-4 gap-4">
            {ticketStats.map((stat, index) => (
              <div key={index} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className={`mt-3 text-2xl font-semibold ${stat.color}`}>{stat.count}</p>
              </div>
            ))}
          </div>

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
                  {filteredTickets.map((ticket) => (
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
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {ticket.lastResponse || ticket.createdAt}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1 text-muted-foreground hover:text-foreground" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-foreground" title="Respond">
                            <Reply className="h-4 w-4" />
                          </button>
                          {ticket.status === 'resolved' && (
                            <button className="p-1 text-muted-foreground hover:text-foreground" title="Close">
                              <Archive className="h-4 w-4" />
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
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {announcements.map((announcement) => (
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
                      {announcement.priority === 'important' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2 py-1 text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <span>{announcement.createdAt}</span>
                      <span className="capitalize">Target: {announcement.targetAudience}</span>
                      {announcement.expiresAt && (
                        <span>Expires: {announcement.expiresAt}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button className="p-1 text-muted-foreground hover:text-foreground" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Support Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <input type="text" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="technical">Technical Issue</option>
                  <option value="academic">Academic Issue</option>
                  <option value="account">Account Issue</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" rows={4} />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowNewTicket(false)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      {showNewAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <input type="text" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Type</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="exam">Exam Notice</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="academic">Academic</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Target Audience</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="lecturers">Lecturers Only</option>
                  <option value="admin">Admin Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Content</label>
                <textarea className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" rows={4} />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowNewAnnouncement(false)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
