'use client'

import { Card } from '@/ui/card'
import { Field, FieldLabel } from '@/ui/field'
import { Select, SelectTrigger, SelectPopup, SelectItem } from '@/ui/select'

export default function SelectPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Select</h1>
        <p className="mt-2 text-foreground-muted">Dropdown select component</p>
      </div>

      <Card className="p-6">
        <div className="grid max-w-md gap-6">
          <Field name="status">
            <FieldLabel>Status</FieldLabel>
            <Select defaultValue="active">
              <SelectTrigger placeholder="Select status" />
              <SelectPopup>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectPopup>
            </Select>
          </Field>

          <Field name="role">
            <FieldLabel>Role</FieldLabel>
            <Select>
              <SelectTrigger placeholder="Select role" />
              <SelectPopup>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectPopup>
            </Select>
          </Field>

          <Field name="disabled">
            <FieldLabel>Disabled</FieldLabel>
            <Select disabled defaultValue="option1">
              <SelectTrigger placeholder="Cannot change" />
              <SelectPopup>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectPopup>
            </Select>
          </Field>
        </div>
      </Card>
    </div>
  )
}
