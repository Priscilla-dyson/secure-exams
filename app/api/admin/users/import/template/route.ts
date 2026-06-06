import { NextRequest, NextResponse } from 'next/server'
import { authorize, unauthorizedResponse } from '@/lib/middleware'
import { generateCsv, importTemplates } from '@/lib/csv'

const typeMap: Record<string, string> = {
  'student': 'students',
  'lecturer': 'lecturers',
  'students': 'students',
  'lecturers': 'lecturers',
  'modules': 'modules',
  'programs': 'programs'
}

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['ADMIN'])
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const rawType = searchParams.get('type') || 'students'
    const type = typeMap[rawType] || 'students'

    const template = importTemplates[type]
    if (!template) {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    const csv = generateCsv(template.headers, [template.sampleRow])
    const filename = `${type}_import_template.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}