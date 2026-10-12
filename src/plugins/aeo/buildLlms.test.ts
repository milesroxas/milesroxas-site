import { describe, expect, it } from 'vitest'
import {
  docFrontMatter,
  llmsContactSection,
  llmsEntries,
  llmsHeader,
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
