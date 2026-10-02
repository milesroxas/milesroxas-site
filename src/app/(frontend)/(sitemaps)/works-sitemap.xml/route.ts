import { unstable_cache } from 'next/cache'
import { getServerSideSitemap } from 'next-sitemap'
import { publishedSitemapEntries } from '../published-entries'

const getWorksSitemap = unstable_cache(
  async () => publishedSitemapEntries('works', (slug) => `/works/${slug}`),
  ['works-sitemap'],
  {
    tags: ['works-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getWorksSitemap()

  return getServerSideSitemap(sitemap)
}
