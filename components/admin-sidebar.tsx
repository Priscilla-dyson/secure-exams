'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users Management' },
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/lecturers', label: 'Lecturers' },
    { href: '/admin/departments', label: 'Departments' },
    { href: '/admin/courses', label: 'Courses' },
    { href: '/admin/examinations', label: 'Examinations' },
    { href: '/admin/bulk-upload', label: 'Bulk Upload' },
    { href: '/admin/logs', label: 'System Logs' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <aside className="w-[260px] border-r border-[#e2e8f0] bg-white">
      <div className="px-6 py-6 border-b border-[#e2e8f0]">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#64748b]">Admin console</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#1a202c]">SWEARS</h1>
      </div>

      <nav className="px-4 py-6 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-[#111827] text-white'
                  : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-5 border-t border-[#e2e8f0]">
        <button className="w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-semibold text-[#1a202c] transition hover:bg-[#f8fafc]">Logout</button>
      </div>
    </aside>
  )
}
