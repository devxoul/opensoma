import { Buildings, CalendarBlank, ChalkboardTeacher, Clock, MapPin, Users } from '@phosphor-icons/react/dist/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'

import { StatusBadge } from '@/components/status-badge'
import { requireAuth } from '@/lib/auth'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader } from '@/ui/card'
import { EmptyState } from '@/ui/empty-state'
import { ResponsiveTable } from '@/ui/responsive-table'

export const metadata: Metadata = {
  title: '대시보드',
}

export default async function DashboardPage() {
  const client = await requireAuth()
  const dashboard = await client.dashboard.get()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-sm text-foreground-muted">마이페이지 주요 정보를 한눈에 확인하세요.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <UserInfoCard name={dashboard.name} role={dashboard.role} organization={dashboard.organization} position={dashboard.position} />
        <TeamInfoCard team={dashboard.team} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MentoringCard items={dashboard.mentoringSessions} />
        <RoomReservationCard items={dashboard.roomReservations} />
      </div>
    </div>
  )
}

function UserInfoCard({
  name,
  role,
  organization,
  position,
}: {
  name: string
  role: string
  organization: string
  position: string
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users size={20} weight="bold" className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">사용자 정보</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <span className="text-xl font-bold text-primary">{name.charAt(0)}</span>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{name}</div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Badge variant="primary">{role}</Badge>
                {organization && <span>· {organization}</span>}
                {position && <span>· {position}</span>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamInfoCard({
  team,
}: {
  team?: { name: string; members: string; mentor: string }
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Buildings size={20} weight="bold" className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">팀 정보</h2>
        </div>
      </CardHeader>
      <CardContent>
        {team ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">팀명</span>
              <span className="font-semibold text-foreground">{team.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">멘토</span>
              <span className="font-semibold text-foreground">{team.mentor}</span>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-foreground-muted">팀원</span>
              <div className="flex flex-wrap gap-2">
                {team.members.split(',').map((member) => {
                  const trimmed = member.trim()
                  return (
                    <Badge key={trimmed} variant="default">
                      {trimmed}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={Users} message="현재 배정된 팀 정보가 없습니다." className="border-0 py-8" />
        )}
      </CardContent>
    </Card>
  )
}

function MentoringCard({
  items,
}: {
  items: Array<{ title: string; url: string; status: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChalkboardTeacher size={20} weight="bold" className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">멘토링 / 특강</h2>
          </div>
          <Link href="/mentoring" className="text-sm text-primary hover:underline">
            전체 보기
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={ChalkboardTeacher} message="등록한 멘토링/특강이 없습니다." className="border-0 py-8" />
        ) : (
          <ResponsiveTable
            items={items}
            keyExtractor={(item) => `${item.url}-${item.title}`}
            columns={[
              {
                header: '제목',
                className: 'w-[60%]',
                cell: (item) => (
                  <Link
                    href={toInternalHref(item.url)}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ),
              },
              {
                header: '상태',
                cell: (item) => <StatusBadge status={item.status} />,
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  )
}

function RoomReservationCard({
  items,
}: {
  items: Array<{ title: string; url: string; status: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarBlank size={20} weight="bold" className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">회의실 예약</h2>
          </div>
          <Link href="/room" className="text-sm text-primary hover:underline">
            예약하기
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={CalendarBlank} message="예약한 회의실이 없습니다." className="border-0 py-8" />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const parsed = parseRoomInfo(item.title)
              return (
                <div
                  key={`${item.url}-${item.title}`}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={toInternalHref(item.url)}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {parsed.roomName}
                    </Link>
                    <Badge variant={item.status.includes('완료') ? 'success' : 'primary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground-muted">
                    {parsed.date && (
                      <div className="flex items-center gap-1">
                        <CalendarBlank size={14} />
                        <span>{parsed.date}</span>
                      </div>
                    )}
                    {parsed.time && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{parsed.time}</span>
                      </div>
                    )}
                    {parsed.purpose && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{parsed.purpose}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function parseRoomInfo(title: string) {
  const roomMatch = title.match(/스페이스\s*([A-Z]\d+)/i)
  const dateMatch = title.match(/(\d{4}-\d{2}-\d{2})/)
  const timeMatch = title.match(/(\d{2}:\d{2})/g)
  const purposeMatch = title.match(/[:-]\s*(.+)$/) || title.match(/」\s*(.+)$/)

  return {
    roomName: roomMatch ? `스페이스 ${roomMatch[1]}` : title,
    date: dateMatch ? dateMatch[1] : null,
    time: timeMatch && timeMatch.length >= 2 ? `${timeMatch[0]} ~ ${timeMatch[timeMatch.length - 1]}` : timeMatch ? timeMatch[0] : null,
    purpose: purposeMatch ? purposeMatch[1].trim() : null,
  }
}

function toInternalHref(url: string) {
  const parsed = new URL(url, 'https://www.swmaestro.ai')
  const pathname = parsed.pathname
  const mentoringId = parsed.searchParams.get('qustnrSn')
  const noticeId = parsed.searchParams.get('nttId')

  if (pathname.includes('/mentoLec/view.do') && mentoringId) {
    return `/mentoring/${mentoringId}`
  }

  if (pathname.includes('/myNotice/view.do') && noticeId) {
    return `/notice/${noticeId}`
  }

  if (pathname.includes('/itemRent/') || pathname.includes('/officeMng/')) {
    return '/room'
  }

  return '/'
}
