'use client'

import { Card } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Field, FieldLabel, FieldDescription } from '@/ui/field'
import { Input } from '@/ui/input'
import { RadioGroup, RadioItem } from '@/ui/radio-group'
import { Select, SelectTrigger, SelectPopup, SelectItem } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

export default function FormsPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Forms</h1>
        <p className="mt-2 text-foreground-muted">Form components and inputs</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Field name="email">
              <FieldLabel>이메일</FieldLabel>
              <Input placeholder="user@example.com" />
              <FieldDescription>로그인에 사용할 이메일을 입력하세요.</FieldDescription>
            </Field>

            <Field name="bio">
              <FieldLabel>자기소개</FieldLabel>
              <Textarea placeholder="간단한 자기소개를 입력하세요." rows={4} />
            </Field>
          </div>

          <div className="space-y-6">
            <Field name="role">
              <FieldLabel>역할 선택</FieldLabel>
              <RadioGroup defaultValue="mentee">
                <RadioItem value="mentee">연수생</RadioItem>
                <RadioItem value="mentor">멘토</RadioItem>
                <RadioItem value="admin">관리자</RadioItem>
              </RadioGroup>
            </Field>

            <Field name="terms">
              <div className="flex items-center gap-2">
                <Checkbox id="terms" />
                <FieldLabel htmlFor="terms" className="mb-0">
                  이용약관에 동의합니다
                </FieldLabel>
              </div>
            </Field>

            <Field name="status">
              <FieldLabel>상태 선택</FieldLabel>
              <Select defaultValue="active">
                <SelectTrigger placeholder="상태를 선택하세요" />
                <SelectPopup>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                </SelectPopup>
              </Select>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  )
}
