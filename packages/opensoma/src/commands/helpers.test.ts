import { describe, expect, it } from 'bun:test'

import { createAuthenticatedHttp } from './helpers'

const noBrowserExtraction = async () => null

describe('createAuthenticatedHttp', () => {
  it('throws a login hint when no credentials are stored', async () => {
    const manager = {
      getCredentials: async () => null,
      remove: async () => {},
    }

    await expect(createAuthenticatedHttp(manager)).rejects.toThrow(
      'Not logged in. Run: opensoma auth login or opensoma auth extract',
    )
  })

  it('clears stale credentials when both recovery methods fail', async () => {
    let removed = false
    const manager = {
      getCredentials: async () => ({
        sessionCookie: 'stale-session',
        csrfToken: 'csrf-token',
      }),
      setCredentials: async () => {
        throw new Error('should not save unrecoverable credentials')
      },
      remove: async () => {
        removed = true
      },
    }

    await expect(
      createAuthenticatedHttp(manager, () => ({ checkLogin: async () => null }), undefined, noBrowserExtraction),
    ).rejects.toThrow(
      'Session expired. Saved credentials were cleared. Run: opensoma auth login or opensoma auth extract',
    )
    expect(removed).toBe(true)
  })

  it('returns the authenticated http client when the session is valid', async () => {
    const http = {
      checkLogin: async () => ({ userId: 'neo@example.com', userNm: '전수열' }),
      get: async () => '',
    }
    const manager = {
      getCredentials: async () => ({
        sessionCookie: 'valid-session',
        csrfToken: 'csrf-token',
      }),
      setCredentials: async () => {
        throw new Error('should not rewrite valid credentials')
      },
      remove: async () => {
        throw new Error('should not remove valid credentials')
      },
    }

    await expect(createAuthenticatedHttp(manager, () => http)).resolves.toBe(http)
  })

  it('re-authenticates automatically when stored username and password are available', async () => {
    let savedCredentials: Record<string, string> | null = null
    const manager = {
      getCredentials: async () => ({
        sessionCookie: 'stale-session',
        csrfToken: 'stale-csrf',
        username: 'neo@example.com',
        password: 'secret',
      }),
      setCredentials: async (credentials: Record<string, string>) => {
        savedCredentials = credentials
      },
      remove: async () => {
        throw new Error('should not remove recoverable credentials')
      },
    }
    const recoveredHttp = {
      checkLogin: async () => ({ userId: 'neo@example.com', userNm: 'Neo' }),
      get: async () => '',
    }

    await expect(
      createAuthenticatedHttp(
        manager,
        (credentials) => {
          if (credentials.sessionCookie === 'fresh-session') {
            return recoveredHttp
          }

          return {
            checkLogin: async () => null,
          }
        },
        () => ({
          login: async () => {},
          checkLogin: async () => ({ userId: 'neo@example.com', userNm: 'Neo' }),
          getSessionCookie: () => 'fresh-session',
          getCsrfToken: () => 'fresh-csrf',
        }),
      ),
    ).resolves.toBe(recoveredHttp)

    expect(savedCredentials).toMatchObject({
      sessionCookie: 'fresh-session',
      csrfToken: 'fresh-csrf',
      username: 'neo@example.com',
      password: 'secret',
    })
  })

  it('recovers via browser extraction when no stored password is available', async () => {
    let savedCredentials: Record<string, unknown> | null = null
    const manager = {
      getCredentials: async () => ({
        sessionCookie: 'stale-session',
        csrfToken: 'stale-csrf',
      }),
      setCredentials: async (credentials: Record<string, unknown>) => {
        savedCredentials = credentials
      },
      remove: async () => {
        throw new Error('should not remove when browser extraction succeeds')
      },
    }
    const recoveredHttp = {
      checkLogin: async () => ({ userId: 'neo@example.com', userNm: 'Neo' }),
    }

    const result = await createAuthenticatedHttp(
      manager,
      (credentials) => {
        if (credentials.sessionCookie === 'browser-session') return recoveredHttp
        return { checkLogin: async () => null }
      },
      undefined,
      async () => ({ sessionCookie: 'browser-session', csrfToken: 'browser-csrf' }),
    )

    expect(result).toBe(recoveredHttp)
    expect(savedCredentials).toMatchObject({
      sessionCookie: 'browser-session',
      csrfToken: 'browser-csrf',
    })
    expect(savedCredentials).toHaveProperty('loggedInAt')
  })

  it('falls back to browser extraction when password re-login fails', async () => {
    let savedCredentials: Record<string, unknown> | null = null
    const manager = {
      getCredentials: async () => ({
        sessionCookie: 'stale-session',
        csrfToken: 'stale-csrf',
        username: 'neo@example.com',
        password: 'wrong-password',
      }),
      setCredentials: async (credentials: Record<string, unknown>) => {
        savedCredentials = credentials
      },
      remove: async () => {
        throw new Error('should not remove when browser extraction succeeds')
      },
    }
    const recoveredHttp = {
      checkLogin: async () => ({ userId: 'neo@example.com', userNm: 'Neo' }),
    }

    const result = await createAuthenticatedHttp(
      manager,
      (credentials) => {
        if (credentials.sessionCookie === 'browser-session') return recoveredHttp
        return { checkLogin: async () => null }
      },
      () => ({
        login: async () => {
          throw new Error('wrong password')
        },
        checkLogin: async () => null,
        getSessionCookie: () => null,
        getCsrfToken: () => null,
      }),
      async () => ({ sessionCookie: 'browser-session', csrfToken: 'browser-csrf' }),
    )

    expect(result).toBe(recoveredHttp)
    expect(savedCredentials).toMatchObject({
      sessionCookie: 'browser-session',
      csrfToken: 'browser-csrf',
    })
  })

  it('skips browser extraction when no credentials exist', async () => {
    let browserExtractionCalled = false
    const manager = {
      getCredentials: async () => null,
      setCredentials: async () => {
        throw new Error('should not save')
      },
      remove: async () => {},
    }

    await expect(
      createAuthenticatedHttp(
        manager,
        () => ({ checkLogin: async () => null }),
        undefined,
        async () => {
          browserExtractionCalled = true
          return { sessionCookie: 's', csrfToken: 'c' }
        },
      ),
    ).rejects.toThrow('Not logged in')
    expect(browserExtractionCalled).toBe(false)
  })
})
