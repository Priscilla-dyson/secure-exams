'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
  X,
  Eye,
  BookOpen
} from 'lucide-react'

type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN'
type UserStatus = 'active' | 'suspended'

interface User {
  id: string
  userId: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  class?: { id: string; name: string } | null
  lecturedModules?: {
    id: string
    name: string
    code: string
    class: { id: string; name: string } | null
    program: { id: string; name: string }
  }[]
}

interface Class {
  id: string
  name: string
  year: number
}

export default function UserManagement() {
  const [activeRole, setActiveRole] = useState<UserRole>('STUDENT')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<'create' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<Class[]>([])

  // View modules modal
  const [viewingLecturer, setViewingLecturer] = useState<User | null>(null)
  const [viewingModules, setViewingModules] = useState<{
    id: string
    name: string
    code: string
    class: { id: string; name: string } | null
    program: { id: string; name: string }
  }[]>([])

  // Form state
  const [form, setForm] = useState({
    userId: '',
    name: '',
    email: '',
    role: 'STUDENT' as UserRole,
    classId: ''
  })

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) setUsers(data.users)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      if (data.success) setClasses(data.classes)
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchClasses()
  }, [])

  // Filter users by role and search
  const filteredUsers = users.filter(user => {
    const matchesRole = user.role === activeRole
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })

  const roleCounts = {
    STUDENT: users.filter(u => u.role === 'STUDENT').length,
    LECTURER: users.filter(u => u.role === 'LECTURER').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length
  }

  // Create user
  const handleCreate = async () => {
    if (!form.userId || !form.name || !form.email) {
      alert('User ID, name, and email are required')
      return
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
        setShowModal(null)
        setForm({ userId: '', name: '', email: '', role: 'STUDENT', classId: '' })
      } else {
        alert(data.error || 'Failed to create user')
      }
    } catch (err) {
      console.error('Create error:', err)
      alert('Failed to create user')
    }
  }

  // Edit user
  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({
      userId: user.userId,
      name: user.name,
      email: user.email || '',
      role: user.role,
      classId: user.class?.id || ''
    })
    setShowModal('edit')
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          userId: form.userId,
          name: form.name,
          email: form.email,
          role: form.role,
          classId: form.classId
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
        setShowModal(null)
        setEditingUser(null)
      } else {
        alert(data.error || 'Failed to update user')
      }
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update user')
    }
  }

  // Delete user
  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete user')
    }
  }

  // Reset password
  const handleResetPassword = async (userId: string) => {
    if (!confirm('Reset password to default (changeme123)? The user will be required to change it on next login.')) return
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.success) {
        alert('Password reset successfully')
      } else {
        alert(data.error || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      alert('Failed to reset password')
    }
  }

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const tabs = [
    { id: 'STUDENT' as UserRole, label: 'Students', icon: Users, count: roleCounts.STUDENT },
    { id: 'LECTURER' as UserRole, label: 'Lecturers', icon: UserCheck, count: roleCounts.LECTURER },
    { id: 'ADMIN' as UserRole, label: 'Admins', icon: Shield, count: roleCounts.ADMIN },
  ]

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <Button onClick={() => {
          setForm({ userId: '', name: '', email: '', role: activeRole, classId: '' })
          setEditingUser(null)
          setShowModal('create')
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 w-full max-w-md rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id)}
              className={`border-b-2 pb-3 text-sm font-semibold capitalize transition ${
                activeRole === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
              </span>
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
                  Name / Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {activeRole === 'LECTURER' ? 'Assigned Modules' : 'Class'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
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
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-foreground">{user.userId}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs capitalize text-muted-foreground">{user.role.toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {activeRole === 'LECTURER' ? (
                        user.lecturedModules && user.lecturedModules.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {user.lecturedModules.length} module{user.lecturedModules.length !== 1 ? 's' : ''}
                            </Badge>
                            <button
                              onClick={() => { setViewingLecturer(user); setViewingModules(user.lecturedModules || []) }}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">No modules</span>
                        )
                      ) : (
                        user.class?.name || '-'
                      )}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title="Edit user"
                          onClick={() => openEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-amber-600"
                          title="Reset password"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-destructive"
                          title="Delete user"
                          onClick={() => handleDelete(user.id)}
                        >
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

      {/* View Modules Modal */}
      {viewingLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-md border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {viewingLecturer.name}'s Modules
              </h3>
              <button onClick={() => { setViewingLecturer(null); setViewingModules([]) }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {viewingModules.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No modules assigned</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {viewingModules.map((mod) => (
                  <div key={mod.id} className="flex items-start gap-3 p-3 rounded-md border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0 mt-0.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{mod.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{mod.code}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{mod.program.name}</span>
                        <span>•</span>
                        <span>{mod.class?.name || 'No class'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 mt-2 border-t border-border">
              <Button variant="outline" onClick={() => { setViewingLecturer(null); setViewingModules([]) }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {showModal === 'create' ? 'Add New User' : 'Edit User'}
              </h3>
              <button onClick={() => { setShowModal(null); setEditingUser(null) }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-4">
                    <div>
                <label className="text-sm font-medium text-foreground">User ID *</label>
                <Input
                  className="mt-1"
                  placeholder="Enter login User ID"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  disabled={showModal === 'edit'}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <Input
                  className="mt-1"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <Input
                  className="mt-1"
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {form.role === 'STUDENT' && (
                <div>
                  <label className="text-sm font-medium text-foreground">Class</label>
                  <select
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  >
                    <option value="">No class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} (Year {c.year})</option>
                    ))}
                  </select>
                </div>
              )}
              {showModal === 'create' && (
                <p className="text-xs text-muted-foreground">
                  Default password: <strong>changeme123</strong> — user must change on first login
                </p>
              )}
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => { setShowModal(null); setEditingUser(null) }}>
                  Cancel
                </Button>
                <Button onClick={showModal === 'create' ? handleCreate : handleUpdate}>
                  {showModal === 'create' ? 'Add User' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}