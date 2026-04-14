import { AuthenticationError, SomaClient } from '@/lib/sdk'
import { getSession } from '@/lib/session'

const NOT_AUTHENTICATED_MESSAGE = 'Not authenticated'
const AUTH_RECOVERY_ATTEMPTS = 2
const AUTH_RECOVERY_DELAY_MS = 250

type SessionLike = {
  isLoggedIn?: boolean
  sessionCookie?: string
  csrfToken?: string
  username?: string
  password?: string
  save(): Promise<void>
}

export async function validateClientSession<T extends Pick<SomaClient, 'getSessionData' | 'isLoggedIn' | 'login'>>(
  session: SessionLike,
  client: T,
): Promise<T> {
  if (!session.isLoggedIn || !session.sessionCookie || !session.csrfToken) {
    throw new AuthenticationError(NOT_AUTHENTICATED_MESSAGE)
  }

  let isValid = await client.isLoggedIn()
  if (!isValid && session.username && session.password) {
    isValid = await retryLogin(client)

    if (isValid) {
      const sessionData = client.getSessionData()
      if (!sessionData.sessionCookie || !sessionData.csrfToken) {
        throw new AuthenticationError(NOT_AUTHENTICATED_MESSAGE)
      }

      session.sessionCookie = sessionData.sessionCookie
      session.csrfToken = sessionData.csrfToken
      session.isLoggedIn = true
      await session.save()
    }
  }

  if (!isValid) {
    throw new AuthenticationError(NOT_AUTHENTICATED_MESSAGE)
  }

  return client
}

async function retryLogin(client: Pick<SomaClient, 'isLoggedIn' | 'login'>): Promise<boolean> {
  for (let attempt = 1; attempt <= AUTH_RECOVERY_ATTEMPTS; attempt += 1) {
    try {
      await client.login()
      if (await client.isLoggedIn()) {
        return true
      }
    } catch {
      // Retry once before forcing a logout because SWMaestro can transiently reject re-auth.
    }

    if (attempt < AUTH_RECOVERY_ATTEMPTS) {
      await delay(AUTH_RECOVERY_DELAY_MS)
    }
  }

  return false
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function createClient(): Promise<SomaClient> {
  const session = await getSession()
  const client = new SomaClient({
    sessionCookie: session.sessionCookie,
    csrfToken: session.csrfToken,
    username: session.username,
    password: session.password,
    verbose: process.env.OPENSOMA_VERBOSE === 'true',
  })

  return validateClientSession(session, client)
}
