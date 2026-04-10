'use client'

import { Badge } from '@/ui/badge'
import { Card } from '@/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/ui/table'

export default function TablesPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tables</h1>
        <p className="mt-2 text-foreground-muted">Table component styles</p>
      </div>

      <Card className="p-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">홍길동</TableCell>
                <TableCell>멘토</TableCell>
                <TableCell>
                  <Badge variant="success">활성</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">김철수</TableCell>
                <TableCell>연수생</TableCell>
                <TableCell>
                  <Badge variant="warning">대기</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">이영희</TableCell>
                <TableCell>연수생</TableCell>
                <TableCell>
                  <Badge variant="danger">비활성</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
