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
  persistSession: boolean = true,
): Promise<T> {
  if (!session.isLoggedIn || !session.sessionCookie || !session.csrfToken) {
    throw new AuthenticationError(NOT_AUTHENTICATED_MESSAGE)
  }

  let isValid = await client.isLoggedIn()
  if (!isValid && session.username && session.password) {
    isValid = await retryLogin(client)

    if (isValid && persistSession) {
      const sessionData = client.getSessionData()
      if (!sessionData.sessionCookie || !sessionData.csrfToken) {
        throw new AuthenticationError(NOT_AUTHENTICATED_MESSAGE)
      }

      session.sessionCookie = sessionData.sessionCookie
      session.csrfToken = sessionData.csrfToken
      session.isLoggedIn = true
      await saveSessionIfWritable(session)
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

// Next.js disallows cookie writes outside of Server Actions and Route Handlers.
// When auth recovery runs inside a Server Component render, session.save() throws
// a read-only cookies error. Swallow that specific error so the render can
// continue with the refreshed in-memory credentials; the next Server Action or
// Route Handler request will persist the fresh session.
async function saveSessionIfWritable(session: Pick<SessionLike, 'save'>): Promise<void> {
  try {
    await session.save()
  } catch (error) {
    if (isReadOnlyCookiesError(error)) {
      return
    }
    throw error
  }
}

function isReadOnlyCookiesError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return error.message.includes('Cookies can only be modified in a Server Action or Route Handler')
}

export async function createClient(persistSession: boolean = true): Promise<SomaClient> {
  const session = await getSession()
  const client = new SomaClient({
    sessionCookie: session.sessionCookie,
    csrfToken: session.csrfToken,
    username: session.username,
    password: session.password,
    verbose: process.env.OPENSOMA_VERBOSE === 'true',
  })

  return validateClientSession(session, client, persistSession)
}
