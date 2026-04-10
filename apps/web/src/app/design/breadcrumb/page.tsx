'use client'

import { Breadcrumb } from '@/components/breadcrumb'
import { Card } from '@/ui/card'

export default function BreadcrumbPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Breadcrumb</h1>
        <p className="mt-2 text-foreground-muted">Navigation breadcrumb component</p>
      </div>

      <Card className="p-6">
        <Breadcrumb items={[{ label: '멘토링/특강', href: '/mentoring' }, { label: '제목 예시' }]} />
      </Card>
    </div>
  )
}
