import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://31.97.135.175:8989/api/health/')
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Health API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health status' },
      { status: 500 }
    )
  }
}
