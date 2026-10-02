import { unstable_cache } from 'next/cache'
import { getServerSideSitemap } from 'next-sitemap'
import { getServerSideURL } from '@/utilities/getURL'
import { publishedSitemapEntries } from '../published-entries'

const getPagesSitemap = unstable_cache(
  async () => {
    const sitemap = await publishedSitemapEntries('pages', (slug) =>
      slug === 'home' ? '/' : `/${slug}`,
    )

    const SITE_URL = getServerSideURL()
    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
      },
    ]

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
