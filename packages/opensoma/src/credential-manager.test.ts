import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { CredentialManager } from './credential-manager'

let createdDirs: string[] = []

afterEach(async () => {
  for (const dir of createdDirs) {
    await new CredentialManager(dir).remove()
  }
  createdDirs = []
})

describe('CredentialManager', () => {
  test('loads empty config when file does not exist', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await expect(manager.load()).resolves.toEqual({ credentials: null })
    await expect(manager.getCredentials()).resolves.toBeNull()
  })

  test('saves and loads credentials with secure permissions', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await manager.setCredentials({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
      username: 'neo@example.com',
      password: 'secret-password',
      loggedInAt: '2026-04-09T00:00:00.000Z',
    })

    await expect(manager.getCredentials()).resolves.toEqual({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
      username: 'neo@example.com',
      password: 'secret-password',
      loggedInAt: '2026-04-09T00:00:00.000Z',
    })

    const rawContent = await readFile(join(dir, 'credentials.json'), 'utf8')
    expect(rawContent).not.toContain('secret-password')

    const fileStat = await stat(join(dir, 'credentials.json'))
    expect(fileStat.mode & 0o777).toBe(0o600)

    const keyFileStat = await stat(join(dir, 'credentials.key'))
    expect(keyFileStat.mode & 0o777).toBe(0o600)
  })

  test('removes credentials file', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await manager.setCredentials({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
    })
    await manager.remove()

    await expect(manager.getCredentials()).resolves.toBeNull()
  })

  test('setTozIdentity merges into existing credentials', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await manager.setCredentials({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
    })
    await manager.setTozIdentity('홍길동', '010-1234-5678')

    await expect(manager.getCredentials()).resolves.toMatchObject({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
      tozName: '홍길동',
      tozPhone: '010-1234-5678',
    })
    await expect(manager.getTozIdentity()).resolves.toEqual({
      name: '홍길동',
      phone: '010-1234-5678',
    })
  })

  test('setTozIdentity throws without SWMaestro credentials', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await expect(manager.setTozIdentity('홍길동', '010-1234-5678')).rejects.toThrow(/auth login/)
  })

  test('clearTozIdentity removes only toz fields', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await manager.setCredentials({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
      tozName: '홍길동',
      tozPhone: '010-1234-5678',
    })
    await manager.clearTozIdentity()

    const creds = await manager.getCredentials()
    expect(creds?.tozName).toBeUndefined()
    expect(creds?.tozPhone).toBeUndefined()
    expect(creds?.sessionCookie).toBe('session-value')
    expect(creds?.csrfToken).toBe('csrf-value')
    await expect(manager.getTozIdentity()).resolves.toBeNull()
  })

  test('preserves session credentials when the encryption key is missing', async () => {
    const dir = await makeTempDir()
    const manager = new CredentialManager(dir)

    await manager.setCredentials({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
      username: 'neo@example.com',
      password: 'secret-password',
      loggedInAt: '2026-04-09T00:00:00.000Z',
    })

    await new CredentialManager(dir).remove()
    await manager.save({
      credentials: {
        sessionCookie: 'session-value',
        csrfToken: 'csrf-value',
        username: 'neo@example.com',
        password: 'secret-password',
        loggedInAt: '2026-04-09T00:00:00.000Z',
      },
    })
    await rm(join(dir, 'credentials.key'))

    await expect(manager.getCredentials()).resolves.toEqual({
      sessionCookie: 'session-value',
      csrfToken: 'csrf-value',
      username: 'neo@example.com',
      loggedInAt: '2026-04-09T00:00:00.000Z',
    })
  })
})

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opensoma-credentials-'))
  createdDirs.push(dir)
  return dir
}
