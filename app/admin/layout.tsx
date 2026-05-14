'use client'

import { SidebarLayout } from '@/components/sidebar-layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout userRole="admin">
      {children}
    </SidebarLayout>
  )
}
