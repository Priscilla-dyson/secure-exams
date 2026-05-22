import { NextResponse } from 'next/server'

// Placeholder - grading routes are under [attemptId]
export async function GET() {
  return NextResponse.json({ error: 'Specify an attempt ID' }, { status: 400 })
}