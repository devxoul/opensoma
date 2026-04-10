'use client'

import { Badge } from '@/ui/badge'
import { Card } from '@/ui/card'

export default function BadgesPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Badges</h1>
        <p className="mt-2 text-foreground-muted">Badge variants for status indicators</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">접수중</Badge>
          <Badge variant="success">예약완료</Badge>
          <Badge variant="danger">취소</Badge>
          <Badge variant="warning">대기</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </Card>
    </div>
  )
}
