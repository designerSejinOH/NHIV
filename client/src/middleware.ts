import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // /admin 경로 보호 (로그인 페이지 제외)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // 토큰 검증
      JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'))
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
