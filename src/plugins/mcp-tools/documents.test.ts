import type { Field, PayloadRequest } from 'payload'
import { expect, it, describe as suite, vi } from 'vitest'
import { blocksIn, describe, documentTools } from './documents'

const page = {
  id: 6,
  title: 'About',
  _status: 'published',
  layout: [
    { blockType: 'section', id: 's1', blocks: [{ blockType: 'richText', id: 'r1' }] },
    { blockType: 'section', id: 's2', blocks: [] },
  ],
}

type Capabilities = Record<string, unknown>

/** A Payload stand-in that saves what it is sent and gives new block rows an id. */
const request = (capabilities: Capabilities, doc: Record<string, unknown> = page) => {
  const assignIds = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(assignIds)
    if (typeof value !== 'object' || value === null) return value
    const row = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, assignIds(v)]))
    return 'blockType' in row && !row.id ? { ...row, id: 'new' } : row
  }
  const payload = {
    collections: {
      pages: {
        config: {
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                {
                  slug: 'section',
                  fields: [
                    { name: 'blocks', type: 'blocks', blocks: [{ slug: 'richText', fields: [] }] },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    findByID: vi.fn().mockResolvedValue(doc),
    create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 9, ...data })),
    update: vi
      .fn()
      .mockImplementation(({ data }) =>
        Promise.resolve(assignIds({ ...doc, _status: 'draft', ...data })),
      ),
  }
  const req = {
    context: { mcpApiKey: capabilities },
    payload,
    user: { id: 1, collection: 'users' },
  } as unknown as PayloadRequest
  return { payload, req }
}

const call = async (name: string, args: Record<string, unknown>, req: PayloadRequest) => {
  const found = documentTools.find((t) => t.name === name)
  if (!found) throw new Error(`no tool ${name}`)
  const result = await found.handler(args, req, {})
  const body = result.content[0]?.text ?? ''
  return body.startsWith('Error') ? body : JSON.parse(body)
}

const full: Capabilities = { pages: { find: true, create: true, update: true } }

suite('describe', () => {
  it('flattens unnamed tabs and rows, keeps named tabs as groups, and skips internals', () => {
    const fields = [
      {
        type: 'tabs',
        tabs: [{ fields: [{ name: 'a', type: 'text' }] }, { name: 'meta', fields: [] }],
      },
      {
        type: 'row',
        fields: [{ name: 'b', type: 'select', options: ['x', { label: 'Y', value: 'y' }] }],
      },
      { name: 'hidden', type: 'text', admin: { hidden: true } },
      {
        name: 'markdown',
        type: 'textarea',
        virtual: true,
        admin: { hidden: true, description: 'W' },
      },
      { name: 'ui', type: 'ui', admin: {} },
    ] as unknown as Field[]
    expect(describe(fields)).toEqual([
      { name: 'a', type: 'text' },
      { name: 'meta', type: 'group', fields: [] },
      { name: 'b', type: 'select', options: ['x', 'y'] },
      { name: 'markdown', type: 'textarea', description: 'W' },
    ])
  })

  it('finds nested block configs', () => {
    const { payload } = request(full)
    expect([
      ...blocksIn(payload.collections.pages.config.fields as unknown as Field[]).keys(),
    ]).toEqual(['section', 'richText'])
  })
})

suite('describeFields', () => {
  it('describes a block by its slug and lists the blocks when the slug is wrong', async () => {
    const { req } = request(full)
    await expect(
      call('describeFields', { collection: 'pages', blockType: 'section' }, req),
    ).resolves.toEqual({
      collection: 'pages',
      blockType: 'section',
      fields: [{ name: 'blocks', type: 'blocks', blocks: ['richText'] }],
    })
    await expect(
      call('describeFields', { collection: 'pages', blockType: 'nope' }, req),
    ).resolves.toMatch(/Its blocks: section, richText/)
  })
})

suite('createDocument', () => {
  it('needs create on the collection', async () => {
    const { req, payload } = request({ pages: { update: true } })
    await expect(
      call('createDocument', { collection: 'pages', data: { title: 'X' } }, req),
    ).resolves.toMatch(/cannot create pages/)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('publishes with the status in the data', async () => {
    const { req, payload } = request(full)
    const out = await call(
      'createDocument',
      { collection: 'pages', data: { title: 'X' }, draft: false },
      req,
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: 'X', _status: 'published' },
        draft: false,
        overrideAccess: false,
      }),
    )
    expect(out).toMatchObject({ id: 9, saved: { title: 'X' } })
  })
})

suite('updateDocument', () => {
  it('saves a draft of the sent fields and answers with them', async () => {
    const { req, payload } = request(full)
    const out = await call(
      'updateDocument',
      { collection: 'pages', id: 6, data: { title: 'Y' } },
      req,
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 6, data: { title: 'Y' }, draft: true }),
    )
    expect(out).toEqual({ collection: 'pages', id: 6, _status: 'draft', saved: { title: 'Y' } })
  })

  it('unpublishes when the data says draft', async () => {
    const { req, payload } = request(full)
    await call(
      'updateDocument',
      { collection: 'pages', id: 6, data: { _status: 'draft' }, draft: false },
      req,
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { _status: 'draft' } }),
    )
  })
})

suite('block tools', () => {
  const savedLayout = (payload: ReturnType<typeof request>['payload']) =>
    payload.update.mock.calls[0]?.[0].data.layout

  it('inserts into a Section without the sent id and answers the assigned one', async () => {
    const { req, payload } = request(full)
    const out = await call(
      'insertBlock',
      { collection: 'pages', id: 6, parentId: 's2', block: { blockType: 'richText', id: 'mine' } },
      req,
    )
    expect(savedLayout(payload)[1].blocks).toEqual([{ blockType: 'richText' }])
    expect(out).toEqual({
      _status: 'draft',
      path: 'layout.1.blocks.0',
      id: 'new',
      blockType: 'richText',
    })
  })

  it('inserts at the top level at an index', async () => {
    const { req, payload } = request(full)
    await call(
      'insertBlock',
      { collection: 'pages', id: 6, index: 0, block: { blockType: 'section' } },
      req,
    )
    expect(savedLayout(payload).map((b: { id?: string }) => b.id)).toEqual([undefined, 's1', 's2'])
  })

  it('refuses a parent that is not a Section', async () => {
    const { req } = request(full)
    await expect(
      call(
        'insertBlock',
        { collection: 'pages', id: 6, parentId: 'r1', block: { blockType: 'richText' } },
        req,
      ),
    ).resolves.toMatch(/no Section with id "r1"/)
  })

  it('moves a block into another Section', async () => {
    const { req, payload } = request(full)
    const out = await call(
      'moveBlock',
      { collection: 'pages', id: 6, blockId: 'r1', parentId: 's2' },
      req,
    )
    expect(savedLayout(payload)[0].blocks).toEqual([])
    expect(savedLayout(payload)[1].blocks).toEqual([{ blockType: 'richText', id: 'r1' }])
    expect(out).toEqual({ _status: 'draft', path: 'layout.1.blocks.0', id: 'r1' })
  })

  it('reorders top-level blocks and refuses a move inside itself', async () => {
    const { req, payload } = request(full)
    await call('moveBlock', { collection: 'pages', id: 6, blockId: 's2', index: 0 }, req)
    expect(savedLayout(payload).map((b: { id: string }) => b.id)).toEqual(['s2', 's1'])
    await expect(
      call('moveBlock', { collection: 'pages', id: 6, blockId: 's1', parentId: 's1' }, req),
    ).resolves.toMatch(/inside itself/)
  })

  it('removes a block with its nested blocks', async () => {
    const { req, payload } = request(full)
    const out = await call('removeBlock', { collection: 'pages', id: 6, blockId: 's1' }, req)
    expect(savedLayout(payload).map((b: { id: string }) => b.id)).toEqual(['s2'])
    expect(out.removed).toEqual({ id: 's1', blockType: 'section', path: 'layout.0' })
  })
})

suite('updateMedia', () => {
  it('needs the key to author media', async () => {
    const { req, payload } = request({ media: { find: true } })
    await expect(call('updateMedia', { id: 3, alt: 'A' }, req)).resolves.toMatch(
      /cannot update media/,
    )
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('sends the caption through the markdown input', async () => {
    const { req, payload } = request({ uploadMedia: true })
    await call('updateMedia', { id: 3, alt: 'A', caption: 'Hi *there*', replace: true }, req)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        id: 3,
        data: { alt: 'A', markdown: 'Hi *there*', replace: true },
      }),
    )
  })
})
