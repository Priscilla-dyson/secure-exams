"use client";

import { useState } from "react";
import {
  Users,
  UserCheck,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  UserX,
  Upload,
} from "lucide-react";

type UserRole = 'student' | 'lecturer' | 'admin';
type UserStatus = 'active' | 'inactive' | 'suspended';

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

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Miles Tembo',
      email: 'miles.tembo@university.edu',
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      registrationNumber: '2021-CS-0421',
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      role: 'lecturer',
      department: 'Computer Science',
      status: 'active',
      employeeId: 'EMP-001',
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@university.edu',
      role: 'admin',
      department: 'IT Services',
      status: 'active',
      employeeId: 'ADMIN-001',
    },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesTab = user.role === activeTab;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'student', label: 'Students', icon: Users, count: 1248 },
    { id: 'lecturer', label: 'Lecturers', icon: UserCheck, count: 87 },
    { id: 'admin', label: 'Admins', icon: Shield, count: 5 },
  ];

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-muted text-muted-foreground',
      suspended: 'bg-destructive/10 text-destructive',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-success" />}
        {status === 'suspended' && <div className="h-1.5 w-1.5 rounded-full bg-destructive" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddUser(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-64 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

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
              {filteredUsers.map((user) => (
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
                    {user.registrationNumber || user.employeeId || user.id}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">{user.email}</td>
                  <td className="px-4 py-4 text-sm text-foreground">{user.department}</td>
                  <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
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
              ))}
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
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input type="text" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input type="email" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Department</label>
                <input type="text" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowAddUser(false)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
