import { describe, expect, it } from 'bun:test'

import { resolveVenue } from './swmaestro'

describe('resolveVenue', () => {
  it('prepends "토즈-" to bare TOZ location names', () => {
    expect(resolveVenue('광화문점')).toBe('토즈-광화문점')
    expect(resolveVenue('양재점')).toBe('토즈-양재점')
    expect(resolveVenue('강남컨퍼런스센터점')).toBe('토즈-강남컨퍼런스센터점')
    expect(resolveVenue('건대점')).toBe('토즈-건대점')
    expect(resolveVenue('강남역토즈타워점')).toBe('토즈-강남역토즈타워점')
    expect(resolveVenue('선릉점')).toBe('토즈-선릉점')
    expect(resolveVenue('역삼점')).toBe('토즈-역삼점')
    expect(resolveVenue('홍대점')).toBe('토즈-홍대점')
  })

  it('passes through TOZ locations that already have the prefix', () => {
    expect(resolveVenue('토즈-광화문점')).toBe('토즈-광화문점')
    expect(resolveVenue('토즈-강남역토즈타워점')).toBe('토즈-강남역토즈타워점')
  })

  it('resolves "신촌비즈니스센터점" to "연수센터-7"', () => {
    expect(resolveVenue('신촌비즈니스센터점')).toBe('연수센터-7')
    expect(resolveVenue('토즈-신촌비즈니스센터점')).toBe('연수센터-7')
  })

  it('passes through non-TOZ venues unchanged', () => {
    expect(resolveVenue('온라인(Webex)')).toBe('온라인(Webex)')
    expect(resolveVenue('스페이스 A1')).toBe('스페이스 A1')
    expect(resolveVenue('스페이스 M1')).toBe('스페이스 M1')
    expect(resolveVenue('스페이스 S')).toBe('스페이스 S')
    expect(resolveVenue('(엑스퍼트) 연수센터_라운지')).toBe('(엑스퍼트) 연수센터_라운지')
    expect(resolveVenue('(엑스퍼트) 외부_카페')).toBe('(엑스퍼트) 외부_카페')
  })

  it('trims surrounding whitespace from the input', () => {
    expect(resolveVenue('  강남역토즈타워점  ')).toBe('토즈-강남역토즈타워점')
    expect(resolveVenue(' 스페이스 A1 ')).toBe('스페이스 A1')
  })

  it('passes through unknown venues unchanged', () => {
    expect(resolveVenue('기타 장소')).toBe('기타 장소')
  })
})
