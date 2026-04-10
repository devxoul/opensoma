'use client'

import { Card } from '@/ui/card'

export default function SlotColorsPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Slot Colors</h1>
        <p className="mt-2 text-foreground-muted">Color tokens for time slot states</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slot-selected-border bg-slot-selected px-3 py-2 text-sm text-slot-selected-foreground">
            Selected
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slot-available-border bg-slot-available px-3 py-2 text-sm text-slot-available-foreground">
            Available
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground-muted">
            Unavailable
          </div>
        </div>
      </Card>
    </div>
  )
}
