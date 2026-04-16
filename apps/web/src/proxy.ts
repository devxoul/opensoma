import { getIronSession } from 'iron-session'
import { NextResponse, type NextRequest } from 'next/server'

import type { SessionData } from '@/lib/session'
import { sessionOptions } from '@/lib/session-options'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!(?:login|docs|design)(?:/|$)|_next/|favicon\\.ico$|sitemap\\.xml$|robots\\.txt$).*)'],
}
