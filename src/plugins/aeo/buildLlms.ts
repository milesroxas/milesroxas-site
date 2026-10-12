import type { Payload } from 'payload'
import type { SiteInfo } from '@/payload-types'
import { extractDocMarkdown, readPublicDoc } from '@/shared/content/extract'
import {
  CONTENT_SURFACES,
  type ContentSurface,
  surfaceByCollection,
} from '@/shared/content/surfaces'
import { externalArticle } from '@/utilities/externalArticle'
import { getServerSideURL } from '@/utilities/getURL'
import { listPublicDocs, type PublicDoc } from './publicDocs'

/**
 * The markdown the site serves to agents (docs/aeo.md): /llms.txt, an index
 * in the llmstxt.org shape; /llms-full.txt, the same index with every
 * document's body; and one document's markdown alternate. Every body is the
 * text the Ask corpus embeds (`extractDocMarkdown`), read as an anonymous
 * visitor, so what an agent reads here is exactly what a visitor can read.
 */

const DEFAULT_NAME = 'Miles Roxas'

const trimmed = (value: string | null | undefined): string => value?.trim() ?? ''

/** H1, blockquote summary, then the detail paragraphs, as the spec orders them. */
export function llmsHeader(siteInfo: Partial<SiteInfo>, siteUrl: string): string {
  const name = trimmed(siteInfo.name) || DEFAULT_NAME
  const tagline = trimmed(siteInfo.tagline)
  const description = trimmed(siteInfo.description)
  const role = trimmed(siteInfo.jobTitle)

  const lines = [`# ${name}`]
  if (tagline || description) lines.push('', `> ${tagline || description}`)
  if (tagline && description) lines.push('', description)
  lines.push('', `Website: ${siteUrl}`)
  if (role) lines.push(`Role: ${role}`)
  return lines.join('\n')
}

/** One link line per document, `- [title](url): description` when it has one. */
export const llmsEntries = (docs: PublicDoc[], siteUrl: string): string =>
  docs
    .map((doc) => {
      const link = `- [${doc.title}](${siteUrl}${doc.path})`
      return doc.description ? `${link}: ${doc.description}` : link
    })
    .join('\n')

/** Where to reach the site owner, and the profiles that identify them. */
export function llmsContactSection(siteInfo: Partial<SiteInfo>): string | null {
  const entries: string[] = []
  if (trimmed(siteInfo.contactEmail)) entries.push(`- Email: ${trimmed(siteInfo.contactEmail)}`)
  entries.push(`- [Contact form](${getServerSideURL()}/contact)`)
  for (const profile of siteInfo.socialProfiles ?? []) {
    if (trimmed(profile.label) && trimmed(profile.url)) {
      entries.push(`- [${trimmed(profile.label)}](${trimmed(profile.url)})`)
    }
  }
  return entries.length ? `## Contact\n\n${entries.join('\n')}` : null
}

/**
 * Lines under a document's title that let an agent cite and date it. An
 * article published elsewhere names its original, since the page only
 * introduces it.
 */
export const docFrontMatter = (doc: PublicDoc, siteUrl: string, original?: string): string[] => [
  `URL: ${siteUrl}${doc.path}`,
  ...(original ? [`Original: ${original}`] : []),
  ...(doc.publishedAt ? [`Published: ${doc.publishedAt}`] : []),
  `Updated: ${doc.updatedAt}`,
]

/**
 * The walker (`extractDocMarkdown`) prints a hero that repeats the title as a
 * second H1, and a heading field left empty as a bare `#`. Neither helps a
 * reader, so the served markdown drops them.
 */
export const tidyMarkdown = (markdown: string, title: string): string => {
  const [first, ...rest] = markdown.split('\n\n')
  const repeat = `# ${title}`
  return [first, ...rest.filter((block) => block !== repeat && !/^#{1,6}\s*$/.test(block))].join(
    '\n\n',
  )
}

const readSiteInfo = async (payload: Payload): Promise<Partial<SiteInfo>> =>
  (await payload.findGlobal({ slug: 'site-info', depth: 0 })) as Partial<SiteInfo>

type SectionRenderer = (
  surface: ContentSurface,
  docs: PublicDoc[],
  siteUrl: string,
) => Promise<string>

async function buildDocument(payload: Payload, renderSection: SectionRenderer): Promise<string> {
  const siteUrl = getServerSideURL()
  const siteInfo = await readSiteInfo(payload)

  const sections: string[] = []
  for (const surface of CONTENT_SURFACES) {
    const docs = await listPublicDocs(payload, surface)
    if (docs.length) sections.push(await renderSection(surface, docs, siteUrl))
  }

  const notes = trimmed(siteInfo.llmsNotes)
  const parts = [
    llmsHeader(siteInfo, siteUrl),
    ...sections,
    llmsContactSection(siteInfo),
    notes ? `## Notes\n\n${notes}` : null,
  ]
  return `${parts.filter(Boolean).join('\n\n')}\n`
}

/** /llms.txt: the site in the llmstxt.org shape, one link per published document. */
export const buildLlmsTxt = (payload: Payload): Promise<string> =>
  buildDocument(
    payload,
    async (surface, docs, siteUrl) => `## ${surface.title}\n\n${llmsEntries(docs, siteUrl)}`,
  )

type ReadDoc = { markdown: string; external: boolean }

/** The document's markdown with its front matter, read again as the public sees it. */
async function docMarkdown(
  payload: Payload,
  surface: ContentSurface,
  doc: PublicDoc,
  siteUrl: string,
): Promise<ReadDoc | null> {
  const record = await readPublicDoc(payload, surface.collection, doc.id)
  if (!record) return null
  const original = surface.collection === 'posts' ? externalArticle(record)?.url : undefined
  const markdown = await extractDocMarkdown(
    payload,
    surface,
    record,
    docFrontMatter(doc, siteUrl, original),
  )
  return { markdown: tidyMarkdown(markdown, doc.title), external: Boolean(original) }
}

/** /llms-full.txt: the same index with every document's body under its section. */
export const buildLlmsFullTxt = (payload: Payload): Promise<string> =>
  buildDocument(payload, async (surface, docs, siteUrl) => {
    const bodies: string[] = []
    for (const doc of docs) {
      const read = await docMarkdown(payload, surface, doc, siteUrl)
      if (read) bodies.push(read.markdown)
    }
    return `## ${surface.title}\n\n${bodies.join('\n\n---\n\n')}`
  })

/**
 * One published document as standalone markdown: the `.md` alternate and the
 * `Accept: text/markdown` answer for its page. Null when the collection has no
 * public surface, the document is not public, or the article lives elsewhere
 * (the page only introduces it, and its metadata advertises no alternate).
 */
export async function buildDocMarkdown(
  payload: Payload,
  collection: string,
  slug: string,
): Promise<string | null> {
  const surface = surfaceByCollection.get(collection)
  if (!surface) return null

  const docs = await listPublicDocs(payload, surface)
  const doc = docs.find((candidate) => candidate.slug === slug)
  if (!doc) return null

  const read = await docMarkdown(payload, surface, doc, getServerSideURL())
  return read && !read.external ? `${read.markdown}\n` : null
}
