import { describe, expect, it } from 'vitest'
import { surfaceByCollection } from '@/shared/content/surfaces'
import {
  docFrontMatter,
  llmsContactSection,
  llmsEntries,
  llmsHeader,
  shownRecord,
  tidyMarkdown,
} from './buildLlms'
import type { PublicDoc } from './publicDocs'

const SITE = 'https://milesroxas.com'

const doc = (overrides: Partial<PublicDoc>): PublicDoc => ({
  id: 1,
  slug: 'a',
  title: 'A',
  path: '/posts/a',
  description: null,
  publishedAt: null,
  updatedAt: '2026-10-02T00:00:00.000Z',
  ...overrides,
})

describe('llmsHeader', () => {
  it('opens with the H1 and the blockquote the spec requires', () => {
    expect(
      llmsHeader(
        {
          name: 'Miles Roxas',
          tagline: 'Design and code.',
          description: 'Longer.',
          jobTitle: 'Design engineer',
        },
        SITE,
      ),
    ).toBe(
      [
        '# Miles Roxas',
        '',
        '> Design and code.',
        '',
        'Longer.',
        '',
        `Website: ${SITE}`,
        'Role: Design engineer',
      ].join('\n'),
    )
  })

  it('promotes the description to the blockquote when there is no tagline', () => {
    expect(llmsHeader({ name: 'Miles Roxas', description: 'Longer.' }, SITE)).toContain('> Longer.')
  })

  it('states where the person is based and the organizations they belong to', () => {
    const header = llmsHeader(
      {
        name: 'Miles Roxas',
        address: { streetAddress: '1 Main St', city: 'Brooklyn', state: 'NY', country: 'US' },
        affiliations: [
          { name: 'Suits & Sandals', url: 'https://www.suits-sandals.com', role: 'Co-founder' },
          { name: 'Codalyn' },
        ],
      },
      SITE,
    )
    expect(header).toContain('Based in: Brooklyn, NY, US')
    expect(header).toContain(
      'Affiliations: Co-founder, Suits & Sandals (https://www.suits-sandals.com); Codalyn',
    )
    expect(header).not.toContain('Main St')
  })
})

describe('llmsEntries', () => {
  it('writes one link per document, with its description when it has one', () => {
    expect(
      llmsEntries(
        [doc({ description: 'What it is.' }), doc({ slug: 'b', title: 'B', path: '/posts/b' })],
        SITE,
      ),
    ).toBe(`- [A](${SITE}/posts/a): What it is.\n- [B](${SITE}/posts/b)`)
  })
})

describe('llmsContactSection', () => {
  it('lists the email, the form and every profile', () => {
    const section = llmsContactSection({
      contactEmail: 'miles@example.com',
      socialProfiles: [{ label: 'GitHub', url: 'https://github.com/milesroxas' }],
    })
    expect(section).toContain('## Contact')
    expect(section).toContain('- Email: miles@example.com')
    expect(section).toContain('/contact)')
    expect(section).toContain('- [GitHub](https://github.com/milesroxas)')
  })
})

describe('docFrontMatter', () => {
  it('dates a document for citation', () => {
    expect(docFrontMatter(doc({ publishedAt: '2026-10-01T00:00:00.000Z' }), SITE)).toEqual([
      `URL: ${SITE}/posts/a`,
      'Published: 2026-10-01T00:00:00.000Z',
      'Updated: 2026-10-02T00:00:00.000Z',
    ])
  })

  it('names the original of an article published elsewhere', () => {
    expect(docFrontMatter(doc({}), SITE, 'https://example.com/a')).toContain(
      'Original: https://example.com/a',
    )
  })
})

describe('tidyMarkdown', () => {
  it('drops a hero that repeats the title and headings left empty', () => {
    expect(tidyMarkdown('# A\n\nURL: x\n\n# A\n\n# \n\n## Body\n\nText', 'A')).toBe(
      '# A\n\nURL: x\n\n## Body\n\nText',
    )
  })
})

const surface = (collection: string) => {
  const found = surfaceByCollection.get(collection)
  if (!found) throw new Error(`No content surface for ${collection}`)
  return found
}

describe('shownRecord', () => {
  const pages = surface('pages')
  const posts = surface('posts')
  const siteInfo = { name: 'Miles Roxas', jobTitle: 'Designer & Builder' }

  it('leaves out the body and sections an external post keeps but never renders', () => {
    const record = { title: 'A', intro: { body: 'Why' }, content: 'Old body', layout: [] }
    const original = {
      url: 'https://example.com/a',
      publisher: 'Example',
      address: 'example.com/a',
    }
    expect(shownRecord(posts, record, siteInfo, original)).toEqual({
      title: 'A',
      intro: { body: 'Why' },
    })
  })

  it('titles the home page with the name and role it shows, not its hero text', () => {
    const record = { slug: 'home', title: 'Home', hero: { richText: 'Home' }, layout: [] }
    expect(shownRecord(pages, record, siteInfo, null)).toEqual({
      slug: 'home',
      title: 'Miles Roxas, Designer & Builder',
      layout: [],
    })
  })

  it('keeps every other record whole', () => {
    const record = { slug: 'about', title: 'About', hero: { richText: 'Hi' } }
    expect(shownRecord(pages, record, siteInfo, null)).toBe(record)
  })
})
