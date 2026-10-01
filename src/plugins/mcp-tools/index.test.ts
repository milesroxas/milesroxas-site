import type { PayloadRequest } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const embeddings = vi.hoisted(() => ({
  embedQuestions: vi.fn(),
  queryNearestChunks: vi.fn(),
}))
vi.mock('@/features/ask/embeddings', () => embeddings)

const jev = vi.hoisted(() => ({ systemOne: vi.fn() }))
const jevConfigured = vi.hoisted(() => ({ on: true }))
vi.mock('./jev', () => ({ mcpJevClient: () => (jevConfigured.on ? jev : null) }))

import { mcpSiteTools } from './index'

const page = {
  id: 6,
  title: 'About',
  _status: 'published',
  layout: [
    {
      blockType: 'section',
      id: 's1',
      blocks: [{ blockType: 'content', id: 'c1', blockName: 'Story', heading: 'Who I am' }],
    },
  ],
}

type Capabilities = Record<string, { find?: boolean; update?: boolean }>

const request = (capabilities: Capabilities, doc: Record<string, unknown> = page) => {
  const payload = {
    findByID: vi.fn().mockResolvedValue(doc),
    update: vi
      .fn()
      .mockImplementation(({ data }: { data: { layout: unknown } }) =>
        Promise.resolve({ ...doc, _status: 'draft', layout: data.layout }),
      ),
  }
  const req = {
    context: { mcpApiKey: capabilities },
    payload,
    user: { id: 1, collection: 'users' },
  } as unknown as PayloadRequest
  return { payload, req }
}

const tool = (name: string) => {
  const found = mcpSiteTools.find((t) => t.name === name)
  if (!found) throw new Error(`no tool ${name}`)
  return found
}

const call = async (name: string, args: Record<string, unknown>, req: PayloadRequest) => {
  const result = await tool(name).handler(args, req, {})
  return result.content[0]?.text ?? ''
}

const full: Capabilities = { pages: { find: true, update: true }, works: { find: true } }

describe('outlineDocument', () => {
  it('refuses a key without find on the collection', async () => {
    const { req, payload } = request({ pages: { update: true } })
    await expect(call('outlineDocument', { collection: 'pages', id: 6 }, req)).resolves.toMatch(
      /cannot find pages/,
    )
    expect(payload.findByID).not.toHaveBeenCalled()
  })

  it('reads the latest draft as the team member and outlines it', async () => {
    const { req, payload } = request(full)
    const out = JSON.parse(await call('outlineDocument', { collection: 'pages', id: 6 }, req))
    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'pages', id: 6, draft: true, overrideAccess: false }),
    )
    expect(out).toEqual({
      collection: 'pages',
      id: 6,
      title: 'About',
      _status: 'published',
      blocks: [
        { path: 'layout.0', id: 's1', blockType: 'section', children: 1 },
        {
          path: 'layout.0.blocks.0',
          id: 'c1',
          blockType: 'content',
          blockName: 'Story',
          text: 'Who I am',
        },
      ],
    })
  })
})

describe('getBlock', () => {
  it('returns one block with its path', async () => {
    const { req } = request(full)
    const out = JSON.parse(
      await call('getBlock', { collection: 'pages', id: 6, blockId: 'c1' }, req),
    )
    expect(out).toEqual({ path: 'layout.0.blocks.0', block: page.layout[0]?.blocks?.[0] })
  })

  it('names a block that is not there', async () => {
    const { req } = request(full)
    await expect(
      call('getBlock', { collection: 'pages', id: 6, blockId: 'zz' }, req),
    ).resolves.toMatch(/no block with id "zz" in pages 6/)
  })
})

describe('patchBlock', () => {
  it('refuses a key without update on the collection', async () => {
    const { req, payload } = request({ pages: { find: true } })
    await expect(
      call(
        'patchBlock',
        { collection: 'pages', id: 6, blockId: 'c1', patch: { heading: 'x' } },
        req,
      ),
    ).resolves.toMatch(/cannot update pages/)
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('merges the patch into the block, keeps id and blockType, and saves a draft of the one field', async () => {
    const { req, payload } = request(full)
    const out = JSON.parse(
      await call(
        'patchBlock',
        {
          collection: 'pages',
          id: 6,
          blockId: 'c1',
          patch: { heading: 'What I do', id: 'hijack', blockType: 'cta' },
        },
        req,
      ),
    )
    const sent = payload.update.mock.calls[0]?.[0] as {
      data: Record<string, unknown>
      draft: boolean
      overrideAccess: boolean
    }
    expect(Object.keys(sent.data)).toEqual(['layout'])
    expect(sent.draft).toBe(true)
    expect(sent.overrideAccess).toBe(false)
    expect(out).toEqual({
      path: 'layout.0.blocks.0',
      _status: 'draft',
      block: { blockType: 'content', id: 'c1', blockName: 'Story', heading: 'What I do' },
    })
  })

  it('publishes only when draft is false', async () => {
    const { req, payload } = request(full)
    await call(
      'patchBlock',
      { collection: 'pages', id: 6, blockId: 'c1', patch: { heading: 'x' }, draft: false },
      req,
    )
    expect(payload.update.mock.calls[0]?.[0]).toMatchObject({ draft: false })
  })

  it('surfaces a refused save with its field errors', async () => {
    const { req, payload } = request(full)
    const refused = Object.assign(new Error('The following field is invalid: heading'), {
      data: { errors: [{ path: 'layout.0.blocks.0.heading', message: 'Required' }] },
    })
    payload.update.mockRejectedValueOnce(refused)
    await expect(
      call(
        'patchBlock',
        { collection: 'pages', id: 6, blockId: 'c1', patch: { heading: '' } },
        req,
      ),
    ).resolves.toMatch(
      /Error: The following field is invalid: heading\n.*layout\.0\.blocks\.0\.heading/,
    )
  })
})

describe('locateBlock', () => {
  beforeEach(() => {
    jevConfigured.on = true
    jev.systemOne.mockReset()
  })

  it('never sends a protected work to the judge', async () => {
    const { req } = request(full, { ...page, isProtected: true })
    await expect(
      call('locateBlock', { collection: 'works', id: 6, instruction: 'the story' }, req),
    ).resolves.toMatch(/protected work/)
    expect(jev.systemOne).not.toHaveBeenCalled()
  })

  it('says so when the server has no TypeSafe key', async () => {
    jevConfigured.on = false
    const { req } = request(full)
    await expect(
      call('locateBlock', { collection: 'pages', id: 6, instruction: 'the story' }, req),
    ).resolves.toMatch(/not configured.*outlineDocument/)
  })

  it('judges the outline and answers with the verdict', async () => {
    jev.systemOne.mockResolvedValue({
      model: 'jev-test',
      usage: { input_tokens: 90, output_tokens: 0 },
      answers: {
        where: { choice: 'B01', confidence: 0.9, probabilities: { B00: 0.05, B01: 0.95 } },
        exists: { noul: 0.97 },
      },
    })
    const { req } = request(full)
    const out = JSON.parse(
      await call('locateBlock', { collection: 'pages', id: 6, instruction: 'the story' }, req),
    )
    expect(out).toMatchObject({ verdict: 'found', candidates: [{ id: 'c1' }, { id: 's1' }] })
  })
})

describe('findContent', () => {
  const chunk = (collection: string, docId: number, text: string, similarity = 0.4) => ({
    collection,
    docId,
    chunkIndex: 0,
    title: `${collection} ${docId}`,
    slug: `doc-${docId}`,
    headingPath: 'Intro',
    text,
    similarity,
  })

  beforeEach(() => {
    jevConfigured.on = true
    jev.systemOne.mockReset()
    vi.stubEnv('OPENAI_API_KEY', 'test')
    embeddings.embedQuestions.mockResolvedValue([[0.1, 0.2]])
    embeddings.queryNearestChunks.mockResolvedValue([
      chunk('pages', 1, 'I build sites in Webflow and Next.js.'),
      chunk('works', 2, 'A brand system for a bakery.'),
      chunk('posts', 3, 'Why I moved off Webflow.'),
    ])
  })

  afterEach(() => vi.unstubAllEnvs())

  it('refuses a key that can find none of the sources', async () => {
    const { req } = request({})
    await expect(call('findContent', { topic: 'Webflow' }, req)).resolves.toMatch(
      /cannot find pages, works, posts, site-info/,
    )
    expect(embeddings.embedQuestions).not.toHaveBeenCalled()
  })

  it('needs the Ask index', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    const { req } = request(full)
    await expect(call('findContent', { topic: 'Webflow' }, req)).resolves.toMatch(/Ask index/)
  })

  it('judges only what the key may find and keeps what mentions the topic', async () => {
    jev.systemOne.mockImplementation(({ state }: { state: { passage: { text: string } } }) =>
      Promise.resolve({
        model: 'jev-test',
        usage: { input_tokens: 100, output_tokens: 0 },
        answers: {
          mentions: { noul: state.passage.text.includes('Webflow') ? 0.95 : 0.04 },
          focus: { score: state.passage.text.startsWith('Why') ? 1.9 : 0.4 },
        },
      }),
    )
    const { req } = request(full)
    const out = JSON.parse(await call('findContent', { topic: 'Webflow' }, req))
    // posts is not granted on this key, so its chunk is never sent to Jev.
    expect(jev.systemOne).toHaveBeenCalledTimes(2)
    expect(out.searched).toEqual(['pages', 'works'])
    expect(out.rows).toEqual([
      expect.objectContaining({
        collection: 'pages',
        id: 1,
        url: '/doc-1',
        focus: 'passing',
        mentions: 0.95,
      }),
    ])
    expect(out).toMatchObject({ judged: true, dropped: 1, failed: 0, inputTokens: 200 })
  })

  it('falls back to similarity order when the server has no TypeSafe key', async () => {
    jevConfigured.on = false
    const { req } = request(full)
    const out = JSON.parse(await call('findContent', { topic: 'Webflow' }, req))
    expect(out.judged).toBe(false)
    expect(out.rows.map((row: { id: number }) => row.id)).toEqual([1, 2])
    expect(out.note).toMatch(/unchecked/)
  })
})
