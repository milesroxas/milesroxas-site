import config from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

/** Sitemap rows for a collection's published docs; `pathFor` maps a slug to its site path. */
export async function publishedSitemapEntries(
  collection: 'pages' | 'posts' | 'works',
  pathFor: (slug: string) => string,
) {
  const payload = await getPayload({ config })
  const SITE_URL = getServerSideURL()

  const results = await payload.find({
    collection,
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const dateFallback = new Date().toISOString()

  return results.docs
    ? results.docs
        .filter((doc) => Boolean(doc?.slug))
        .map((doc) => ({
          loc: `${SITE_URL}${pathFor(doc.slug as string)}`,
          lastmod: doc.updatedAt || dateFallback,
        }))
    : []
}
