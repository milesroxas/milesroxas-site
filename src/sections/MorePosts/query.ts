import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import type { StoredVisualSlot } from '@/features/immersive/visual'
import type { Category, Media, Post } from '@/payload-types'
import { DEFAULT_PUBLISHER, isExternalPost } from '@/utilities/externalArticle'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'

/** How many posts close a post: one row of three. */
export const MORE_POSTS_LIMIT = 3

/** One post in the close: only what it renders. */
export type MorePostsItem = {
  id: number
  slug: string
  title: string
  description: string | null
  publishedAt: string | null
  /** Where it ran (an external post) or what it is filed under. */
  source: string | null
  /** The hero as the post's opening reads it: its upload, else the effect grounding it. */
  hero: StoredVisualSlot | null
  /** The share image, for a hero with neither. */
  metaImage: Media | null
}

const SELECT = {
  title: true,
  slug: true,
  publishedAt: true,
  categories: true,
  hero: { media: true, visualType: true, shader: true },
  meta: { image: true, description: true },
  source: true,
  external: { publisher: true },
} as const

type MorePostsDoc = Pick<
  Post,
  'id' | 'title' | 'slug' | 'publishedAt' | 'categories' | 'hero' | 'meta' | 'source' | 'external'
>

const toItem = (doc: MorePostsDoc): MorePostsItem | null =>
  doc.slug
    ? {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        description: doc.meta?.description?.replace(/\s+/g, ' ').trim() || null,
        publishedAt: doc.publishedAt ?? null,
        source: isExternalPost(doc)
          ? doc.external?.publisher || DEFAULT_PUBLISHER
          : (populatedDoc<Category>(doc.categories?.[0])?.title ?? null),
        hero: doc.hero
          ? { media: doc.hero.media, visualType: doc.hero.visualType, shader: doc.hero.shader }
          : null,
        metaImage: populatedDoc<Media>(doc.meta?.image),
      }
    : null

/**
 * The posts to show under a post: the ones it names as related, in the order
 * it names them, then others filed under its categories, then the newest.
 * Reads as an anonymous visitor (`overrideAccess: false`), so drafts never
 * surface, whoever is looking.
 */
export async function getMorePosts(
  post: Pick<Post, 'id' | 'relatedPosts' | 'categories' | 'hideRelatedPosts'>,
): Promise<MorePostsItem[]> {
  if (post.hideRelatedPosts) return []

  const payload = await getPayload({ config: configPromise })
  const picked: MorePostsDoc[] = []
  const taken = () => [post.id, ...picked.map((doc) => doc.id)]

  const find = async (where?: Where) => {
    const limit = MORE_POSTS_LIMIT - picked.length
    if (limit <= 0) return []
    const { docs } = await payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      limit,
      overrideAccess: false,
      pagination: false,
      select: SELECT,
      sort: '-publishedAt',
      where: { and: [...(where ? [where] : []), { id: { not_in: taken() } }] },
    })
    return docs as MorePostsDoc[]
  }

  const relatedIds = relationshipIds(post.relatedPosts ?? []).slice(0, MORE_POSTS_LIMIT)
  if (relatedIds.length) {
    const docs = await find({ id: { in: relatedIds } })
    picked.push(...docs.sort((a, b) => relatedIds.indexOf(a.id) - relatedIds.indexOf(b.id)))
  }

  const categoryIds = relationshipIds(post.categories ?? [])
  if (categoryIds.length) picked.push(...(await find({ categories: { in: categoryIds } })))

  picked.push(...(await find()))

  return picked.map(toItem).filter((item): item is MorePostsItem => item !== null)
}
