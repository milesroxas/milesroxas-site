import type { CollectionSlug, Payload } from 'payload'
import type { SiteInfo } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'
import {
  CONTENT_HEADING_KEYS,
  CONTENT_SKIP_KEYS,
  CONTENT_TEXT_KEYS,
  normalizeKey,
} from './content-keys'
import { lexicalToMarkdownString, type SerializedLexicalState } from './lexicalToMarkdown'
import type { ContentSurface, GlobalSurface } from './surfaces'

/**
 * Extracts a surface document's reader-facing substance as markdown, for the
 * RAG corpus (embedding + keyword hydration).
 *
 * A generic walker collects Lexical states plus strings under a fixed
 * allowlist of content-bearing keys, in document order, across hero groups,
 * layout blocks, and nested arrays. Three things ride on top of the walk:
 *
 * - **Canonical records.** If the surface names a Content Hub record
 *   (work-pages → case-studies), it is hydrated and walked too — its narrative
 *   is what the page renders.
 * - **Relationships.** Allowlisted relationship keys (testimonials, project,
 *   taxonomy) resolve to the public substance of the related record: the
 *   quote and speaker, the client name and project summary, the term names.
 *   Everything else stays a bare id and is dropped.
 * - **Structured arrays.** Case-study metrics and contact details render as
 *   compact lines instead of scattered field values.
 *
 * Every hydration goes through the Local API with `overrideAccess: false` and
 * no user, so collection read rules (published only, approved-public
 * testimonials) and field-level rules (`authenticatedField` on internal claim
 * logs) decide what the corpus may see. Callers must pass a document read the
 * same way; the walker's allowlist is the second line of defense, not the
 * first: enum/select values ('dark', 'editorial-split'), link URLs, and
 * admin-only fields (anything starting with `internal`) never reach a public
 * answer.
 */

/**
 * sas-site resolves Content Hub relationships (testimonials, projects,
 * taxonomy) into the corpus. This site has none of those collections
 * (docs/composer-roadmap.md, Phase 5), so no relationship key is followed:
 * related documents (works in a Columns block, related posts) are indexed on
 * their own. The reference machinery stays so a later hub can fill it in.
 */
type RelationCollection = never

const RELATION_KEYS: Record<string, RelationCollection> = {}

const MAX_DOC_CHARS = 30_000

type RelationRef = { collection: RelationCollection; id: number }
type Part = string | RelationRef

type Doc = Record<string, unknown>

const isLexicalState = (value: unknown): value is SerializedLexicalState =>
  typeof value === 'object' &&
  value !== null &&
  'root' in value &&
  typeof (value as SerializedLexicalState).root === 'object'

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value])

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const numericIds = (value: unknown): number[] =>
  relationshipIds(asList(value)).filter((id): id is number => typeof id === 'number')

/** Case-study metrics: only what the site itself may show (`approvedForPublic`). */
function renderMetrics(items: unknown[]): string {
  const lines = items.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const metric = item as Doc
    if (metric.approvedForPublic !== true) return []
    const label = str(metric.label)
    const value = str(metric.value)
    if (!label || !value) return []
    const qualifiers = [
      str(metric.qualifier),
      str(metric.comparisonBaseline) ? `vs ${str(metric.comparisonBaseline)}` : '',
      str(metric.timeframe),
    ].filter(Boolean)
    const unit = str(metric.unit)
    return [
      `- ${label}: ${value}${unit ? ` ${unit}` : ''}${qualifiers.length ? ` (${qualifiers.join('; ')})` : ''}`,
    ]
  })
  return lines.length ? `Results:\n${lines.join('\n')}` : ''
}

/** Contact-page details list (`term`/`value` rows: hours, phone, studio). */
function renderDetails(items: unknown[]): string {
  const lines = items.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const { term, value } = item as Doc
    return str(term) && str(value) ? [`- ${str(term)}: ${str(value)}`] : []
  })
  return lines.join('\n')
}

/** Arrays rendered as one compact block instead of being walked field by field. */
const STRUCTURED_KEYS: Record<string, (items: unknown[]) => string> = {
  details: renderDetails,
  metrics: renderMetrics,
}

type CodeListing = { blockType: 'code'; code: string; language?: unknown }

const isCodeListing = (value: object): value is CodeListing => {
  const { blockType, code } = value as Record<string, unknown>
  return blockType === 'code' && typeof code === 'string'
}

/**
 * A composition Code block as a fenced listing: the form the chunker already
 * keeps whole, and the one an inline post-body Code block takes
 * (`lexicalToMarkdown`). `code` is not a content text key, so only this block emits it.
 */
const fencedListing = ({ code, language }: CodeListing): string[] =>
  code.trim() ? [`\`\`\`${str(language)}\n${code}\n\`\`\``] : []

function walkText(value: string, normalized: string, out: Part[]): void {
  const text = value.trim()
  if (!text || !CONTENT_TEXT_KEYS.has(normalized)) return
  out.push(CONTENT_HEADING_KEYS.has(normalized) ? `## ${text}` : text)
}

function walkArray(value: unknown[], key: string, normalized: string, out: Part[]): void {
  const render = STRUCTURED_KEYS[normalized]
  if (render) {
    const text = render(value)
    if (text) out.push(text)
    return
  }
  for (const item of value) walkValue(item, key, out)
}

function walkObject(value: object, out: Part[]): void {
  if (isLexicalState(value)) {
    const markdown = lexicalToMarkdownString(value)
    if (markdown) out.push(markdown)
    return
  }

  if (isCodeListing(value)) {
    out.push(...fencedListing(value))
    return
  }

  for (const [childKey, childValue] of Object.entries(value)) {
    walkValue(childValue, childKey, out)
  }
}

function walkValue(value: unknown, key: string, out: Part[]): void {
  if (value === null || value === undefined) return

  const normalized = normalizeKey(key)
  if (CONTENT_SKIP_KEYS.has(normalized) || normalized.startsWith('internal')) return

  const relation = RELATION_KEYS[normalized]
  if (relation) {
    for (const id of numericIds(value)) out.push({ collection: relation, id })
    return
  }

  if (typeof value === 'string') walkText(value, normalized, out)
  else if (Array.isArray(value)) walkArray(value, key, normalized, out)
  else if (typeof value === 'object') walkObject(value, out)
}

/** No relation is followed here (see `RELATION_KEYS`), so nothing resolves. */
async function resolveRelations(
  _payload: Payload,
  _refs: RelationRef[],
): Promise<Map<string, string>> {
  return new Map()
}

/** A reference's rendered substance the first time it appears, undefined after. */
function renderOnce(
  ref: RelationRef,
  rendered: Map<string, string>,
  seen: Set<string>,
): string | undefined {
  const key = `${ref.collection}:${ref.id}`
  const text = rendered.get(key)
  if (!text || seen.has(key)) return undefined
  seen.add(key)
  return text
}

/** The run of references to `collection` starting at `start`, and the index after it. */
function collectTermRun(
  parts: Part[],
  start: number,
  collection: RelationCollection,
  take: (ref: RelationRef) => string | undefined,
): { names: string[]; end: number } {
  const names: string[] = []
  let end = start
  while (end < parts.length) {
    const next = parts[end]
    if (typeof next === 'string' || next.collection !== collection) break
    const name = take(next)
    if (name) names.push(name)
    end += 1
  }
  return { names, end }
}

/**
 * Turns walk output into markdown: relation references become their rendered
 * substance (once each), and consecutive taxonomy names collapse into one
 * "Capabilities: a, b" line so a hasMany field reads as a list, not a column.
 */
async function renderParts(payload: Payload, parts: Part[]): Promise<string[]> {
  const refs = parts.filter((part): part is RelationRef => typeof part !== 'string')
  const rendered =
    refs.length > 0 ? await resolveRelations(payload, refs) : new Map<string, string>()

  const TERM_LABEL: Partial<Record<RelationCollection, string>> = {}

  const out: string[] = []
  const seen = new Set<string>()
  const take = (ref: RelationRef) => renderOnce(ref, rendered, seen)
  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    if (typeof part === 'string') {
      out.push(part)
      i += 1
      continue
    }

    const label = TERM_LABEL[part.collection]
    if (label) {
      const { names, end } = collectTermRun(parts, i, part.collection, take)
      if (names.length) out.push(`${label}: ${names.join(', ')}`)
      i = end
      continue
    }

    const text = take(part)
    if (text) out.push(text)
    i += 1
  }
  return out
}

type SurfaceDoc = {
  title?: string | null
  meta?: { description?: string | null } | null
}

/**
 * Markdown for one surface document. `doc` must have been read as the public
 * sees it (`draft: false`, `overrideAccess: false`) — see `readPublicDoc`.
 */
export async function extractDocMarkdown(
  payload: Payload,
  surface: ContentSurface,
  doc: SurfaceDoc,
): Promise<string> {
  const record = doc as Doc
  const parts: Part[] = []

  if (doc.title) parts.push(`# ${doc.title}`)
  const description = doc.meta?.description?.trim()
  if (description) parts.push(description)

  const { title: _title, ...rest } = record
  walkValue(rest, '', parts)

  const rendered = await renderParts(payload, parts)
  return rendered.join('\n\n').slice(0, MAX_DOC_CHARS)
}

/** `Label: value` as a one-line list, or nothing when the value is empty. */
const labelledLine = (label: string, value: unknown): string[] =>
  str(value) ? [`${label}: ${str(value)}`] : []

function siteInfoIntro(info: SiteInfo, name: string): string[] {
  const lines = [`# ${name}`]
  if (str(info.tagline)) lines.push(str(info.tagline))
  if (str(info.description)) lines.push(str(info.description))
  if (str(info.legalName) !== name) lines.push(...labelledLine('Legal name', info.legalName))
  if (typeof info.foundingYear === 'number') lines.push(`Founded in ${info.foundingYear}.`)
  return lines
}

function siteInfoPlace(address: SiteInfo['address']): string {
  const street = str(address?.streetAddress)
  const cityLine = [
    str(address?.city),
    [str(address?.state), str(address?.postalCode)].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')
  return [street, cityLine, str(address?.country)].filter(Boolean).join(', ')
}

/** Company facts from Site Info, written as prose an answer can quote. */
function renderSiteInfo(info: SiteInfo): string {
  const name = str(info.name) || 'Miles Roxas'
  const lines = siteInfoIntro(info, name)

  const place = siteInfoPlace(info.address)
  if (place) lines.push(`## Where we are\nStudio address: ${place}.`)

  const contact = [
    ...labelledLine('Email', info.contactEmail),
    ...labelledLine('Inquiry response time', info.inquiries?.responseTime),
    ...labelledLine('Book a call', info.inquiries?.scheduleUrl),
  ]
  if (contact.length) lines.push(`## Contact\n${contact.join('\n')}`)

  const profiles = (info.socialProfiles ?? []).flatMap((profile) =>
    str(profile.label) && str(profile.url) ? [`- ${str(profile.label)}: ${str(profile.url)}`] : [],
  )
  if (profiles.length) lines.push(`## Find us online\n${profiles.join('\n')}`)

  if (str(info.llmsNotes)) lines.push(str(info.llmsNotes))
  return lines.join('\n\n')
}

/**
 * The published, publicly readable version of a global, or null when there is
 * none yet (a drafts global that was never published).
 */
export async function readPublicGlobal(
  payload: Payload,
  surface: GlobalSurface,
): Promise<Doc | null> {
  const doc = (await payload.findGlobal({
    slug: surface.global,
    depth: 0,
    draft: false,
    overrideAccess: false,
  })) as unknown as Doc
  if (surface.drafts && doc._status !== 'published') return null
  return doc
}

/** Markdown for a global surface (already read with `readPublicGlobal`). */
export async function extractGlobalMarkdown(
  payload: Payload,
  surface: GlobalSurface,
  doc: Doc,
): Promise<string> {
  if (surface.global === 'site-info') return renderSiteInfo(doc as unknown as SiteInfo)

  const parts: Part[] = [`# ${str(doc.title) || surface.title}`]
  const description = str((doc.meta as SurfaceDoc['meta'])?.description)
  if (description) parts.push(description)
  const { title: _title, ...rest } = doc
  walkValue(rest, '', parts)
  const rendered = await renderParts(payload, parts)
  return rendered.join('\n\n').slice(0, MAX_DOC_CHARS)
}

/**
 * A surface document as an anonymous visitor reads it: published version only,
 * access rules applied. Null when the document is not (or no longer) public.
 */
export async function readPublicDoc(
  payload: Payload,
  collection: CollectionSlug,
  id: number | string,
): Promise<Doc | null> {
  const doc = await payload.findByID({
    collection,
    id,
    depth: 0,
    draft: false,
    overrideAccess: false,
    disableErrors: true,
  })
  return (doc as Doc | null) ?? null
}
