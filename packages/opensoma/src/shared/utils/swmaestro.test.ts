import { describe, expect, test } from 'bun:test'

import { buildReportPayload } from './swmaestro'

describe('buildReportPayload', () => {
  test('normalizes dotted dates and preserves an existing healthy title', () => {
    const payload = buildReportPayload({
      menteeRegion: 'S',
      reportType: 'MRC010',
      progressDate: '2026.04.12',
      title: '[자유 멘토링] 2026년 04월 12일 멘토링 보고',
      venue: '온라인',
      attendanceCount: 3,
      attendanceNames: '김철수, 이영희, 박민수',
      progressStartTime: '10:00',
      progressEndTime: '12:00',
      subject: '프로젝트 아이디어 점검',
      content: 'x'.repeat(100),
    })

    expect(payload.progressDt).toBe('2026-04-12')
    expect(payload.nttSj).toBe('[자유 멘토링] 2026년 04월 12일 멘토링 보고')
  })

  test('rebuilds the title when the existing title is corrupted', () => {
    const payload = buildReportPayload({
      menteeRegion: 'S',
      reportType: 'MRC010',
      progressDate: '2026.04.12',
      title: '[자유 멘토링] 년 undefined월 undefined일 멘토링 보고',
      venue: '온라인',
      attendanceCount: 3,
      attendanceNames: '김철수, 이영희, 박민수',
      progressStartTime: '10:00',
      progressEndTime: '12:00',
      subject: '프로젝트 아이디어 점검',
      content: 'x'.repeat(100),
    })

    expect(payload.nttSj).toBe('[자유 멘토링] 2026년 04월 12일 멘토링 보고')
  })
})
