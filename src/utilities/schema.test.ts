import { describe, expect, it } from 'vitest'
import type { Post, SiteInfo, Work } from '@/payload-types'
import { getServerSideURL } from './getURL'
import {
  blogPostingSchema,
  breadcrumbSchema,
  collectionPageSchema,
  creativeWorkSchema,
  faqPageSchema,
  isSiteOwner,
  personSchema,
} from './schema'

const SITE = getServerSideURL()

/** schema-dts types every node as a union with `string`; the tests read the object. */
const plain = (schema: unknown) => JSON.parse(JSON.stringify(schema)) as Record<string, unknown>

const siteInfo: Partial<SiteInfo> = {
  name: 'Miles Roxas',
  jobTitle: 'Design engineer',
  tagline: 'Design and code.',
  contactEmail: 'miles@example.com',
  address: { streetAddress: '1 Main St', city: 'Oakland', state: 'CA', postalCode: '94601' },
  socialProfiles: [{ label: 'GitHub', url: 'https://github.com/milesroxas' }],
}

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text }] }],
  },
})

describe('personSchema', () => {
  it('publishes the city but never the street or postal code', () => {
    const person = plain(personSchema(siteInfo))
    expect(person['@id']).toBe(`${SITE}/#person`)
    expect(person.jobTitle).toBe('Design engineer')
    expect(person.sameAs).toEqual(['https://github.com/milesroxas'])
    expect(person.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Oakland',
      addressRegion: 'CA',
    })
    expect(JSON.stringify(person)).not.toContain('Main St')
  })

  it('leaves out what Site Info does not say', () => {
    const person = plain(personSchema({}))
    expect(person.name).toBe('Miles Roxas')
    expect(person.givenName).toBe('Miles')
    expect(person.familyName).toBe('Roxas')
    expect(person).not.toHaveProperty('address')
    expect(person).not.toHaveProperty('sameAs')
    expect(person).not.toHaveProperty('jobTitle')
    expect(person).not.toHaveProperty('affiliation')
    expect(person).not.toHaveProperty('knowsAbout')
  })

  it('ties the person to their organizations and their vocabulary', () => {
    const person = plain(
      personSchema(
        {
          ...siteInfo,
          affiliations: [
            { name: 'Suits & Sandals', url: 'https://www.suits-sandals.com', role: 'Co-founder' },
            { name: '' },
          ],
        },
        { knowsAbout: ['Design System', '', 'Web Design'] },
      ),
    )
    const organizations = [
      { '@type': 'Organization', name: 'Suits & Sandals', url: 'https://www.suits-sandals.com' },
    ]
    expect(person.affiliation).toEqual(organizations)
    expect(person.worksFor).toEqual(organizations)
    expect(person.knowsAbout).toEqual(['Design System', 'Web Design'])
  })
})

describe('isSiteOwner', () => {
  it('matches the owner by full name or first name alone, never another person', () => {
    expect(isSiteOwner('Miles Roxas', 'Miles Roxas')).toBe(true)
    expect(isSiteOwner('miles', 'Miles Roxas')).toBe(true)
    expect(isSiteOwner('Mil', 'Miles Roxas')).toBe(false)
    expect(isSiteOwner('Ada', 'Miles Roxas')).toBe(false)
    expect(isSiteOwner('', 'Miles Roxas')).toBe(false)
  })
})

describe('blogPostingSchema', () => {
  const base = {
    id: 1,
    title: 'On grids',
    slug: 'on-grids',
    source: 'internal',
    hero: { type: 'editorial' },
    publishedAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-02T00:00:00.000Z',
    createdAt: '2026-10-01T00:00:00.000Z',
    meta: { description: 'A short one.' },
  } as unknown as Post

  it('credits the site owner when the post names no author', () => {
    const posting = plain(blogPostingSchema(base, siteInfo))
    expect(posting.author).toEqual({ '@id': `${SITE}/#person` })
    expect(posting.publisher).toEqual({ '@id': `${SITE}/#person` })
    expect(posting.datePublished).toBe('2026-10-01T00:00:00.000Z')
    expect(posting.mainEntityOfPage).toBe(`${SITE}/posts/on-grids`)
  })

  it('names other authors and points the owner at the Person entity', () => {
    const posting = plain(
      blogPostingSchema(
        { ...base, populatedAuthors: [{ name: 'Miles Roxas' }, { name: 'Ada' }] },
        siteInfo,
      ),
    )
    expect(posting.author).toEqual([
      { '@id': `${SITE}/#person` },
      { '@type': 'Person', name: 'Ada' },
    ])
    expect(posting.isPartOf).toEqual({ '@id': `${SITE}/#website` })
  })

  it('reads a CMS user saved by first name as the owner', () => {
    const posting = plain(
      blogPostingSchema({ ...base, populatedAuthors: [{ name: 'Miles' }] }, siteInfo),
    )
    expect(posting.author).toEqual([{ '@id': `${SITE}/#person` }])
  })

  it('names the original publisher of an article written elsewhere', () => {
    const posting = plain(
      blogPostingSchema(
        {
          ...base,
          source: 'external',
          external: { url: 'https://example.com/post', publisher: 'Example' },
        },
        siteInfo,
      ),
    )
    expect(posting.publisher).toEqual({ '@type': 'Organization', name: 'Example' })
    expect(posting.sameAs).toBe('https://example.com/post')
  })
})

describe('creativeWorkSchema', () => {
  it('reads the client and capabilities the hero shows', () => {
    const work = {
      id: 1,
      title: 'Redesign',
      slug: 'redesign',
      industry: 'Fintech',
      client: { id: 2, title: 'Acme' },
      link: { url: 'https://acme.example' },
      capabilities: [{ id: 3, title: 'Design' }, 4],
      layout: [],
      updatedAt: '2026-10-02T00:00:00.000Z',
      createdAt: '2026-10-01T00:00:00.000Z',
    } as unknown as Work
    const schema = plain(creativeWorkSchema(work))
    expect(schema.url).toBe(`${SITE}/works/redesign`)
    expect(schema.mainEntityOfPage).toBe(`${SITE}/works/redesign`)
    expect(schema.about).toEqual({
      '@type': 'Organization',
      name: 'Acme',
      url: 'https://acme.example',
    })
    expect(schema.keywords).toEqual(['Design'])
    expect(schema.genre).toBe('Fintech')
    expect(schema.creator).toEqual({ '@id': `${SITE}/#person` })
  })
})

describe('collectionPageSchema', () => {
  it('lists the index members in order, and nothing when there are none', () => {
    const page = plain(
      collectionPageSchema({
        path: '/posts',
        name: 'Posts',
        items: [
          { name: 'A', path: '/posts/a' },
          { name: 'B', path: '/posts/b' },
        ],
      }),
    )
    expect(page.mainEntity).toEqual({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'A', url: `${SITE}/posts/a` },
        { '@type': 'ListItem', position: 2, name: 'B', url: `${SITE}/posts/b` },
      ],
    })
    expect(plain(collectionPageSchema({ path: '/posts', name: 'Posts' }))).not.toHaveProperty(
      'mainEntity',
    )
  })
})

describe('breadcrumbSchema', () => {
  it('numbers the trail from one', () => {
    const trail = plain(
      breadcrumbSchema([
        { name: 'Posts', path: '/posts' },
        { name: 'On grids', path: '/posts/on-grids' },
      ]),
    )
    expect(trail.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Posts', item: `${SITE}/posts` },
      { '@type': 'ListItem', position: 2, name: 'On grids', item: `${SITE}/posts/on-grids` },
    ])
  })
})

describe('faqPageSchema', () => {
  it('collects the questions of every FAQ block, inside Sections too', () => {
    const layout = [
      {
        blockType: 'section',
        blocks: [
          {
            blockType: 'faq',
            items: [{ question: 'How long?', answer: paragraph('Six weeks.') }],
          },
        ],
      },
      { blockType: 'faq', items: [{ question: 'How much?', answer: paragraph('It depends.') }] },
    ]
    const faq = plain(faqPageSchema(layout))
    expect(faq?.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'How long?',
        acceptedAnswer: { '@type': 'Answer', text: 'Six weeks.' },
      },
      {
        '@type': 'Question',
        name: 'How much?',
        acceptedAnswer: { '@type': 'Answer', text: 'It depends.' },
      },
    ])
  })

  it('is nothing when the page asks no questions', () => {
    expect(faqPageSchema([{ blockType: 'content' }])).toBeNull()
    expect(faqPageSchema(null)).toBeNull()
  })
})
