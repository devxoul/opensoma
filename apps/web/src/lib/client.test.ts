import { describe, expect, it } from 'bun:test'

import { AuthenticationError } from '@/lib/sdk'

import { validateClientSession } from './client'

describe('validateClientSession', () => {
  it('throws when the local session is missing', async () => {
    await expect(
      validateClientSession(
        {
          isLoggedIn: false,
        },
        {
          isLoggedIn: async () => true,
        },
      ),
    ).rejects.toBeInstanceOf(AuthenticationError)
  })

  it('throws when upstream auth is invalid without mutating the local session', async () => {
    await expect(
      validateClientSession(
        {
          isLoggedIn: true,
          sessionCookie: 'session-cookie',
          csrfToken: 'csrf-token',
        },
        {
          isLoggedIn: async () => false,
        },
      ),
    ).rejects.toBeInstanceOf(AuthenticationError)
  })

  it('returns the client when both local and upstream auth are valid', async () => {
    const client = {
      isLoggedIn: async () => true,
    }

    await expect(
      validateClientSession(
        {
          isLoggedIn: true,
          sessionCookie: 'session-cookie',
          csrfToken: 'csrf-token',
        },
        client,
      ),
    ).resolves.toBe(client)
  })

  it('retries upstream re-login once before failing', async () => {
    let loginAttempts = 0
    const session = {
      isLoggedIn: true,
      sessionCookie: 'stale-session-cookie',
      csrfToken: 'stale-csrf-token',
      username: 'devxoul@gmail.com',
      password: 'password',
      save: async () => {},
    }

    const client = {
      isLoggedIn: async () => loginAttempts > 0,
      login: async () => {
        loginAttempts += 1
        if (loginAttempts === 1) {
          throw new Error('temporary upstream failure')
        }
      },
      getSessionData: () => ({
        sessionCookie: 'fresh-session-cookie',
        csrfToken: 'fresh-csrf-token',
      }),
    }

    await expect(validateClientSession(session, client)).resolves.toBe(client)
    expect(loginAttempts).toBe(2)
    expect(session.sessionCookie).toBe('fresh-session-cookie')
    expect(session.csrfToken).toBe('fresh-csrf-token')
  })

  it('does not persist session when persistSession is false', async () => {
    let saveCalled = false
    let loginAttempts = 0
    const session = {
      isLoggedIn: true,
      sessionCookie: 'stale-session-cookie',
      csrfToken: 'stale-csrf-token',
      username: 'devxoul@gmail.com',
      password: 'password',
      save: async () => {
        saveCalled = true
      },
    }

    const client = {
      isLoggedIn: async () => loginAttempts > 0,
      login: async () => {
        loginAttempts += 1
      },
      getSessionData: () => ({
        sessionCookie: 'fresh-session-cookie',
        csrfToken: 'fresh-csrf-token',
      }),
    }

    await expect(validateClientSession(session, client, false)).resolves.toBe(client)
    expect(loginAttempts).toBe(1)
    expect(saveCalled).toBe(false)
    expect(session.sessionCookie).toBe('stale-session-cookie')
    expect(session.csrfToken).toBe('stale-csrf-token')
  })

  it('persists session by default when re-login succeeds', async () => {
    let saveCalled = false
    let loginAttempts = 0
    const session = {
      isLoggedIn: true,
      sessionCookie: 'stale-session-cookie',
      csrfToken: 'stale-csrf-token',
      username: 'devxoul@gmail.com',
      password: 'password',
      save: async () => {
        saveCalled = true
      },
    }

    const client = {
      isLoggedIn: async () => loginAttempts > 0,
      login: async () => {
        loginAttempts += 1
      },
      getSessionData: () => ({
        sessionCookie: 'fresh-session-cookie',
        csrfToken: 'fresh-csrf-token',
      }),
    }

    await expect(validateClientSession(session, client)).resolves.toBe(client)
    expect(loginAttempts).toBe(1)
    expect(saveCalled).toBe(true)
    expect(session.sessionCookie).toBe('fresh-session-cookie')
    expect(session.csrfToken).toBe('fresh-csrf-token')
  })

  it('continues without throwing when session.save() hits the Next.js read-only cookies error', async () => {
    let loginAttempts = 0
    const session = {
      isLoggedIn: true,
      sessionCookie: 'stale-session-cookie',
      csrfToken: 'stale-csrf-token',
      username: 'devxoul@gmail.com',
      password: 'password',
      save: async () => {
        throw new Error(
          'Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options',
        )
      },
    }

    const client = {
      isLoggedIn: async () => loginAttempts > 0,
      login: async () => {
        loginAttempts += 1
      },
      getSessionData: () => ({
        sessionCookie: 'fresh-session-cookie',
        csrfToken: 'fresh-csrf-token',
      }),
    }

    await expect(validateClientSession(session, client)).resolves.toBe(client)
    expect(loginAttempts).toBe(1)
    expect(session.sessionCookie).toBe('fresh-session-cookie')
    expect(session.csrfToken).toBe('fresh-csrf-token')
  })

  it('rethrows unexpected errors from session.save()', async () => {
    let loginAttempts = 0
    const session = {
      isLoggedIn: true,
      sessionCookie: 'stale-session-cookie',
      csrfToken: 'stale-csrf-token',
      username: 'devxoul@gmail.com',
      password: 'password',
      save: async () => {
        throw new Error('disk is on fire')
      },
    }

    const client = {
      isLoggedIn: async () => loginAttempts > 0,
      login: async () => {
        loginAttempts += 1
      },
      getSessionData: () => ({
        sessionCookie: 'fresh-session-cookie',
        csrfToken: 'fresh-csrf-token',
      }),
    }

    await expect(validateClientSession(session, client)).rejects.toThrow('disk is on fire')
  })
})
