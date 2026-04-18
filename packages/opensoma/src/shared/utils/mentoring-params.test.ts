import { describe, expect, it } from 'bun:test'

import { MENU_NO, REPORT_CD } from '../../constants'
import { buildMentoringListParams, parseSearchQuery } from './mentoring-params'

describe('parseSearchQuery', () => {
  it('defaults plain text to a title search', () => {
    expect(parseSearchQuery('OpenCode')).toEqual({ field: 'title', value: 'OpenCode' })
  })

  it('parses the "title:" prefix as a title search', () => {
    expect(parseSearchQuery('title:OpenCode')).toEqual({ field: 'title', value: 'OpenCode' })
  })

  it('parses the "author:" prefix as an author search', () => {
    expect(parseSearchQuery('author:전수열')).toEqual({ field: 'author', value: '전수열' })
  })

  it('sets the "me" flag when parsing "author:@me"', () => {
    expect(parseSearchQuery('author:@me')).toEqual({ field: 'author', value: '@me', me: true })
  })

  it('parses the "content:" prefix as a content search', () => {
    expect(parseSearchQuery('content:하네스')).toEqual({ field: 'content', value: '하네스' })
  })

  it('treats an unknown prefix as a plain title search', () => {
    expect(parseSearchQuery('foo:bar')).toEqual({ field: 'title', value: 'foo:bar' })
  })

  it('preserves everything after the first colon when the value contains colons', () => {
    expect(parseSearchQuery('title:foo:bar')).toEqual({ field: 'title', value: 'foo:bar' })
  })
})

describe('buildMentoringListParams', () => {
  it('returns only menuNo when no options are passed', () => {
    expect(buildMentoringListParams()).toEqual({ menuNo: MENU_NO.MENTORING })
  })

  it('maps status open to "A" and closed to "C"', () => {
    expect(buildMentoringListParams({ status: 'open' })).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchStatMentolec: 'A',
    })
    expect(buildMentoringListParams({ status: 'closed' })).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchStatMentolec: 'C',
    })
  })

  it('maps type public and lecture to their report codes', () => {
    expect(buildMentoringListParams({ type: 'public' })).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchGubunMentolec: REPORT_CD.PUBLIC_MENTORING,
    })
    expect(buildMentoringListParams({ type: 'lecture' })).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchGubunMentolec: REPORT_CD.MENTOR_LECTURE,
    })
  })

  it('sets searchCnd=1 for a title search', () => {
    expect(buildMentoringListParams({ search: { field: 'title', value: 'OpenCode' } })).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchCnd: '1',
      searchWrd: 'OpenCode',
    })
  })

  it('sets searchCnd=2 for an author search', () => {
    expect(buildMentoringListParams({ search: { field: 'author', value: '전수열' } })).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchCnd: '2',
      searchWrd: '전수열',
    })
  })

  it('sets searchId and searchWrd from the current user when "author:@me" is used', () => {
    expect(
      buildMentoringListParams({
        search: { field: 'author', value: '@me', me: true },
        user: { userId: 'neo@example.com', userNm: '전수열' },
      }),
    ).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchCnd: '2',
      searchId: 'neo@example.com',
      searchWrd: '전수열',
    })
  })

  it('composes search with status and type filters', () => {
    expect(
      buildMentoringListParams({
        status: 'open',
        type: 'lecture',
        search: { field: 'author', value: '@me', me: true },
        user: { userId: 'neo@example.com', userNm: '전수열' },
      }),
    ).toEqual({
      menuNo: MENU_NO.MENTORING,
      searchStatMentolec: 'A',
      searchGubunMentolec: REPORT_CD.MENTOR_LECTURE,
      searchCnd: '2',
      searchId: 'neo@example.com',
      searchWrd: '전수열',
    })
  })

  it('sets pageIndex from the page option', () => {
    expect(buildMentoringListParams({ page: 3 })).toEqual({
      menuNo: MENU_NO.MENTORING,
      pageIndex: '3',
    })
  })
})
