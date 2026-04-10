'use client'

import { Card } from '@/ui/card'

export default function TransitionsPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transitions</h1>
        <p className="mt-2 text-foreground-muted">Transition timing guidelines</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">Fast</p>
            <p className="text-xs text-foreground-muted">150ms — color, opacity</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">Normal</p>
            <p className="text-xs text-foreground-muted">200ms — transform</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">Slow</p>
            <p className="text-xs text-foreground-muted">300ms — layout shifts</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
