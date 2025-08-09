import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the client request
    const formData = await request.formData()
    
    // Forward the request to your HTTP server
    const response = await fetch('http://31.97.135.175:8989/api/process-avatar/', {
      method: 'POST',
      body: formData,
    })

    // Get the response from your server
    const data = await response.json()
    
    // Return the response to the client
    return NextResponse.json(data, { status: response.status })
    
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
