import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  ContactPage,
  CreativeWork,
  FAQPage,
  ItemList,
  Organization,
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

const normalizeName = (name: string) => name.trim().toLowerCase()

/**
 * Whether a credited name is the site owner. The CMS user is often saved by
 * first name alone ("Miles"), so a name that is the owner's full name or its
 * first word points at the Person entity rather than minting a second one.
 */
export const isSiteOwner = (name: string, owner: string): boolean => {
  const candidate = normalizeName(name)
  if (!candidate) return false
  const full = normalizeName(owner)
  return candidate === full || full.startsWith(`${candidate} `)
}

/** The city-level address, or nothing: the street and postal code are never published. */
const postalAddress = (address: SiteInfo['address']) => {
  if (!address?.city && !address?.state && !address?.country) return null
  return {
    '@type': 'PostalAddress' as const,
    ...(address.city ? { addressLocality: address.city } : {}),
    ...(address.state ? { addressRegion: address.state } : {}),
    ...(address.country ? { addressCountry: address.country } : {}),
  }
}

/** The owner's organizations, as schema Organizations with their sites. */
const affiliationOrganizations = (siteInfo: Partial<SiteInfo>): Organization[] =>
  (siteInfo.affiliations ?? []).flatMap((affiliation) =>
    affiliation.name
      ? [
          {
            '@type': 'Organization' as const,
            name: affiliation.name,
            ...(affiliation.url ? { url: affiliation.url } : {}),
          },
        ]
      : [],
  )

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
 * `knowsAbout` is the Capabilities taxonomy the case studies list, so the
 * entity carries the same vocabulary the work does; `affiliation` and
 * `worksFor` are Site Info › Affiliations, which tie the Person to the
 * organizations' own sites.
 */
export const personSchema = (
  siteInfo: Partial<SiteInfo>,
  extras: { knowsAbout?: string[] } = {},
): WithContext<Person> => {
  const headshot = shareImage(siteInfo.headshot)
  const address = postalAddress(siteInfo.address)
  const name = siteName(siteInfo)
  const [givenName, ...familyParts] = name.split(/\s+/)
  const familyName = familyParts.join(' ')
  const organizations = affiliationOrganizations(siteInfo)
  const knowsAbout = (extras.knowsAbout ?? []).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absolute(`/${PERSON_ID}`),
    name,
    ...(familyName ? { givenName, familyName } : {}),
    url: siteUrl(),
    mainEntityOfPage: siteUrl(),
    ...(siteInfo.jobTitle ? { jobTitle: siteInfo.jobTitle } : {}),
    ...(siteInfo.description || siteInfo.tagline
      ? { description: siteInfo.description || siteInfo.tagline || undefined }
      : {}),
    ...(siteInfo.contactEmail ? { email: siteInfo.contactEmail } : {}),
    ...(headshot ? { image: headshot.url } : {}),
    ...(address ? { address } : {}),
    ...(siteInfo.socialProfiles?.length
      ? { sameAs: siteInfo.socialProfiles.map((profile) => profile.url) }
      : {}),
    ...(organizations.length ? { affiliation: organizations, worksFor: organizations } : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
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

/**
 * The home page: a profile page whose main entity is the site owner. Google's
 * ProfilePage shape reads `dateCreated` and `dateModified`, so the publish
 * date is stated under both names.
 */
export const profilePageSchema = (page: PageFacts): WithContext<ProfilePage> => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: siteUrl(),
  name: page.title,
  ...(page.meta?.description ? { description: page.meta.description } : {}),
  mainEntity: personRef(),
  isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
  ...(page.publishedAt ? { dateCreated: page.publishedAt } : {}),
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

/** One listed document, for the ItemList an index page carries. */
export type ListedItem = { name: string; path: string }

const itemList = (items: ListedItem[]): ItemList => ({
  '@type': 'ItemList',
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    url: absolute(item.path),
  })),
})

/**
 * An index page. `items` are the documents it lists, in the order shown, so
 * an engine reads the index's members without parsing the cards.
 */
export const collectionPageSchema = (args: {
  path: string
  name: string
  description?: string | null
  items?: ListedItem[]
}): WithContext<CollectionPage> => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  url: absolute(args.path),
  name: args.name,
  ...(args.description ? { description: args.description } : {}),
  isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
  author: personRef(),
  ...(args.items?.length ? { mainEntity: itemList(args.items) } : {}),
})

export const worksIndexSchema = (
  index: Partial<WorksIndex>,
  defaults: { heading: string },
  items: ListedItem[] = [],
) =>
  collectionPageSchema({
    path: '/works',
    name: index.meta?.title || index.title || defaults.heading,
    description: index.meta?.description || index.lead,
    items,
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
    isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
    ...(image ? { image: image.url } : {}),
    ...withDates(post),
    author: authors.length
      ? authors.map((name) =>
          isSiteOwner(name, owner) ? personRef() : { '@type': 'Person', name },
        )
      : personRef(),
    publisher: external ? { '@type': 'Organization', name: external.publisher } : personRef(),
    ...(external ? { sameAs: external.url } : {}),
    ...(keywords.length ? { keywords } : {}),
    inLanguage: 'en',
  }
}

/**
 * A case study: the work, its client (with the live site when the work links
 * one), and the capabilities it lists.
 */
export const creativeWorkSchema = (work: Work): WithContext<CreativeWork> => {
  const url = absolute(`/works/${work.slug}`)
  const image = shareImage(work.meta?.image) ?? shareImage(work.hero?.media)
  const client = populatedDoc<Client>(work.client)?.title
  const clientUrl = work.link?.url?.trim()
  const keywords = termNames(work.capabilities)

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: work.title,
    ...(work.meta?.description ? { description: work.meta.description } : {}),
    url,
    mainEntityOfPage: url,
    isPartOf: { '@id': absolute(`/${WEBSITE_ID}`) },
    ...(image ? { image: image.url } : {}),
    creator: personRef(),
    author: personRef(),
    publisher: personRef(),
    ...(client
      ? {
          about: {
            '@type': 'Organization',
            name: client,
            ...(clientUrl ? { url: clientUrl } : {}),
          },
        }
      : {}),
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
