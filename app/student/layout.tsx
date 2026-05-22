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

async function requireStudentAuth() {
  const token = await getAuthToken()
  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'STUDENT') {
    redirect('/login')
  }
}

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireStudentAuth()

  return (
    <SidebarLayout userRole="student" showHeader={false}>
      {children}
    </SidebarLayout>
  )
}
