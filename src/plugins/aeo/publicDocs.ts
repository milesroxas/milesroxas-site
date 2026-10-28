import type { GlobalSlug, Payload } from 'payload'
import { INDEX_PAGES } from '@/components/Link/resolve-href'
import { readPublicGlobal } from '@/shared/content/extract'
import { type ContentSurface, type GlobalSurface, surfaceDocPath } from '@/shared/content/surfaces'

/**
 * Root paths a route owns (`/works`, `/posts`, `/contact`, `/ask`, `/search`,
 * `/members`, and `/home`, which redirects to the Home global at `/`): a Pages document
 * with that slug never renders, so it never lists either.
 */
const ROUTE_OWNED_PAGE_SLUGS = new Set([...Object.keys(INDEX_PAGES), 'search', 'home', 'members'])

/** What a public listing (sitemap, llms.txt) needs from a surface document. */
export type PublicDoc = {
  id: number
  slug: string
  title: string
  path: string
  description: string | null
  publishedAt: string | null
  updatedAt: string
  /** Set when a global, not a document of the surface's collection, publishes the page. */
  global?: GlobalSlug
}

type ListedDoc = {
  id: number
  slug?: string | null
  title?: string | null
  publishedAt?: string | null
  updatedAt: string
  meta?: { description?: string | null; noIndex?: boolean | null } | null
}

/** A surface's singleton as a listing entry, once published and unless marked noindex. */
export async function readPublicHome(
  payload: Payload,
  home: GlobalSurface,
): Promise<PublicDoc | null> {
  const doc = (await readPublicGlobal(payload, home)) as ListedDoc | null
  if (!doc || doc.meta?.noIndex) return null
  return {
    id: doc.id,
    slug: '',
    title: doc.title?.trim() || home.title,
    path: home.path,
    description: doc.meta?.description?.trim() || null,
    publishedAt: doc.publishedAt ?? null,
    updatedAt: doc.updatedAt,
    global: home.global,
  }
}

/**
 * The documents a surface publishes, led by its `home` singleton, as an
 * anonymous visitor sees them (`overrideAccess: false`, so a protected work
 * never lists) and minus the ones an editor marked noindex. In the surface's
 * listing order.
 */
export async function listPublicDocs(
  payload: Payload,
  surface: ContentSurface,
): Promise<PublicDoc[]> {
  const { docs } = await payload.find({
    collection: surface.collection,
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    sort: surface.sort ?? 'title',
    where: { _status: { equals: 'published' } },
    select: { slug: true, title: true, publishedAt: true, updatedAt: true, meta: true },
  })

  const home = surface.home ? await readPublicHome(payload, surface.home) : null
  const listed = (docs as ListedDoc[]).flatMap((doc) => {
    if (!doc.slug || !doc.title || doc.meta?.noIndex) return []
    if (surface.collection === 'pages' && ROUTE_OWNED_PAGE_SLUGS.has(doc.slug)) return []
    return [
      {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        path: surfaceDocPath(surface, doc.slug),
        description: doc.meta?.description?.trim() || null,
        publishedAt: doc.publishedAt ?? null,
        updatedAt: doc.updatedAt,
      },
    ]
  })
  return home ? [home, ...listed] : listed
}
