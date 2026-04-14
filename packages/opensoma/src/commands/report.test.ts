import { describe, expect, test } from 'bun:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { resolveContent } from './report'

describe('resolveContent', () => {
  test('returns inline text from --content', async () => {
    const result = await resolveContent({ content: 'inline content' })
    expect(result).toBe('inline content')
  })

  test('reads from stdin when --content is -', async () => {
    const fakeStdin = async () => 'stdin content'
    const result = await resolveContent({ content: '-' }, fakeStdin)
    expect(result).toBe('stdin content')
  })

  test('reads from file when --content-file is provided', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'report-test-'))
    const filePath = join(dir, 'content.txt')
    await writeFile(filePath, '파일에서 읽은 내용입니다.')

    try {
      const result = await resolveContent({ contentFile: filePath })
      expect(result).toBe('파일에서 읽은 내용입니다.')
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test('prefers --content over --content-file when both provided', async () => {
    const result = await resolveContent({ content: 'inline', contentFile: '/nonexistent' })
    expect(result).toBe('inline')
  })

  test('--content - takes priority over --content-file', async () => {
    const fakeStdin = async () => 'from stdin'
    const result = await resolveContent({ content: '-', contentFile: '/nonexistent' }, fakeStdin)
    expect(result).toBe('from stdin')
  })

  test('throws when neither --content nor --content-file is provided', async () => {
    await expect(resolveContent({})).rejects.toThrow(
      'Either --content <text> or --content-file <path> is required. Use --content - to read from stdin.',
    )
  })
})
