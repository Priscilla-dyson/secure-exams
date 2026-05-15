export const VALID_CREDENTIALS = {
  'STU001': { password: 'Student@2024', role: 'student', name: 'Sarah Johnson' },
  'STU002': { password: 'Student@2024', role: 'student', name: 'Michael Chen' },
  'LEC001': { password: 'Lecturer@2024', role: 'lecturer', name: 'Dr. Robert Thompson' },
  'LEC002': { password: 'Lecturer@2024', role: 'lecturer', name: 'Prof. Angela Martinez' },
  'ADMIN001': { password: 'Admin@2024', role: 'admin', name: 'Dr. James Williams' },
  'ADMIN002': { password: 'Admin@2024', role: 'admin', name: 'Jennifer Foster' },
}

export type UserRole = 'student' | 'lecturer' | 'admin'

export interface AuthUser {
  userId: string
  role: UserRole
  name: string
}

export const validateCredentials = (userId: string, password: string) => {
  const user = VALID_CREDENTIALS[userId as keyof typeof VALID_CREDENTIALS]
  if (!user) return null
  if (user.password !== password) return null
  return {
    userId,
    role: user.role as UserRole,
    name: user.name,
  }
}

export const getDashboardRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    student: '/student/dashboard',
    lecturer: '/lecturer/dashboard',
    admin: '/admin/dashboard',
  }
  return routes[role]
}
