'use client'

import { Card, CardHeader, CardContent } from '@/ui/card'

export default function InteractiveCardPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Interactive Card</h1>
        <p className="mt-2 text-foreground-muted">Cards with interactive states</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Static Card</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground-muted">No hover effect</p>
            </CardContent>
          </Card>
          <Card interactive>
            <CardHeader>
              <h3 className="text-lg font-semibold">Interactive Card</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground-muted">Hover to see lift + shadow</p>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  )
}
