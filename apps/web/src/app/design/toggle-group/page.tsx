'use client'

import { useState } from 'react'

import { Card } from '@/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'

export default function ToggleGroupPage() {
  const [value, setValue] = useState('list')

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Toggle Group</h1>
        <p className="mt-2 text-foreground-muted">Single-select toggle button group</p>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-muted">View Mode</h3>
            <ToggleGroup value={value} onValueChange={setValue}>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
              <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
              <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-muted">Status Filter</h3>
            <ToggleGroup value="all" onValueChange={() => {}}>
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="open">Open</ToggleGroupItem>
              <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Card>
    </div>
  )
}
