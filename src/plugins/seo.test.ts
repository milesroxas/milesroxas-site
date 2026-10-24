import type { CollectionConfig, Config, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'
import { generateTitle, generateURL, SEO_COLLECTIONS, SEO_GLOBALS, seo } from './seo'

const metaTab = { name: 'meta', label: 'SEO', fields: [{ name: 'title', type: 'text' as const }] }

const collection = (slug: string): CollectionConfig => ({
  slug,
  fields: [{ type: 'tabs', tabs: [metaTab] }],
})

const global = (slug: string): GlobalConfig => ({
  slug,
  fields: [{ type: 'tabs', tabs: [metaTab] }],
})

const config = {
  collections: [...SEO_COLLECTIONS, 'media'].map(collection),
  globals: SEO_GLOBALS.map(global),
  endpoints: [],
} as unknown as Config

describe('seo plugin wrapper', () => {
  it('registers the generate endpoints without injecting a second meta group', async () => {
    const out = await seo(config)
    const paths = (out.endpoints ?? []).map((endpoint) => endpoint.path)
    expect(paths).toEqual(
      expect.arrayContaining(['/plugin-seo/generate-title', '/plugin-seo/generate-url']),
    )
    expect(out.collections).toBe(config.collections)
    expect(out.globals).toBe(config.globals)
    for (const doc of [...(out.collections ?? []), ...(out.globals ?? [])]) {
      expect(doc.fields.filter((field) => 'name' in field && field.name === 'meta')).toHaveLength(0)
    }
  })
})

describe('generateTitle', () => {
  it('returns the document title without the site suffix', () => {
    expect(generateTitle({ doc: { title: 'Arturo' } } as never)).toBe('Arturo')
    expect(generateTitle({ doc: undefined } as never)).toBe('')
  })
})

describe('generateURL', () => {
  it('resolves a work under /works, the home global at the root, and a global at its path', () => {
    expect(generateURL({ doc: { slug: 'arturo' }, collectionSlug: 'works' } as never)).toMatch(
      /\/works\/arturo$/,
    )
    expect(generateURL({ doc: {}, globalSlug: 'home' } as never)).toMatch(/^https?:\/\/[^/]+\/$/)
    expect(generateURL({ doc: {}, globalSlug: 'works-index' } as never)).toMatch(/\/works$/)
  })
})
