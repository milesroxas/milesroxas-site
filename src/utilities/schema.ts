import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  ContactPage,
  CreativeWork,
  FAQPage,
  Person,
  ProfilePage,
  WebPage,
  WebSite,
  WithContext,
} from 'schema-dts'
import type {
  Capability,
  Category,
  Client,
  Page,
  Post,
  SiteInfo,
  Work,
  WorksIndex,
} from '@/payload-types'
import { lexicalToMarkdownString } from '@/shared/content/lexicalToMarkdown'
import { externalArticle } from './externalArticle'
import { getServerSideURL } from './getURL'
import { populatedDoc } from './relationshipId'
import { shareImage } from './shareImage'

/**
 * schema.org builders for every public route (docs/aeo.md). The site is one
 * person's portfolio, so the entity anchor is a Person, not an Organization:
 * the root layout renders it once with the WebSite, and every page-level
 * schema points back at it by `@id`. Each builder reads only what the page
 * itself shows; nothing here invents a fact the visitor cannot see.
 */

const PERSON_ID = '#person'
const WEBSITE_ID = '#website'

const siteUrl = () => getServerSideURL()
const absolute = (path: string) => `${siteUrl()}${path}`
const personRef = () => ({ '@id': absolute(`/${PERSON_ID}`) }) as const

const DEFAULT_NAME = 'Miles Roxas'

const siteName = (siteInfo: Partial<SiteInfo>) => siteInfo.name || DEFAULT_NAME

/** The named taxonomy terms a relationship populated, as schema `keywords`. */
const termNames = (terms: (number | Capability | Category)[] | null | undefined): string[] =>
  (terms ?? []).flatMap((term) => {
    const title = populatedDoc<Capability | Category>(term)?.title
    return title ? [title] : []
  })

const withDates = (doc: { publishedAt?: string | null; updatedAt?: string | null }) => ({
  ...(doc.publishedAt ? { datePublished: doc.publishedAt } : {}),
  ...(doc.updatedAt ? { dateModified: doc.updatedAt } : {}),
})

/** What the page schemas read; the route's query shape is a superset. */
type PageFacts = Pick<Page, 'title' | 'meta' | 'publishedAt'> & { updatedAt?: string | null }

/**
 * The site owner. `sameAs` is the profile list search engines and AI
 * assistants reconcile the name against, so Site Info › Social profiles is
 * the field that matters most here. Only the city-level address is published.
 */
export const personSchema = (siteInfo: Partial<SiteInfo>): WithContext<Person> => {
  const headshot = shareImage(siteInfo.headshot)
  const { address } = siteInfo
  const hasPlace = Boolean(address?.city || address?.state || address?.country)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absolute(`/${PERSON_ID}`),
    name: siteName(siteInfo),
    url: siteUrl(),
    ...(siteInfo.jobTitle ? { jobTitle: siteInfo.jobTitle } : {}),
    ...(siteInfo.description || siteInfo.tagline
      ? { description: siteInfo.description || siteInfo.tagline || undefined }
      : {}),
    ...(siteInfo.contactEmail ? { email: siteInfo.contactEmail } : {}),
    ...(headshot ? { image: headshot.url } : {}),
    ...(hasPlace
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(address?.city ? { addressLocality: address.city } : {}),
            ...(address?.state ? { addressRegion: address.state } : {}),
            ...(address?.country ? { addressCountry: address.country } : {}),
          },
        }
      : {}),
    ...(siteInfo.socialProfiles?.length
      ? { sameAs: siteInfo.socialProfiles.map((profile) => profile.url) }
      : {}),
  }
}

export const webSiteSchema = (siteInfo: Partial<SiteInfo>): WithContext<WebSite> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absolute(`/${WEBSITE_ID}`),
  url: siteUrl(),
  name: siteName(siteInfo),
  ...(siteInfo.tagline ? { description: siteInfo.tagline } : {}),
  author: personRef(),
  publisher: personRef(),
  inLanguage: 'en',
})

/** The home page: a profile page whose main entity is the site owner. */
export const profilePageSchema = (page: PageFacts): WithContext<ProfilePage> => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: siteUrl(),
  name: page.title,
  ...(page.meta?.description ? { description: page.meta.description } : {}),
  mainEntity: personRef(),
  isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
  ...withDates(page),
})

export const webPageSchema = (page: PageFacts, path: string): WithContext<WebPage> => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: absolute(path),
  name: page.title,
  ...(page.meta?.description ? { description: page.meta.description } : {}),
  isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
  author: personRef(),
  ...withDates(page),
})

export const collectionPageSchema = (args: {
  path: string
  name: string
  description?: string | null
}): WithContext<CollectionPage> => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  url: absolute(args.path),
  name: args.name,
  ...(args.description ? { description: args.description } : {}),
  isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
  author: personRef(),
})

export const worksIndexSchema = (index: Partial<WorksIndex>, defaults: { heading: string }) =>
  collectionPageSchema({
    path: '/works',
    name: index.meta?.title || index.title || defaults.heading,
    description: index.meta?.description || index.lead,
  })

export const contactPageSchema = (args: {
  name: string
  description?: string | null
}): WithContext<ContactPage> => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: absolute('/contact'),
  name: args.name,
  ...(args.description ? { description: args.description } : {}),
  isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
  mainEntity: personRef(),
})

/**
 * A post. Authors named on the post are listed as given; a post with none is
 * the site owner's. An article published elsewhere keeps this page as its
 * `mainEntityOfPage` and names the original with `sameAs` and its publisher.
 */
export const blogPostingSchema = (
  post: Post,
  siteInfo: Partial<SiteInfo>,
): WithContext<BlogPosting> => {
  const url = absolute(`/posts/${post.slug}`)
  const image = shareImage(post.meta?.image) ?? shareImage(post.hero?.media)
  const external = externalArticle(post)
  const owner = siteName(siteInfo)
  const authors = (post.populatedAuthors ?? []).flatMap((author) =>
    author.name ? [author.name] : [],
  )
  const keywords = termNames(post.categories)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    url,
    mainEntityOfPage: url,
    ...(image ? { image: image.url } : {}),
    ...withDates(post),
    author: authors.length
      ? authors.map((name) => (name === owner ? personRef() : { '@type': 'Person', name }))
      : personRef(),
    publisher: external ? { '@type': 'Organization', name: external.publisher } : personRef(),
    ...(external ? { sameAs: external.url } : {}),
    ...(keywords.length ? { keywords } : {}),
    inLanguage: 'en',
  }
}

/** A case study: the work, its client, and the capabilities it lists. */
export const creativeWorkSchema = (work: Work): WithContext<CreativeWork> => {
  const image = shareImage(work.meta?.image) ?? shareImage(work.hero?.media)
  const client = populatedDoc<Client>(work.client)?.title
  const keywords = termNames(work.capabilities)

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: work.title,
    ...(work.meta?.description ? { description: work.meta.description } : {}),
    url: absolute(`/works/${work.slug}`),
    ...(image ? { image: image.url } : {}),
    creator: personRef(),
    ...(client ? { about: { '@type': 'Organization', name: client } } : {}),
    ...(work.industry ? { genre: work.industry } : {}),
    ...(keywords.length ? { keywords } : {}),
    ...withDates(work),
    inLanguage: 'en',
  }
}

export const breadcrumbSchema = (
  items: { name: string; path: string }[],
): WithContext<BreadcrumbList> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absolute(item.path),
  })),
})

type LayoutBlock = { blockType: string; blocks?: unknown[] | null }
type FaqItem = { question: string; answer: unknown }

/** Every block in a composition, with the blocks a Section nests brought up a level. */
const flattenBlocks = (blocks: unknown[] | null | undefined): LayoutBlock[] =>
  (blocks ?? []).flatMap((block) => {
    if (typeof block !== 'object' || block === null) return []
    const layoutBlock = block as LayoutBlock
    return layoutBlock.blockType === 'section' ? flattenBlocks(layoutBlock.blocks) : [layoutBlock]
  })

/**
 * The questions every FAQ block on the page answers, as one FAQPage, or null
 * when the composition has no FAQ. Answers are the block's rich text as
 * markdown, the same text the Ask corpus holds.
 */
export const faqPageSchema = (
  layout: unknown[] | null | undefined,
): WithContext<FAQPage> | null => {
  const items = flattenBlocks(layout)
    .filter((block) => block.blockType === 'faq')
    .flatMap((block) => ((block as { items?: FaqItem[] }).items ?? []) as FaqItem[])
    .flatMap(({ question, answer }) => {
      const text = lexicalToMarkdownString(answer)
      return question && text ? [{ question, text }] : []
    })
  if (items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, text }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  }
}
