import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ user: null })
  }

  try {
    const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'))
    return NextResponse.json({ user: session })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
