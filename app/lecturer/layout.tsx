import { SidebarLayout } from '@/components/sidebar-layout'

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout userRole="lecturer">{children}</SidebarLayout>
}
