import type { CollectionSlug, GlobalSlug } from 'payload'

/**
 * The single source of truth for the site's public content surfaces: which
 * collections publish to public URLs, under which prefix, and where each
 * document's reader-facing substance lives. Consumed by:
 *
 * - `plugins/index.ts` — plugin-seo `generateURL` and the search plugin's
 *   collection list
 * - `plugins/aeo/sections.ts` — llms.txt / llms-full.txt sections
 * - `features/ask` — retrieval corpus (search index + embeddings)
 *
 * Adding a new public collection here puts it on every surface at once.
 * Singleton pages (globals) live in `GLOBAL_SURFACES` below: they have no
 * search-plugin or llms.txt listing, but the Ask corpus embeds them.
 */

export type SurfaceBody =
  /**
   * One richText field carries the body (Posts `content`). AEO serves that
   * field as the document's markdown alternate; the Ask corpus still walks the
   * whole document so standfirsts and layout blocks are not lost.
   */
  | { kind: 'richText'; field: string }
  /**
   * Substance is spread across layout blocks / groups — extracted by the
   * generic walker in `extract.ts`. (sas-site's `canonicalField`, a Content
   * Hub record the walker hydrates, has no counterpart here.)
   */
  | { kind: 'walk' }

export type ContentSurface = {
  collection: CollectionSlug
  /** Human section title (llms.txt H2, admin-facing labels). */
  title: string
  /** URL prefix the collection publishes under, e.g. '/expertise'. Empty string for root. */
  urlPrefix: string
  /** Slug that maps to the site root instead of `${urlPrefix}/${slug}`. */
  homeSlug?: string
  /**
   * Slug that maps to the prefix itself rather than a child of it, so the
   * primary contact page is `/contact` and not `/contact/contact`.
   */
  indexSlug?: string
  /** Payload sort order where listing order matters. Defaults to 'title'. */
  sort?: string
  body: SurfaceBody
}

/**
 * This site's public collections (docs/composer-roadmap.md, Phase 5): Pages at
 * the root (`home` is `/`), Works under `/works`, Posts under `/posts`.
 * Protected works never reach the corpus: every read is an anonymous visitor's
 * (`overrideAccess: false`), and `worksReadAccess` hides them.
 */
export const CONTENT_SURFACES: ContentSurface[] = [
  { collection: 'pages', title: 'Pages', urlPrefix: '', homeSlug: 'home', body: { kind: 'walk' } },
  {
    collection: 'works',
    title: 'Work',
    urlPrefix: '/works',
    sort: '_order',
    body: { kind: 'walk' },
  },
  {
    collection: 'posts',
    title: 'Posts',
    urlPrefix: '/posts',
    sort: '-publishedAt',
    body: { kind: 'richText', field: 'content' },
  },
]

export const surfaceByCollection: ReadonlyMap<string, ContentSurface> = new Map(
  CONTENT_SURFACES.map((surface) => [surface.collection as string, surface]),
)

/** Collections synced into the `search` index (and the RAG corpus). */
export const SEARCH_COLLECTIONS = CONTENT_SURFACES.map((surface) => surface.collection)

/**
 * Singleton public pages and site-wide facts that live in globals. They are
 * not listed by the search plugin or llms.txt sections (those are
 * per-document), but the Ask corpus embeds them so the homepage, the index
 * heroes, and company facts (address, contact, response time) can answer
 * questions.
 */
export type GlobalSurface = {
  global: GlobalSlug
  /** Human title used for the retrieved source when the global has no `title`. */
  title: string
  /** Site-relative path the global publishes at (or the best page to link for it). */
  path: string
  /** True when the global has `versions.drafts` — only the published version is embedded. */
  drafts: boolean
}

export const GLOBAL_SURFACES: GlobalSurface[] = [
  { global: 'site-info', title: 'About Miles Roxas', path: '/contact', drafts: false },
]

export const globalSurfaceBySlug: ReadonlyMap<string, GlobalSurface> = new Map(
  GLOBAL_SURFACES.map((surface) => [surface.global as string, surface]),
)

/** Site-relative path for a surface document, honoring the home-slug → root mapping. */
export const surfaceDocPath = (surface: ContentSurface, slug: string): string => {
  if (surface.homeSlug && slug === surface.homeSlug) return '/'
  if (surface.indexSlug && slug === surface.indexSlug) return surface.urlPrefix
  return `${surface.urlPrefix}/${slug}`
}

/**
 * The content surface a site path sits under, by URL prefix; the longest
 * prefix wins, so a shallow prefix never shadows a deeper one. Root-level
 * pages, and globals that publish outside every prefix, have none. Lets a bare
 * link (an Ask source) say which section of the site it opens.
 */
export const surfaceForPath = (path: string): ContentSurface | null => {
  let match: ContentSurface | null = null
  for (const surface of CONTENT_SURFACES) {
    const { urlPrefix } = surface
    if (!urlPrefix || (path !== urlPrefix && !path.startsWith(`${urlPrefix}/`))) continue
    if (!match || urlPrefix.length > match.urlPrefix.length) match = surface
  }
  return match
}

/**
 * Where an indexed row points on the site. Rows are keyed by the collection or
 * global slug they came from; collections resolve through the document slug,
 * globals through their fixed path.
 */
export const indexedSourcePath = (key: string, slug: string): string | null => {
  const surface = surfaceByCollection.get(key)
  if (surface) return surfaceDocPath(surface, slug)
  return globalSurfaceBySlug.get(key)?.path ?? null
}
