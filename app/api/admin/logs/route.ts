import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') || 'all'

    // Build where clause based on type filter
    const whereClause: any = {}
    if (type !== 'all') {
      whereClause.type = type
    }

    const logs = await prisma.systemLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    // Get log counts by type
    const authLogsCount = await prisma.systemLog.count({ where: { type: 'AUTH' } })
    const userLogsCount = await prisma.systemLog.count({ where: { type: 'USER' } })
    const examLogsCount = await prisma.systemLog.count({ where: { type: 'EXAM' } })
    const securityLogsCount = await prisma.systemLog.count({ where: { type: 'SECURITY' } })

    return NextResponse.json({
      success: true,
      logs,
      counts: {
        auth: authLogsCount,
        user: userLogsCount,
        exam: examLogsCount,
        security: securityLogsCount,
        total: logs.length
      }
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, userId, details, ipAddress, userAgent } = body

    const log = await prisma.systemLog.create({
      data: {
        type,
        action,
        userId,
        details,
        ipAddress,
        userAgent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}