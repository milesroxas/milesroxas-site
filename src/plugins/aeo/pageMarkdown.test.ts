import { describe, expect, it } from 'vitest'
import { CONTACT_PAGE_DEFAULTS } from '@/shared/content/contact'
import { contactMarkdown, indexMarkdown } from './pageMarkdown'
import type { PublicDoc } from './publicDocs'

const SITE = 'https://milesroxas.com'

const doc = (overrides: Partial<PublicDoc>): PublicDoc => ({
  id: 1,
  slug: 'a',
  title: 'A',
  path: '/works/a',
  description: null,
  publishedAt: null,
  updatedAt: '2026-10-02T00:00:00.000Z',
  ...overrides,
})

describe('indexMarkdown', () => {
  it('opens with the heading, the URL and the newest update, then lists every document', () => {
    const markdown = indexMarkdown(
      { title: 'Work', path: '/works', description: 'Selected work.' },
      [
        doc({ title: 'A', description: 'First.' }),
        doc({ slug: 'b', title: 'B', path: '/works/b', updatedAt: '2026-10-09T00:00:00.000Z' }),
      ],
      SITE,
    )
    expect(markdown).toBe(
      [
        '# Work',
        '',
        `URL: ${SITE}/works`,
        'Updated: 2026-10-09T00:00:00.000Z',
        '',
        'Selected work.',
        '',
        `- [A](${SITE}/works/a): First.`,
        `- [B](${SITE}/works/b)`,
        '',
      ].join('\n'),
    )
  })

  it('states the page alone when nothing is published under it', () => {
    expect(indexMarkdown({ title: 'Posts', path: '/posts', description: 'D.' }, [], SITE)).toBe(
      `# Posts\n\nURL: ${SITE}/posts\n\nD.\n`,
    )
  })
})

describe('contactMarkdown', () => {
  const copy = { ...CONTACT_PAGE_DEFAULTS }

  it('lists the form with its reply time, the email, the profiles and the CV', () => {
    const markdown = contactMarkdown(
      copy,
      {
        contactEmail: 'miles@example.com',
        inquiries: { responseTime: 'within two working days' },
        socialProfiles: [{ label: 'GitHub', url: 'https://github.com/milesroxas' }],
      },
      { url: 'https://cdn.example.com/cv.pdf' },
      SITE,
    )
    expect(markdown).toContain(`# Contact\n\nURL: ${SITE}/contact\n\n${copy.heading}`)
    expect(markdown).toContain(
      `- Contact form: ${SITE}/contact (name, email and message). Miles replies within two working days.`,
    )
    expect(markdown).toContain('- Email: miles@example.com')
    expect(markdown).toContain('## Elsewhere\n\n- [GitHub](https://github.com/milesroxas)')
    expect(markdown).toContain(
      `## ${copy.cvHeading}\n\n- [${copy.cvHeading} (PDF)](https://cdn.example.com/cv.pdf): ${copy.cvNote}`,
    )
  })

  it('leaves out the sections the page leaves out', () => {
    const markdown = contactMarkdown(copy, {}, null, SITE)
    expect(markdown).not.toContain('Email:')
    expect(markdown).not.toContain('## Elsewhere')
    expect(markdown).not.toContain(copy.cvHeading)
  })
})
