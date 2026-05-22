import { prisma } from './prisma'

export async function logActivity(params: {
  type: 'AUTH' | 'USER' | 'EXAM' | 'SECURITY'
  action: string
  userId?: string | null
  details?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    await prisma.systemLog.create({
      data: {
        type: params.type,
        action: params.action,
        userId: params.userId || null,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

export function extractRequestInfo(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return { ipAddress, userAgent }
}