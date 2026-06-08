import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// Helper to generate class name
function generateClassName(programName: string, year: number): string {
  return `${programName} Year ${year}`
}

// Auto-generate classes for all 4 years when a program is created
async function autoGenerateClasses(programId: string, programName: string) {
  const classes = []
  for (let year = 1; year <= 4; year++) {
    const className = generateClassName(programName, year)
    const existing = await prisma.class.findFirst({
      where: { name: className }
    })
    if (!existing) {
      const newClass = await prisma.class.create({
        data: {
          name: className,
          programId: programId,
          year
        }
      })
      classes.push(newClass)
    }
  }
  return classes
}

// GET /api/admin/programs - Get all programs
export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const programs = await prisma.program.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            students: true,
            classes: true,
            modules: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, programs })
  } catch (error) {
    console.error('Get programs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/programs - Create a new program
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { name, departmentId } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Program name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if program already exists
    const existing = await prisma.program.findUnique({
      where: { name: trimmedName }
    })

    if (existing) {
      return NextResponse.json(
        { error: `Program "${trimmedName}" already exists` },
        { status: 400 }
      )
    }

    // If departmentId provided, verify department exists
    if (departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: departmentId }
      })
      if (!dept) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 400 }
        )
      }
    }

    // Create the program
    const program = await prisma.program.create({
      data: { 
        name: trimmedName,
        departmentId: departmentId || null 
      }
    })

    // Auto-generate 4 classes for this program
    await autoGenerateClasses(program.id, trimmedName)

    // Return program with counts and department
    const programWithCounts = await prisma.program.findUnique({
      where: { id: program.id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            students: true,
            classes: true,
            modules: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, program: programWithCounts }, { status: 201 })
  } catch (error) {
    console.error('Create program error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}