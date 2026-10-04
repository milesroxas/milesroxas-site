import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { extractDocMarkdown, extractGlobalMarkdown } from './extract'
import { type ContentSurface, type GlobalSurface, surfaceByCollection } from './surfaces'

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text }] }],
  },
})

/**
 * A Local API stand-in: `find` answers from a fixture table keyed by
 * collection and records every call, so the tests can assert that hydration
 * runs as the anonymous public (access on, published only) and batches by
 * collection.
 */
function stubPayload(tables: Record<string, Record<string, unknown>[]>) {
  const find = vi.fn(
    async ({ collection, where }: { collection: string; where: { id: { in: number[] } } }) => {
      const ids = new Set(where.id.in)
      const docs = (tables[collection] ?? []).filter((doc) => ids.has(doc.id as number))
      return { docs }
    },
  )
  const findGlobal = vi.fn(async ({ slug }: { slug: string }) => tables[slug]?.[0] ?? {})
  return { payload: { find, findGlobal } as unknown as Payload, find, findGlobal }
}

const walkSurface: ContentSurface = {
  collection: 'pages',
  title: 'Pages',
  urlPrefix: '',
  body: { kind: 'walk' },
}

describe('extractDocMarkdown', () => {
  it('walks allowlisted copy, skips enums, links, and internal fields', async () => {
    const { payload, find } = stubPayload({})
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Services',
      meta: { description: 'What we do.' },
      hero: { type: 'highImpact', eyebrow: 'Studio', lead: 'We design and build.' },
      layout: [
        {
          blockType: 'content',
          theme: 'inverted',
          richText: paragraph('Body copy.'),
          link: { url: 'https://example.com', label: 'Nope' },
          internalNotes: 'never',
        },
      ],
    } as never)

    expect(markdown).toBe(
      ['# Services', 'What we do.', 'Studio', 'We design and build.', 'Body copy.'].join('\n\n'),
    )
    expect(find).not.toHaveBeenCalled()
  })

  it("names a work's client, read as the public", async () => {
    const { payload, find } = stubPayload({ clients: [{ id: 7, title: 'Adacore' }] })
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Making software easier to understand',
      client: 7,
      industry: 'Enterprise Technology',
    } as never)

    expect(markdown).toBe(
      ['# Making software easier to understand', 'Client: Adacore', 'Enterprise Technology'].join(
        '\n\n',
      ),
    )
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'clients', overrideAccess: false }),
    )
  })

  it('reads a figure through its words and a code block as a fenced listing, inside a Section', async () => {
    const { payload } = stubPayload({})
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Streak Field',
      layout: [
        {
          blockType: 'section',
          blocks: [
            {
              blockType: 'diagram',
              title: 'How a visual resolves',
              textAlternative: 'A slot checks Studio, then a shipped look, then media.',
              caption: 'Resolved on the server.',
              width: 'wide',
              // Data and coordinates, not prose: neither may leak into the corpus,
              // even under keys the walk otherwise trusts.
              spec: { kind: 'flow', nodes: [{ id: 'a', label: 'Slot', text: 'leak' }] },
              geometry: { wide: { edges: [{ label: { text: 'leak' } }] } },
            },
            { blockType: 'code', language: 'glsl', code: 'float h = fbm(p);' },
          ],
        },
      ],
    } as never)

    expect(markdown).toBe(
      [
        '# Streak Field',
        '## How a visual resolves',
        'A slot checks Studio, then a shipped look, then media.',
        'Resolved on the server.',
        '```glsl\nfloat h = fbm(p);\n```',
      ].join('\n\n'),
    )
  })

  it('renders only publicly approved metrics and contact details as compact lines', async () => {
    const { payload } = stubPayload({})
    const markdown = await extractDocMarkdown(payload, walkSurface, {
      title: 'Evidence',
      metrics: [
        {
          label: 'Conversion',
          value: '40',
          unit: '%',
          qualifier: 'lift',
          timeframe: '90 days',
          approvedForPublic: true,
        },
        { label: 'Revenue', value: '2x', approvedForPublic: false },
      ],
      details: [{ term: 'Hours', value: '9 to 5 ET' }],
    } as never)

    expect(markdown).toBe(
      ['# Evidence', 'Results:\n- Conversion: 40 % (lift; 90 days)', '- Hours: 9 to 5 ET'].join(
        '\n\n',
      ),
    )
  })

  it('walks a richText surface whole, so standfirsts and layout blocks are kept', async () => {
    const { payload } = stubPayload({})
    const surface: ContentSurface = {
      collection: 'posts',
      title: 'Insights',
      urlPrefix: '/posts',
      body: { kind: 'richText', field: 'content' },
    }
    const markdown = await extractDocMarkdown(payload, surface, {
      title: 'Post',
      standfirst: 'The short version.',
      content: paragraph('The long version.'),
    } as never)
    expect(markdown).toBe(['# Post', 'The short version.', 'The long version.'].join('\n\n'))
  })
})

describe('extractGlobalMarkdown', () => {
  it('writes site info as quotable company facts', async () => {
    const { payload } = stubPayload({})
    const surface: GlobalSurface = {
      global: 'site-info',
      title: 'About',
      path: '/contact',
      drafts: false,
    }
    const markdown = await extractGlobalMarkdown(payload, surface, {
      name: 'Suits & Sandals',
      tagline: 'Strategy and craft.',
      foundingYear: 2012,
      contactEmail: 'hello@example.com',
      inquiries: { responseTime: 'two business days' },
      address: {
        streetAddress: '240 Kent Ave',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11249',
        country: 'US',
      },
      socialProfiles: [{ label: 'LinkedIn', url: 'https://linkedin.com/company/x' }],
    })

    expect(markdown).toBe(
      [
        '# Suits & Sandals',
        'Strategy and craft.',
        'Founded in 2012.',
        '## Where we are\nStudio address: 240 Kent Ave, Brooklyn, NY 11249, US.',
        '## Contact\nEmail: hello@example.com\nInquiry response time: two business days',
        '## Find us online\n- LinkedIn: https://linkedin.com/company/x',
      ].join('\n\n'),
    )
  })
})
