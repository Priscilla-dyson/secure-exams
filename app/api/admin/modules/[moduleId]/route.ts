import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// GET /api/admin/modules/[moduleId] - Get single module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { moduleId } = await params

    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        class: { select: { id: true, name: true, year: true } },
        program: { select: { id: true, name: true } },
        lecturer: { select: { id: true, name: true, email: true } }
      }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, module: moduleData })
  } catch (error) {
    console.error('Get module error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/modules/[moduleId] - Update module (assign lecturer, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { moduleId } = await params
    const body = await request.json()
    const { lecturerId } = body

    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        lecturerId: lecturerId || null
      },
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, module: updatedModule })
  } catch (error) {
    console.error('Update module error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/modules/[moduleId] - Delete a module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { moduleId } = await params

    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    await prisma.module.delete({
      where: { id: moduleId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete module error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}