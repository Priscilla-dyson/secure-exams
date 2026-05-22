import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

// Helper to generate class name
function generateClassName(program: string, year: number): string {
  const programNames: Record<string, string> = {
    ICT: 'ICT',
    NURSING: 'Nursing',
    BUSINESS: 'Business'
  }
  return `${programNames[program]} Year ${year}`
}

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const classes = await prisma.class.findMany({
      include: {
        program: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { program: { name: 'asc' } },
        { year: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, classes })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { program, year } = body

    if (!program || !year) {
      return NextResponse.json(
        { error: 'Program and year are required' },
        { status: 400 }
      )
    }

    // Validate program
    const validPrograms = ['ICT', 'NURSING', 'BUSINESS']
    if (!validPrograms.includes(program.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid program. Must be ICT, NURSING, or BUSINESS' },
        { status: 400 }
      )
    }

    // Validate year
    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
      return NextResponse.json(
        { error: 'Year must be between 1 and 4' },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await prisma.class.findUnique({
      where: {
        programId_year: {
          programId: program.toUpperCase(),
          year: yearNum
        }
      }
    })

    if (existingClass) {
      return NextResponse.json(
        { error: `${program} Year ${yearNum} already exists` },
        { status: 400 }
      )
    }

    const className = generateClassName(program.toUpperCase(), yearNum)

    const newClass = await prisma.class.create({
      data: {
        name: className,

        programId: program.toUpperCase(),
        year: yearNum
      }
    })

    return NextResponse.json({ success: true, class: newClass }, { status: 201 })
  } catch (error) {
    console.error('Create class error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
