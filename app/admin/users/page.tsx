'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  UserCheck,
  Shield,
  Search,
  Plus,
  Edit,
  RotateCcw,
  UserX,
  Filter
} from 'lucide-react'

type UserRole = 'student' | 'lecturer' | 'admin'
type UserStatus = 'active' | 'inactive' | 'suspended'

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  registrationNumber?: string;
  employeeId?: string;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [showAddUser, setShowAddUser] = useState(false);

  const mockUsers: User[] = []

  const filteredUsers = mockUsers.filter(user => {
    const matchesTab = user.role === activeTab;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'student', label: 'Students', icon: Users, count: 0 },
    { id: 'lecturer', label: 'Lecturers', icon: UserCheck, count: 0 },
    { id: 'admin', label: 'Admins', icon: Shield, count: 0 },
  ];

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-muted text-muted-foreground',
      suspended: 'bg-destructive/10 text-destructive',
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
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage students, lecturers, and administrators</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as UserRole)}
              className={`border-b-2 pb-3 text-sm font-semibold capitalize transition ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Users Table */}
      <div className="rounded-md border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Department
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {user.registrationNumber || user.employeeId || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{user.email}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{user.department}</td>
                    <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-foreground">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-destructive">
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input className="mt-1" placeholder="Enter name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input className="mt-1" type="email" placeholder="Enter email" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Department</label>
                <Input className="mt-1" placeholder="Enter department" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                <Button>Add User</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
