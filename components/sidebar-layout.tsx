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
  ShieldCheck,
  Library,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SidebarLayoutProps {
  children: React.ReactNode
  userRole: 'student' | 'lecturer' | 'admin'
  isHod?: boolean
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
  { href: '/lecturer/results', label: 'Results & Reports', icon: BarChart3 },
  { href: '/lecturer/profile', label: 'Profile & Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/examination-oversight', label: 'Examination Oversight', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports & Results', icon: BarChart3 },
  { href: '/admin/academic-structure', label: 'Academic Structure', icon: Building2 },
  { href: '/admin/support', label: 'Support', icon: HelpCircle },
]

const hodNavItems = [
  { href: '/lecturer/dashboard?hod=true', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/lecturer/department-management', label: 'Lecturers & Modules', icon: Users },
  { href: '/lecturer/department-exams', label: 'All Department Exams', icon: ClipboardList },
  { href: '/lecturer/department-results', label: 'Department Results', icon: BarChart3 },
  { href: '/lecturer/department-integrity', label: 'Exam Integrity', icon: ShieldAlert },
]

export function SidebarLayout({ children, userRole, isHod }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isHodUser, setIsHodUser] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        const localIsHod = parsed.role === 'LECTURER' && parsed.isHod === true
        setIsHodUser(localIsHod)
      }
    }
  }, [])

  const effectiveIsHod = (isHod && userRole === 'lecturer') || isHodUser || false

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('currentUser')
    window.location.href = '/login'
  }

  const navItems = userRole === 'student' 
    ? studentNavItems 
    : userRole === 'lecturer' 
      ? lecturerNavItems 
      : adminNavItems

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
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open menu"
              title="Open menu"
              className="lg:hidden p-2 rounded-md text-onSurface-variant hover:bg-surface-container-high transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight hidden sm:inline-block">ExamSecure</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-onSurface-variant capitalize">
                  {userRole}{effectiveIsHod ? ' • HOD' : ''}
                </p>
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

      <div className="flex relative">
        {/* Sidebar - fixed on desktop so it doesn't scroll with page */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-40 w-80 transform border-r border-border bg-surface-container-lowest transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}>
          <div className="flex h-full flex-col pt-16"> {/* pt-16 to offset topbar height */}
            {/* Sidebar Header - Mobile */}
            <div className="flex items-center justify-between p-6 border-b border-border lg:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-primary">ExamSecure</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-onSurface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Close menu"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation - scrollable list only, sidebar stays fixed */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
              {effectiveIsHod && (
                <>
                  <div className="pt-4 pb-1">
                    <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      HOD Management
                    </p>
                  </div>
                  {hodNavItems.map((item) => (
                    <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
                  ))}
                </>
              )}
            </nav>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-border bg-surface-container-lowest">
              <button
                type="button"
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

        {/* Main Content - offset by sidebar width on desktop so sidebar stays fixed */}
        <main className="flex-1 min-h-screen lg:ml-80 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}