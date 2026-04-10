'use client'

import { Button } from '@/ui/button'
import { Card } from '@/ui/card'

export default function ButtonsPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Buttons</h1>
        <p className="mt-2 text-foreground-muted">Button variants and sizes</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <p className="text-sm text-foreground-muted">
            All buttons include an <code className="rounded bg-muted px-1.5 py-0.5 text-xs">active:scale-[0.98]</code>{' '}
            press effect for tactile feedback.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Primary
            </Button>
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
            <Button variant="danger" size="md">
              Danger
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" disabled>
              Disabled Primary
            </Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
