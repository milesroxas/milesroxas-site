import type { Payload } from 'payload'
import type { ContactPage, SiteInfo, WorksIndex } from '@/payload-types'
import {
  type ContactPageCopy,
  fillContactTokens,
  resolveContactCopy,
  resolveContactCv,
} from '@/shared/content/contact'
import { inquiryResponseTime } from '@/shared/content/inquiry'
import { POSTS_INDEX, readPostsIndexMeta } from '@/shared/content/postsIndex'
import { surfaceByCollection } from '@/shared/content/surfaces'
import { WORKS_INDEX_DEFAULTS } from '@/shared/content/worksIndex'
import { getServerSideURL } from '@/utilities/getURL'
import { llmsEntries } from './buildLlms'
import { listPublicDocs, type PublicDoc } from './publicDocs'

/**
 * Markdown alternates for the pages a route owns rather than a document
 * (docs/aeo.md): the works and posts indexes, and contact. Each says what its
 * page says, read as an anonymous visitor.
 */

type IndexPage = { title: string; path: string; description: string }

const latestUpdate = (docs: PublicDoc[]): string | null =>
  docs.reduce<string | null>(
    (latest, doc) => (latest && latest >= doc.updatedAt ? latest : doc.updatedAt),
    null,
  )

/** An index page: its heading and words, then one link per document it lists. */
export function indexMarkdown(page: IndexPage, docs: PublicDoc[], siteUrl: string): string {
  const updated = latestUpdate(docs)
  const parts = [
    `# ${page.title}`,
    [`URL: ${siteUrl}${page.path}`, ...(updated ? [`Updated: ${updated}`] : [])].join('\n'),
    page.description,
    docs.length ? llmsEntries(docs, siteUrl) : null,
  ]
  return `${parts.filter(Boolean).join('\n\n')}\n`
}

/** The works index's heading and lead, from its global once it is published (works/page.tsx). */
async function worksIndexPage(payload: Payload): Promise<IndexPage | null> {
  const index = (await payload.findGlobal({
    slug: 'works-index',
    depth: 0,
    draft: false,
    overrideAccess: false,
  })) as WorksIndex | null
  const published = index?._status === 'published' ? index : null
  if (published?.meta?.noIndex) return null
  return {
    title: published?.title || WORKS_INDEX_DEFAULTS.heading,
    path: '/works',
    description:
      published?.lead || published?.meta?.description || WORKS_INDEX_DEFAULTS.description,
  }
}

async function postsIndexPage(payload: Payload): Promise<IndexPage> {
  const { description } = await readPostsIndexMeta(payload)
  return { title: POSTS_INDEX.title, path: POSTS_INDEX.path, description }
}

const INDEX_READERS: Record<string, (payload: Payload) => Promise<IndexPage | null>> = {
  works: worksIndexPage,
  posts: postsIndexPage,
}

/** `/works.md` and `/posts.md`. Null for a collection without an index page. */
export async function buildIndexMarkdown(
  payload: Payload,
  collection: string,
): Promise<string | null> {
  const surface = surfaceByCollection.get(collection)
  const readPage = INDEX_READERS[collection]
  if (!surface || !readPage) return null
  const page = await readPage(payload)
  if (!page) return null
  return indexMarkdown(page, await listPublicDocs(payload, surface), getServerSideURL())
}

type ContactFacts = Partial<Pick<SiteInfo, 'contactEmail' | 'socialProfiles' | 'inquiries'>>

/** The contact page's words, the ways to write, the profiles and the CV, as the page lists them. */
export function contactMarkdown(
  copy: ContactPageCopy,
  siteInfo: ContactFacts,
  cv: { url: string } | null,
  siteUrl: string,
): string {
  const url = `${siteUrl}/contact`
  const email = siteInfo.contactEmail?.trim()
  const reply = fillContactTokens(copy.submitNote, {
    responseTime: inquiryResponseTime(siteInfo),
  })
  const reach = [
    `- Contact form: ${url} (name, email and message). ${reply}`,
    ...(email ? [`- Email: ${email}`] : []),
  ]
  const profiles = (siteInfo.socialProfiles ?? []).flatMap(({ label, url: profileUrl }) =>
    label?.trim() && profileUrl?.trim() ? [`- [${label.trim()}](${profileUrl.trim()})`] : [],
  )

  const parts = [
    '# Contact',
    `URL: ${url}`,
    copy.heading,
    copy.lead,
    `## Get in touch\n\n${reach.join('\n')}`,
    profiles.length ? `## Elsewhere\n\n${profiles.join('\n')}` : null,
    cv
      ? `## ${copy.cvHeading}\n\n- [${copy.cvHeading} (PDF)](${cv.url})${copy.cvNote ? `: ${copy.cvNote}` : ''}`
      : null,
  ]
  return `${parts.filter(Boolean).join('\n\n')}\n`
}

/** `/contact.md`: the Contact page global's words with Site Info's address and profiles. */
export async function buildContactMarkdown(payload: Payload): Promise<string> {
  const [page, siteInfo] = await Promise.all([
    payload.findGlobal({ slug: 'contact-page', depth: 1 }) as Promise<ContactPage>,
    payload.findGlobal({ slug: 'site-info', depth: 0 }) as Promise<SiteInfo>,
  ])
  return contactMarkdown(
    resolveContactCopy(page),
    siteInfo,
    resolveContactCv(page),
    getServerSideURL(),
  )
}
