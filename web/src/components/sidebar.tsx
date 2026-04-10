'use client'

import type { Icon } from '@phosphor-icons/react'
import {
  CalendarBlank,
  ChalkboardTeacher,
  House,
  Megaphone,
  Newspaper,
  User,
  Users,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems: Array<{ href: string; label: string; icon: Icon }> = [
  { href: '/dashboard', label: '대시보드', icon: House },
  { href: '/notice', label: '공지사항', icon: Megaphone },
  { href: '/mentoring', label: '멘토링 / 특강 게시판', icon: ChalkboardTeacher },
  { href: '/room', label: '회의실 예약', icon: CalendarBlank },
  { href: '/team', label: '팀매칭', icon: Users },
  { href: '/event', label: '행사 게시판', icon: Newspaper },
  { href: '/member', label: '회원정보', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border bg-surface">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const IconComponent = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-4 border-primary bg-primary-light text-primary'
                  : 'border-l-4 border-transparent text-foreground-muted hover:bg-muted hover:text-foreground'
              }`}
            >
              <IconComponent size={18} weight={isActive ? 'fill' : 'regular'} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
