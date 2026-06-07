import { NextRequest, NextResponse } from 'next/server'
import { authenticate, unauthorizedResponse } from '@/lib/middleware'
import { spawn } from 'child_process'
import path from 'path'

// POST /api/math/evaluate - Evaluate math expressions using SymPy
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { operation, expression, variable, substitutions, correctAnswer, tolerance } = body

    if (!operation || !expression) {
      return NextResponse.json(
        { error: 'Operation and expression are required' },
        { status: 400 }
      )
    }

    const validOps = ['simplify', 'solve', 'derive', 'integrate', 'evaluate', 'compare']
    if (!validOps.includes(operation)) {
      return NextResponse.json(
        { error: `Invalid operation. Must be one of: ${validOps.join(', ')}` },
        { status: 400 }
      )
    }

    // Build command arguments for the Python math service
    const mathServicePath = path.join(process.cwd(), 'services', 'math_service.py')
    const args = [mathServicePath, operation, expression]

    if (operation === 'solve' || operation === 'derive' || operation === 'integrate') {
      args.push(variable || 'x')
    } else if (operation === 'evaluate') {
      args.push(JSON.stringify(substitutions || {}))
    } else if (operation === 'compare') {
      args.push(correctAnswer || '')
      args.push(String(tolerance || 0.01))
    }

    // Execute Python script
    const result = await new Promise<string>((resolve, reject) => {
      const python = spawn('python', args)
      let stdout = ''
      let stderr = ''

      python.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      python.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      python.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(stderr || `Python process exited with code ${code}`))
        } else {
          resolve(stdout.trim())
        }
      })

      python.on('error', (err: Error) => {
        reject(new Error(`Failed to start Python process: ${err.message}`))
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        python.kill()
        reject(new Error('Math computation timed out'))
      }, 30000)
    })

    const data = JSON.parse(result)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    console.error('Math evaluation error:', error)
    return NextResponse.json(
      { error: `Math computation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// GET /api/math/evaluate?operation=...&expression=... - Quick math evaluation via query params
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    const expression = searchParams.get('expression')
    const variable = searchParams.get('variable') || 'x'
    const correctAnswer = searchParams.get('correctAnswer')

    if (!operation || !expression) {
      return NextResponse.json(
        { error: 'Operation and expression query parameters are required' },
        { status: 400 }
      )
    }

    // Forward to POST handler
    const body = { operation, expression, variable, correctAnswer }
    const modifiedRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    const response = await POST(modifiedRequest)
    return response
  } catch (error) {
    console.error('Math evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate math expression' },
      { status: 500 }
    )
  }
}