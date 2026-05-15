'use client'

import { SidebarLayout } from '@/components/sidebar-layout'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout userRole="student">
      {children}
    </SidebarLayout>
  )
}
