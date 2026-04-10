import { LogoutButton } from '~/components/logout-button'
import { ThemeToggle } from '~/components/theme-toggle'
import { getSession } from '~/lib/session'

export async function Nav() {
  const session = await getSession()

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-primary">SW마에스트로</h1>
          <span className="text-sm text-foreground-muted">마이페이지</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session.isLoggedIn ? (
            <>
              <span className="text-sm text-foreground-muted">{session.username}</span>
              <LogoutButton />
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
