'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AuthUser } from '@/lib/auth'
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Menu,
  X,
  LogOut,
  Users,
  UserCog,
  Building2,
  BookCopy,
  ClipboardList,
  Upload,
  Server,
  Bell,
  HelpCircle,
  Search,
  Calendar,
  Clock,
  Award,
  UserCheck,
  FileQuestion,
  FileBarChart,
  Eye,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SidebarLayoutProps {
  children: React.ReactNode
  userRole: 'student' | 'lecturer' | 'admin'
  showHeader?: boolean
}

// Navigation items with icons
const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/examinations', label: 'Examinations', icon: FileText },
  { href: '/student/results', label: 'Results', icon: BarChart3 },
  { href: '/student/profile', label: 'Profile & Settings', icon: Settings },
  { href: '/student/help', label: 'Help & Support', icon:FileText },
]

const lecturerNavItems = [
  { href: '/lecturer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lecturer/exam-management', label: 'Exam Management', icon: FileText },
  { href: '/lecturer/submissions', label: 'Submissions & Grading', icon: CheckCircle },
  { href: '/lecturer/question-bank', label: 'Question Bank', icon: BookOpen },
  { href: '/lecturer/results', label: 'Results & Reports', icon: BarChart3 },
  { href: '/lecturer/profile', label: 'Profile & Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/academic-structure', label: 'Academic Structure', icon: Building2 },
  { href: '/admin/examination-oversight', label: 'Examination Oversight', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports & Results', icon: BarChart3 },
  { href: '/admin/support', label: 'Support & Announcements', icon: HelpCircle },
  { href: '/admin/system-settings', label: 'System Settings', icon: Settings },
]

// Get page title from pathname
const getPageTitle = (pathname: string, userRole: string) => {
  if (pathname.includes('/dashboard')) return 'Dashboard'
  if (pathname.includes('/exam-management')) return 'Exam Management'
  if (pathname.includes('/submissions')) return 'Submissions & Grading'
  if (pathname.includes('/question-bank')) return 'Question Bank'
  if (pathname.includes('/results')) return 'Results & Reports'
  if (pathname.includes('/profile')) return 'Profile'
  if (pathname.includes('/settings')) return 'Settings'
  if (pathname.includes('/users')) return 'User Management'
  if (pathname.includes('/academic-structure')) return 'Academic Structure'
  if (pathname.includes('/examination-oversight')) return 'Examination Oversight'
  if (pathname.includes('/support')) return 'Support & Announcements'
  if (pathname.includes('/system-settings')) return 'System Settings'
  return 'Dashboard'
}

// Get page subtitle based on role and page
const getPageSubtitle = (pathname: string, userRole: string) => {
  if (userRole === 'student') return 'Manage your exams and view results'
  if (userRole === 'lecturer') return 'Create exams, grade submissions, and manage courses'
  return 'Manage users, courses, and system settings'
}

export function SidebarLayout({ children, userRole, showHeader = true }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/login'
  }

  const navItems = userRole === 'student' 
    ? studentNavItems 
    : userRole === 'lecturer' 
      ? lecturerNavItems 
      : adminNavItems

  const pageTitle = getPageTitle(pathname, userRole)
  const pageSubtitle = getPageSubtitle(pathname, userRole)

  // NavItem Component
  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary border-l-3 border-primary'
            : 'text-onSurface-variant hover:bg-surface-container-high hover:text-foreground'
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface-container-lowest">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-onSurface-variant hover:bg-surface-container-high transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight hidden sm:inline-block">SWEARS</span>
            </div>
          </div>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-80 rounded-md border border-border bg-surface-container-low pl-9 pr-3 text-sm text-foreground placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md text-onSurface-variant hover:bg-surface-container-high transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
            </button>
            <button className="hidden sm:block p-2 rounded-md text-onSurface-variant hover:bg-surface-container-high transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-onSurface-variant capitalize">{userRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-40 w-80 transform border-r border-border bg-surface-container-lowest transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex h-full flex-col">
            {/* Sidebar Header - Mobile */}
            <div className="flex items-center justify-between p-6 border-b border-border lg:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-primary">SWEARS</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-2 rounded-md text-onSurface-variant hover:bg-surface-container-high transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
            </nav>
            
            {/* Footer Section - Sticky at bottom */}
            <div className="sticky bottom-0 p-4 border-t border-border bg-surface-container-lowest">
              <div className="p-4 rounded-lg bg-surface-container">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-onSurface-variant uppercase tracking-wider">Academic Year</p>
                </div>
                <p className="text-sm font-medium text-foreground">2024/2025 - Semester 2</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-onSurface-variant">
                    <span>Current Period:</span>
                    <span className="font-medium">Jan - Jun 2025</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-border bg-surface-container-lowest">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-onSurface-variant transition-all hover:bg-error/10 hover:text-error hover:border-error/30"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Page Header */}
          {showHeader && (
            <div className="border-b border-border bg-surface-container-lowest px-6 py-5 lg:px-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {pageTitle}
                </h1>
                <p className="text-body-sm text-onSurface-variant">
                  {pageSubtitle}
                </p>
              </div>
            </div>
          )}
          
          {/* Page Content */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}