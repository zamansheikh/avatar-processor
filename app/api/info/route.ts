import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://31.97.135.175:8989/api/info/')
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Info API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API info' },
      { status: 500 }
    )
  }
}
