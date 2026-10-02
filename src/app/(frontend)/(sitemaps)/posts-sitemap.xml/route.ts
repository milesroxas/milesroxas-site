import { unstable_cache } from 'next/cache'
import { getServerSideSitemap } from 'next-sitemap'
import { publishedSitemapEntries } from '../published-entries'

const getPostsSitemap = unstable_cache(
  async () => publishedSitemapEntries('posts', (slug) => `/posts/${slug}`),
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
