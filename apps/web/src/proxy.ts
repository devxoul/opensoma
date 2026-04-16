import { NextResponse, type NextRequest } from 'next/server'

import { sessionOptions } from '@/lib/session-options'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  if (!request.cookies.has(sessionOptions.cookieName)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!(?:login|docs|design)(?:/|$)|_next/|favicon\\.ico$|sitemap\\.xml$|robots\\.txt$).*)'],
}
