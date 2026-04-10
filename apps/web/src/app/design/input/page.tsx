'use client'

import { Card } from '@/ui/card'
import { Field, FieldLabel, FieldDescription } from '@/ui/field'
import { Input } from '@/ui/input'

export default function InputPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Input</h1>
        <p className="mt-2 text-foreground-muted">Text input component with various states</p>
      </div>

      <Card className="p-6">
        <div className="grid max-w-md gap-6">
          <Field name="default">
            <FieldLabel>Default Input</FieldLabel>
            <Input placeholder="Enter text..." />
          </Field>

          <Field name="with-value">
            <FieldLabel>With Value</FieldLabel>
            <Input defaultValue="Hello World" />
          </Field>

          <Field name="disabled">
            <FieldLabel>Disabled</FieldLabel>
            <Input disabled placeholder="Cannot edit" defaultValue="Read only value" />
          </Field>

          <Field name="with-description">
            <FieldLabel>With Description</FieldLabel>
            <Input placeholder="user@example.com" />
            <FieldDescription>We'll never share your email with anyone else.</FieldDescription>
          </Field>

          <Field name="type">
            <FieldLabel>Password Input</FieldLabel>
            <Input type="password" defaultValue="secret123" />
          </Field>
        </div>
      </Card>
    </div>
  )
}
