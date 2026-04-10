'use client'

import { Card } from '@/ui/card'

export default function ShadowElevationPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Shadow Elevation</h1>
        <p className="mt-2 text-foreground-muted">Elevation levels for visual hierarchy</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-surface p-6 shadow-[var(--shadow-elevation-1)]">
            <p className="text-sm font-medium">Elevation 1</p>
            <p className="text-xs text-foreground-muted">Cards at rest</p>
          </div>
          <div className="rounded-lg bg-surface p-6 shadow-[var(--shadow-elevation-2)]">
            <p className="text-sm font-medium">Elevation 2</p>
            <p className="text-xs text-foreground-muted">Hover / raised</p>
          </div>
          <div className="rounded-lg bg-surface p-6 shadow-[var(--shadow-elevation-3)]">
            <p className="text-sm font-medium">Elevation 3</p>
            <p className="text-xs text-foreground-muted">Overlays / dropdowns</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
