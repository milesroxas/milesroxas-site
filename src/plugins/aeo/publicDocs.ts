import type { Payload } from 'payload'
import { INDEX_PAGES } from '@/components/Link/resolve-href'
import { type ContentSurface, surfaceDocPath } from '@/shared/content/surfaces'

/**
 * Root paths a route owns (`/works`, `/posts`, `/contact`, `/ask`, `/search`):
 * a Pages document with that slug never renders, so it never lists either.
 */
const ROUTE_OWNED_PAGE_SLUGS = new Set([...Object.keys(INDEX_PAGES), 'search'])

/** What a public listing (sitemap, llms.txt) needs from a surface document. */
export type PublicDoc = {
  id: number
  slug: string
  title: string
  path: string
  description: string | null
  publishedAt: string | null
  updatedAt: string
}

type ListedDoc = {
  id: number
  slug?: string | null
  title?: string | null
  publishedAt?: string | null
  updatedAt: string
  meta?: { description?: string | null; noIndex?: boolean | null } | null
}

/**
 * The documents a surface publishes, as an anonymous visitor sees them
 * (`overrideAccess: false`, so a protected work never lists) and minus the
 * ones an editor marked noindex. In the surface's listing order.
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

  return (docs as ListedDoc[]).flatMap((doc) => {
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
}
