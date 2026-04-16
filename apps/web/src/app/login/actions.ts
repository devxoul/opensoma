'use server'

import { sealData } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SomaClient } from '@/lib/sdk'
import type { SessionData } from '@/lib/session'
import { sessionOptions } from '@/lib/session-options'

export interface LoginState {
  error: string
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: '아이디와 비밀번호를 입력해주세요.' }
  }

  try {
    const client = new SomaClient({ username, password })
    await client.login()

    const sessionData = client.getSessionData()
    if (!sessionData.sessionCookie || !sessionData.csrfToken) {
      return { error: '로그인에 실패했습니다.' }
    }

    // Mobile Safari does not persist cookies written via iron-session's
    // session.save() inside Server Actions (iron-session#870). Seal the
    // payload manually and write it with cookies().set() to avoid the bug.
    const sealed = await sealData(
      {
        sessionCookie: sessionData.sessionCookie,
        csrfToken: sessionData.csrfToken,
        username,
        password,
        isLoggedIn: true,
      } satisfies SessionData,
      { password: sessionOptions.password, ttl: sessionOptions.ttl },
    )

    const cookieStore = await cookies()
    cookieStore.set(sessionOptions.cookieName, sealed, sessionOptions.cookieOptions)
  } catch {
    return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
  }

  redirect('/dashboard')
}
