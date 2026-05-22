import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getAuthToken() {
  const cookieHeader = (await headers()).get('cookie') ?? ''
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('auth-token='))
    ?.slice('auth-token='.length)
}

async function requireAdminAuth() {
  const token = await getAuthToken()
  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/login')
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminAuth()

  return (
    <SidebarLayout userRole="admin">
      {children}
    </SidebarLayout>
  )
}
