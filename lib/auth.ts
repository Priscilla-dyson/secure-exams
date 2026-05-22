import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface AuthUser {
  id: string
  email: string | null
  name: string
  role: string
  classId: string | null
  programId: string | null
  mustChangePassword?: boolean
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Login with email and password
export const loginUser = async (email: string, password: string): Promise<AuthUser | null> => {
  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    classId: user.classId,
    programId: user.programId,
    mustChangePassword: user.mustChangePassword
  }
}

// Login with user ID and password
export const loginByUserId = async (userId: string, password: string): Promise<AuthUser | null> => {
  const user = await prisma.user.findUnique({
    where: { userId }
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    classId: user.classId,
    programId: user.programId,
    mustChangePassword: user.mustChangePassword
  }
}

// Get user by ID
export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      classId: true,
      programId: true
    }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    classId: user.classId,
    programId: user.programId
  }
}

export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN'

export const getDashboardRoute = (role: string): string => {
  const routes: Record<string, string> = {
    STUDENT: '/student/dashboard',
    LECTURER: '/lecturer/dashboard',
    ADMIN: '/admin/dashboard',
    student: '/student/dashboard',
    lecturer: '/lecturer/dashboard',
    admin: '/admin/dashboard',
  }
  return routes[role] || '/student/dashboard'
}