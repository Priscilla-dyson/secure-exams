import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserById } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

// Middleware to authenticate requests
export async function authenticate(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await getUserById(payload.userId)
    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Middleware to check if user has required role
export async function authorize(request: NextRequest, allowedRoles: string[]) {
  const user = await authenticate(request)

  if (!user) {
    return null
  }

  if (!allowedRoles.includes(user.role)) {
    return null
  }

  return user
}

// Helper function to create unauthorized response
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

// Helper function to create forbidden response
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}
