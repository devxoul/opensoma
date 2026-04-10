import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/breadcrumb'
import { HtmlContent } from '@/components/html-content'
import { requireAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader } from '@/ui/card'
import { Separator } from '@/ui/separator'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const noticeId = Number(id)

  if (Number.isNaN(noticeId)) {
    return { title: '공지사항 상세' }
  }

  try {
    const client = await requireAuth()
    const notice = await client.notice.get(noticeId)
    return { title: notice.title }
  } catch {
    return { title: '공지사항 상세' }
  }
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const { id } = await params
  const noticeId = Number(id)

  if (Number.isNaN(noticeId)) {
    notFound()
  }

  const client = await requireAuth()
  const notice = await client.notice.get(noticeId)

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: '공지사항', href: '/notice' }, { label: notice.title }]} />
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">{notice.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-foreground-muted">
              <span>작성자: {notice.author}</span>
              <span>등록일: {notice.createdAt}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <Separator />
          <HtmlContent content={notice.content} />
        </CardContent>
      </Card>
    </div>
  )
}
