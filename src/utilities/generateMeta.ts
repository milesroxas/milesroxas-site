import type { Metadata } from 'next'
import type { SiteInfo } from '@/payload-types'
import { getCachedGlobal } from './getGlobals'
import { getServerSideURL } from './getURL'
import { articleAuthors, resolveTitle } from './pageTitle'
import { documentShareImage, type ShareDoc, type ShareImage, shareImage } from './shareImage'

/**
 * Page metadata for every public route (docs/aeo.md). The root layout sets the
 * site-wide defaults from Site Info (`siteMetadata`): a title template, the
 * description, the default share card, the Twitter card and the robots
 * directives. Each route then calls `generateMeta` with its document and its
 * path, which adds the title, description, canonical URL, share card and, for
 * posts, the article fields. Next merges the two by segment, and the whole
 * `openGraph` object is replaced rather than deep-merged, so the share image
 * fallback is resolved here on every call.
 */

const DEFAULT_NAME = 'Miles Roxas'
/** Stands in until Site Info carries a description, so no page ships without one. */
const DEFAULT_DESCRIPTION =
  'Miles Roxas is a designer and builder with 16 years across brand, product and technology. He designs experiences and builds the systems behind them.'

/** The fields a routed document carries that metadata reads. */
export type MetaDoc = ShareDoc & {
  title?: string | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: Parameters<typeof shareImage>[0]
    noIndex?: boolean | null
  } | null
  publishedAt?: string | null
  updatedAt?: string | null
}

/** Site Info with the share images populated, from the same cache entry the chrome reads. */
const loadSiteInfo = () => getCachedGlobal('site-info', 1)() as Promise<SiteInfo | null>

const siteName = (siteInfo: SiteInfo | null) => siteInfo?.name || DEFAULT_NAME

const siteDescription = (siteInfo: SiteInfo | null) =>
  siteInfo?.description || siteInfo?.tagline || DEFAULT_DESCRIPTION

/** A Twitter / X profile among the social profiles, as the `@handle` the card credits. */
const twitterHandle = (siteInfo: SiteInfo | null): string | undefined => {
  for (const profile of siteInfo?.socialProfiles ?? []) {
    const match = profile.url.match(/^https?:\/\/(?:www\.)?(?:twitter|x)\.com\/@?([A-Za-z0-9_]+)/)
    if (match) return `@${match[1]}`
  }
  return undefined
}

const ogImages = (image: ShareImage | null): NonNullable<Metadata['openGraph']>['images'] =>
  image ? [image] : undefined

/** The site-wide defaults, for the root layout. */
export async function siteMetadata(): Promise<Metadata> {
  const siteInfo = await loadSiteInfo()
  const name = siteName(siteInfo)
  const description = siteDescription(siteInfo)
  const creator = twitterHandle(siteInfo)

  return {
    metadataBase: new URL(getServerSideURL()),
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: {
      type: 'website',
      siteName: name,
      locale: 'en_US',
      title: name,
      description,
      images: ogImages(shareImage(siteInfo?.ogImage)),
    },
    twitter: {
      card: 'summary_large_image',
      ...(creator ? { creator, site: creator } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export type GenerateMetaArgs = {
  doc: MetaDoc | null
  /** Site-relative path the document publishes at: the canonical URL and `og:url`. */
  pathname: string
  /** Set for a post: `og:type` article with its dates and authors. */
  article?: { authors?: string[] }
  /** The page's markdown alternate, when one is served (`/posts/<slug>.md`). */
  markdownPath?: string
  /** Keep the page out of search results whatever the document says (a members-only page). */
  noIndex?: boolean
}

const articleFields = (doc: MetaDoc | null, authors: string[]) => ({
  type: 'article' as const,
  ...(doc?.publishedAt ? { publishedTime: doc.publishedAt } : {}),
  ...(doc?.updatedAt ? { modifiedTime: doc.updatedAt } : {}),
  authors,
})

export const generateMeta = async (args: GenerateMetaArgs): Promise<Metadata> => {
  const { doc, pathname, article, markdownPath, noIndex } = args
  const siteInfo = await loadSiteInfo()
  const name = siteName(siteInfo)
  const { title, text } = resolveTitle(doc, pathname, name)
  const description = doc?.meta?.description || siteDescription(siteInfo)
  const image = documentShareImage(doc) ?? shareImage(siteInfo?.ogImage)

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
      ...(markdownPath ? { types: { 'text/markdown': markdownPath } } : {}),
    },
    openGraph: {
      siteName: name,
      locale: 'en_US',
      url: pathname,
      title: text,
      description,
      images: ogImages(image),
      ...(article
        ? articleFields(doc, articleAuthors(article.authors, name))
        : { type: 'website' }),
    },
    ...(doc?.meta?.noIndex || noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
