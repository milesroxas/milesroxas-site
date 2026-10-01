import { describe, expect, it, vi } from 'vitest'
import type { NearestChunk } from '@/features/ask/embeddings'
import { CONTENT_SURFACES, GLOBAL_SURFACES } from '@/shared/content/surfaces'
import { FIND_SOURCES, FIND_THRESHOLDS, judgeChunks, snippetFor } from './find'

const chunk = (over: Partial<NearestChunk>): NearestChunk => ({
  collection: 'posts',
  docId: 3,
  chunkIndex: 0,
  title: 'A post',
  slug: 'a-post',
  headingPath: null,
  text: 'Text.',
  similarity: 0.3,
  ...over,
})

const answer = (mentions: number, focus: number) => ({
  model: 'jev-test',
  usage: { input_tokens: 50, output_tokens: 0 },
  answers: { mentions: { noul: mentions }, focus: { score: focus } },
})

describe('FIND_SOURCES', () => {
  it('is every source the Ask index holds rows for', () => {
    expect([...FIND_SOURCES].sort()).toEqual(
      [
        ...CONTENT_SURFACES.map((surface) => surface.collection as string),
        ...GLOBAL_SURFACES.map((surface) => surface.global as string),
      ].sort(),
    )
  })
})

describe('snippetFor', () => {
  it('opens the window on the first word of the topic the text holds', () => {
    const text = `${'Filler words. '.repeat(40)}Then Webflow shows up.${' More.'.repeat(40)}`
    const snippet = snippetFor(text, 'Webflow sites')
    expect(snippet).toContain('Webflow shows up')
    expect(snippet.startsWith('…')).toBe(true)
    expect(snippet.endsWith('…')).toBe(true)
  })

  it('starts at the top when the topic is only there in other words', () => {
    expect(snippetFor('A no-code builder.', 'Webflow')).toBe('A no-code builder.')
  })
})

describe('judgeChunks', () => {
  it('drops what the Noul rules out and orders what is kept by focus, then mentions', async () => {
    const jev = {
      systemOne: vi
        .fn()
        .mockResolvedValueOnce(answer(0.9, 0.2))
        .mockResolvedValueOnce(answer(0.7, 1.8))
        .mockResolvedValueOnce(answer(FIND_THRESHOLDS.mentions - 0.01, 2)),
    }
    const out = await judgeChunks(
      jev,
      [chunk({ docId: 1 }), chunk({ docId: 2 }), chunk({ docId: 3 })],
      'topic',
    )
    expect(out.rows.map((row) => [row.id, row.focus])).toEqual([
      [2, 'subject'],
      [1, 'passing'],
    ])
    expect(out).toMatchObject({
      judged: true,
      dropped: 1,
      failed: 0,
      requests: 3,
      inputTokens: 150,
    })
  })

  it('ranks inside one focus level by the Noul, not by the Score expectation', async () => {
    const jev = {
      systemOne: vi
        .fn()
        .mockResolvedValueOnce(answer(0.6, 1.3))
        .mockResolvedValueOnce(answer(0.9, 0.8)),
    }
    const out = await judgeChunks(jev, [chunk({ docId: 1 }), chunk({ docId: 2 })], 'topic')
    expect(out.rows.map((row) => [row.id, row.focus])).toEqual([
      [2, 'part'],
      [1, 'part'],
    ])
  })

  it('lists a passage whose check failed last, unjudged, instead of losing it', async () => {
    const jev = {
      systemOne: vi.fn().mockResolvedValueOnce(answer(0.8, 1)).mockRejectedValueOnce(new Error()),
    }
    const out = await judgeChunks(jev, [chunk({ docId: 1 }), chunk({ docId: 2 })], 'topic')
    expect(out.rows.map((row) => [row.id, row.mentions])).toEqual([
      [1, 0.8],
      [2, null],
    ])
    expect(out.failed).toBe(1)
  })

  it('sends one passage per request, never the page', async () => {
    const jev = { systemOne: vi.fn().mockResolvedValue(answer(0.9, 1)) }
    await judgeChunks(jev, [chunk({ text: 'One passage.', headingPath: 'Intro' })], 'topic')
    expect(jev.systemOne).toHaveBeenCalledWith(
      expect.objectContaining({
        state: {
          topic: 'topic',
          passage: { page: 'A post', section: 'Intro', text: 'One passage.' },
        },
      }),
    )
  })

  it('gives a global row no document id', async () => {
    const jev = { systemOne: vi.fn().mockResolvedValue(answer(0.9, 1)) }
    const out = await judgeChunks(jev, [chunk({ collection: 'site-info', docId: 1 })], 'x')
    expect(out.rows[0]).toMatchObject({ collection: 'site-info', id: null, url: '/contact' })
  })
})
