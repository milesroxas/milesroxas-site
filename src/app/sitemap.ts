import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import { listPublicDocs } from '@/plugins/aeo/publicDocs'
import { CONTENT_SURFACES } from '@/shared/content/surfaces'
import { getServerSideURL } from '@/utilities/getURL'

// Regenerated every ten minutes like the pages, and on publish (plugins/aeo).
export const revalidate = 600

/** Routes with no document behind them (see INDEX_PAGES in components/Link/resolve-href.ts). */
const FIXED_ROUTES = ['/works', '/posts', '/contact', '/ask']

/**
 * Every public URL: the fixed routes, then each content surface's published
 * documents as an anonymous visitor may read them (a protected work or a
 * noindex page never lists). One file: the site is far under the 50,000-URL
 * limit, so an index of per-collection sitemaps would only add a hop.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getServerSideURL()
  const payload = await getPayload({ config })

  const entries: MetadataRoute.Sitemap = FIXED_ROUTES.map((path) => ({ url: `${siteUrl}${path}` }))

  for (const surface of CONTENT_SURFACES) {
    for (const doc of await listPublicDocs(payload, surface)) {
      entries.push({ url: `${siteUrl}${doc.path}`, lastModified: doc.updatedAt })
    }
  }

  return entries
}
