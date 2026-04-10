'use client'

import { Card, CardHeader, CardContent } from '@/ui/card'

export default function CardsPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cards</h1>
        <p className="mt-2 text-foreground-muted">Card component styles</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Card Title</h3>
              <p className="text-sm text-foreground-muted">Card description goes here.</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is the card content. It can contain any elements.</p>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  )
}
