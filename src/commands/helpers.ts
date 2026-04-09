import { CredentialManager } from '@/credential-manager'
import { SomaHttp } from '@/http'

export async function getHttpOrExit(): Promise<SomaHttp> {
  const manager = new CredentialManager()
  const creds = await manager.getCredentials()
  if (!creds) {
    console.error(JSON.stringify({ error: 'Not logged in. Run: opensoma auth login' }))
    process.exit(1)
  }
  return new SomaHttp({ sessionCookie: creds.sessionCookie, csrfToken: creds.csrfToken })
}
