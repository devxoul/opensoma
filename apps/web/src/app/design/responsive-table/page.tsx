'use client'

import { Badge } from '@/ui/badge'
import { Card } from '@/ui/card'
import { ResponsiveTable } from '@/ui/responsive-table'

interface MentoringItem {
  id: number
  title: string
  type: string
  status: 'open' | 'closed'
  author: string
}

const items: MentoringItem[] = [
  { id: 1, title: 'OpenCode 소개 및 시작하기', type: '특강', status: 'open', author: '홍길동' },
  { id: 2, title: 'React Query 심화', type: '멘토링', status: 'closed', author: '김철수' },
  { id: 3, title: 'TypeScript Best Practices', type: '특강', status: 'open', author: '이영희' },
]

export default function ResponsiveTablePage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Responsive Table</h1>
        <p className="mt-2 text-foreground-muted">Table that adapts to mobile as card layout</p>
      </div>

      <Card className="p-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <ResponsiveTable
            items={items}
            keyExtractor={(item) => item.id}
            columns={[
              { header: '제목', cell: (item) => item.title },
              { header: '유형', cell: (item) => item.type, hideOnMobile: true },
              {
                header: '상태',
                cell: (item) => (
                  <Badge variant={item.status === 'open' ? 'success' : 'default'}>
                    {item.status === 'open' ? '접수중' : '마감'}
                  </Badge>
                ),
              },
              { header: '작성자', cell: (item) => item.author, hideOnMobile: true },
            ]}
          />
        </div>
        <p className="mt-4 text-sm text-foreground-muted">
          Resize your browser to see the table transform into cards on mobile.
        </p>
      </Card>
    </div>
  )
}
