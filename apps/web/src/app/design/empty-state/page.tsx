'use client'

import { ChalkboardTeacher } from '@phosphor-icons/react'

import { Card } from '@/ui/card'
import { EmptyState } from '@/ui/empty-state'
import { Separator } from '@/ui/separator'

export default function EmptyStatePage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Empty State</h1>
        <p className="mt-2 text-foreground-muted">Empty state and separator components</p>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <EmptyState message="데이터가 없습니다. 아직 등록된 항목이 없습니다. 새로운 항목을 추가해보세요." />

          <div>
            <p className="mb-4 text-sm text-foreground-muted">위아래 콘텐츠를 구분하는 구분선입니다.</p>
            <Separator />
            <p className="mt-4 text-sm text-foreground-muted">구분선 아래 콘텐츠입니다.</p>
          </div>

          <EmptyState message="멘토링 세션이 없습니다." icon={ChalkboardTeacher} />
        </div>
      </Card>
    </div>
  )
}
