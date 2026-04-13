import { describe, expect, test } from 'bun:test'

import { inspectStoredAuthStatus, resolveExtractedCredentials } from './auth'

describe('resolveExtractedCredentials', () => {
  test('returns the first candidate that validates successfully', async () => {
    const calls: string[] = []

    const credentials = await resolveExtractedCredentials(
      [
        { browser: 'Chrome', lastAccessUtc: 30, profile: 'Default', sessionCookie: 'stale-session' },
        { browser: 'Chrome', lastAccessUtc: 20, profile: 'Profile 1', sessionCookie: 'valid-session' },
      ],
      (sessionCookie) => ({
        checkLogin: async () => {
          calls.push(`check:${sessionCookie}`)
          return sessionCookie === 'valid-session' ? { userId: 'neo', userNm: 'Neo' } : null
        },
        extractCsrfToken: async () => {
          calls.push(`csrf:${sessionCookie}`)
          return `${sessionCookie}-csrf`
        },
      }),
    )

    expect(credentials).toEqual({
      sessionCookie: 'valid-session',
      csrfToken: 'valid-session-csrf',
    })
    expect(calls).toEqual(['check:stale-session', 'check:valid-session', 'csrf:valid-session'])
  })

  test('returns null when every candidate is invalid or throws', async () => {
    const credentials = await resolveExtractedCredentials(
      [
        { browser: 'Chrome', lastAccessUtc: 30, profile: 'Default', sessionCookie: 'stale-session' },
        { browser: 'Edge', lastAccessUtc: 20, profile: 'Profile 1', sessionCookie: 'broken-session' },
      ],
      (sessionCookie) => ({
        checkLogin: async () => {
          if (sessionCookie === 'broken-session') {
            throw new Error('network error')
          }

          return null
        },
        extractCsrfToken: async () => {
          throw new Error('should not be called')
        },
      }),
    )

    expect(credentials).toBeNull()
  })
})

describe('inspectStoredAuthStatus', () => {
  test('clears stale credentials when the stored session is invalid', async () => {
    let removed = false

    const status = await inspectStoredAuthStatus(
      {
        getCredentials: async () => ({
          sessionCookie: 'stale-session',
          csrfToken: 'csrf-token',
          username: 'neo@example.com',
        }),
        remove: async () => {
          removed = true
        },
      },
      () => ({
        checkLogin: async () => null,
      }),
    )

    expect(status).toEqual({
      authenticated: false,
      credentials: null,
      clearedStaleCredentials: true,
      hint: 'Session expired. Run: opensoma auth login or opensoma auth extract',
    })
    expect(removed).toBe(true)
  })

  test('preserves credentials when session verification fails unexpectedly', async () => {
    let removed = false

    const status = await inspectStoredAuthStatus(
      {
        getCredentials: async () => ({
          sessionCookie: 'maybe-valid-session',
          csrfToken: 'csrf-token',
          username: 'neo@example.com',
          loggedInAt: '2026-04-13T00:00:00.000Z',
        }),
        remove: async () => {
          removed = true
        },
      },
      () => ({
        checkLogin: async () => {
          throw new Error('network error')
        },
      }),
    )

    expect(status).toEqual({
      authenticated: true,
      valid: false,
      username: 'neo@example.com',
      loggedInAt: '2026-04-13T00:00:00.000Z',
      hint: 'Could not verify session. Try again or run: opensoma auth login or opensoma auth extract',
    })
    expect(removed).toBe(false)
  })
})
