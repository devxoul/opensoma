import { redirect } from 'next/navigation'

import { createClient } from '@/lib/client'
import { AuthenticationError, type SomaClient } from '@/lib/sdk'

function wrapWithAuthGuard(client: SomaClient): SomaClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (typeof value !== 'object' || value === null) return value

      return new Proxy(value as Record<string, unknown>, {
        get(nsTarget, nsProp, nsReceiver) {
          const method = Reflect.get(nsTarget, nsProp, nsReceiver)
          if (typeof method !== 'function') return method

          return async (...args: unknown[]) => {
            try {
              return await (method as (...a: unknown[]) => Promise<unknown>).apply(nsTarget, args)
            } catch (error) {
              if (error instanceof AuthenticationError) {
                redirect('/logout')
              }
              throw error
            }
          }
        },
      })
    },
  })
}

export async function requireAuth(): Promise<SomaClient> {
  try {
    const client = await createClient()
    return wrapWithAuthGuard(client)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect('/logout')
    }
    throw error
  }
}
