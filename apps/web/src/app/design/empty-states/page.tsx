'use client'

import { ChalkboardTeacher } from '@phosphor-icons/react'

import { Card } from '@/ui/card'
import { EmptyState } from '@/ui/empty-state'

export default function EmptyStatesPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Empty States</h1>
        <p className="mt-2 text-foreground-muted">Empty state variations</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState message="데이터가 없습니다." />
          <EmptyState message="멘토링 세션이 없습니다." icon={ChalkboardTeacher} />
        </div>
      </Card>
    </div>
  )
}
