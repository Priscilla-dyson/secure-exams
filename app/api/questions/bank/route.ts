import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware'

// GET /api/questions/bank - List questions from the question bank
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subjectId = searchParams.get('subjectId')
    const creatorId = searchParams.get('creatorId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = { isActive: includeInactive ? undefined : true }

    if (category) where.category = category
    if (subjectId) where.subjectId = subjectId
    if (creatorId) where.creatorId = creatorId
    if (search) {
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { plainText: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Lecturers see their own questions + questions in their department
    if (user.role === 'LECTURER') {
      where.OR = [
        { creatorId: user.id },
        ...(user.departmentId ? [{ subject: { departmentId: user.departmentId } }] : [])
      ]
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          options: { orderBy: { order: 'asc' } },
          subject: {
            select: { id: true, name: true, code: true, departmentId: true }
          },
          creator: {
            select: { id: true, name: true }
          },
          parent: {
            select: { id: true, text: true }
          },
          _count: {
            select: {
              subQuestions: true,
              exams: true,
              answers: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.question.count({ where })
    ])

    return NextResponse.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching question bank:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/questions/bank - Create a new question in the bank
export async function POST(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN', 'LECTURER'])
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const {
      category,
      subjectId,
      text,
      plainText,
      instructions,
      marks,
      difficulty,
      parentId,
      order,
      correctAnswer,
      mathAnswer,
      tolerance,
      caseSensitive,
      maxLength,
      options,
      subQuestions,
      markingRules
    } = body

    if (!text || !category) {
      return NextResponse.json(
        { error: 'Question text and category are required' },
        { status: 400 }
      )
    }

    const validCategories = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'MATH', 'STRUCTURED']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        category,
        subjectId: subjectId || null,
        text,
        plainText: plainText || text.replace(/\\\(.*?\\\)/g, '').replace(/\\\[.*?\\\]/g, '').replace(/\$/g, ''),
        instructions: instructions || null,
        marks: marks || 1,
        difficulty: difficulty || 1,
        parentId: parentId || null,
        order: order || null,
        correctAnswer: correctAnswer || null,
        mathAnswer: mathAnswer || null,
        tolerance: tolerance || null,
        caseSensitive: caseSensitive || false,
        maxLength: maxLength || null,
        markingRules: markingRules || null,
        creatorId: user.id,
        options: options && options.length > 0 ? {
          create: options.map((opt: any, idx: number) => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false,
            order: idx + 1
          }))
        } : undefined,
        subQuestions: subQuestions && subQuestions.length > 0 ? {
          create: subQuestions.map((sq: any, idx: number) => ({
            category: sq.category || 'SHORT_ANSWER',
            subjectId: sq.subjectId || null,
            text: sq.text,
            marks: sq.marks || 1,
            order: sq.order || idx + 1,
            correctAnswer: sq.correctAnswer || null,
            creatorId: user.id
          }))
        } : undefined
      },
      include: {
        options: { orderBy: { order: 'asc' } },
        subQuestions: {
          include: { options: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' }
        },
        subject: {
          select: { id: true, name: true, code: true }
        },
        creator: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ success: true, question }, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}