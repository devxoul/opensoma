import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ReportCreateForm } from '@/app/(main)/report/new/components/report-create-form'

export const metadata: Metadata = {
  title: '보고서 등록',
}

export default function ReportCreatePage() {
  return (
    <Suspense>
      <ReportCreateForm />
    </Suspense>
  )
}
