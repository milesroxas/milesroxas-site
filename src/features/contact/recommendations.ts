import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import type { StoredVisualSlot } from '@/features/immersive/visual'
import type { ContactPage, Media } from '@/payload-types'
import { type MorePostsDoc, POST_ITEM_SELECT, toPostItem } from '@/sections/MorePosts/query'
import { toWorkIndexItem, WORK_INDEX_SELECT, type WorkIndexDoc } from '@/sections/MoreWork/query'

/** One row of three under the receipt. */
const CONTACT_RECOMMENDATIONS_LIMIT = 3

/** A work or post to open while the reply is on its way: only what its card renders. */
export type ContactRecommendation = {
  key: string
  kind: 'work' | 'post'
  href: string
  title: string
  /** The work's client (else industry), or where the post ran (else its category). */
  context: string | null
  publishedAt: string | null
  media: Media | null
  /** A post's hero, for a post whose picture is an effect's poster. */
  hero: StoredVisualSlot | null
}

type Pick = { relationTo: 'works' | 'posts'; id: number }

const toPicks = (page: ContactPage | null): Pick[] =>
  (page?.recommended ?? []).map(({ relationTo, value }) => ({
    relationTo,
    id: typeof value === 'object' ? value.id : value,
  }))

const idsOf = (picks: Pick[], relationTo: Pick['relationTo']) =>
  picks.filter((pick) => pick.relationTo === relationTo).map((pick) => pick.id)

const byId = (ids: number[]): Where => ({ id: { in: ids } })
const notIn = (ids: number[]): Where | undefined =>
  ids.length ? { id: { not_in: ids } } : undefined

const fromWork = (doc: WorkIndexDoc): ContactRecommendation | null => {
  const item = toWorkIndexItem(doc)
  return item
    ? {
        key: `work-${item.id}`,
        kind: 'work',
        href: `/works/${item.slug}`,
        title: item.title,
        context: item.client ?? item.industry,
        publishedAt: null,
        media: item.media,
        hero: null,
      }
    : null
}

const fromPost = (doc: MorePostsDoc): ContactRecommendation | null => {
  const item = toPostItem(doc)
  return item
    ? {
        key: `post-${item.id}`,
        kind: 'post',
        href: `/posts/${item.slug}`,
        title: item.title,
        context: item.source,
        publishedAt: item.publishedAt,
        media: item.metaImage,
        hero: item.hero,
      }
    : null
}

/**
 * The picks in the editor's order, then the first works in the Works order,
 * then the newest post when none was picked. Reads as an anonymous visitor
 * (`overrideAccess: false`), so drafts and protected works never surface.
 */
async function findRecommendations(picks: Pick[]): Promise<ContactRecommendation[]> {
  const payload = await getPayload({ config: configPromise })
  const findWorks = async (limit: number, where?: Where) =>
    limit > 0
      ? ((
          await payload.find({
            collection: 'works',
            depth: 1,
            draft: false,
            limit,
            overrideAccess: false,
            pagination: false,
            select: WORK_INDEX_SELECT,
            sort: '_order',
            where,
          })
        ).docs as WorkIndexDoc[])
      : []
  const findPosts = async (limit: number, where?: Where) =>
    limit > 0
      ? ((
          await payload.find({
            collection: 'posts',
            depth: 1,
            draft: false,
            limit,
            overrideAccess: false,
            pagination: false,
            select: POST_ITEM_SELECT,
            sort: '-publishedAt',
            where,
          })
        ).docs as MorePostsDoc[])
      : []

  const workIds = idsOf(picks, 'works')
  const postIds = idsOf(picks, 'posts')
  const [works, posts] = await Promise.all([
    workIds.length ? findWorks(workIds.length, byId(workIds)) : [],
    postIds.length ? findPosts(postIds.length, byId(postIds)) : [],
  ])
  // A pick that is now a draft or protected is missing here, and its place fills below.
  const picked = picks.flatMap(({ relationTo, id }) => {
    const work = relationTo === 'works' && works.find((doc) => doc.id === id)
    const post = relationTo === 'posts' && posts.find((doc) => doc.id === id)
    return (work ? fromWork(work) : post ? fromPost(post) : null) ?? []
  })

  const open = CONTACT_RECOMMENDATIONS_LIMIT - picked.length
  const newestPost = picked.some((item) => item.kind === 'post')
    ? []
    : (await findPosts(Math.min(open, 1), notIn(postIds))).flatMap((doc) => fromPost(doc) ?? [])
  const firstWorks = (await findWorks(open - newestPost.length, notIn(workIds))).flatMap(
    (doc) => fromWork(doc) ?? [],
  )

  return [...picked, ...firstWorks, ...newestPost].slice(0, CONTACT_RECOMMENDATIONS_LIMIT)
}

/** Cached with the works, posts and Contact page global, so a publish to any of them refreshes it. */
export const getContactRecommendations = (page: ContactPage | null) => {
  const picks = toPicks(page)
  return unstable_cache(
    () => findRecommendations(picks),
    ['contact-recommendations', picks.map(({ relationTo, id }) => `${relationTo}:${id}`).join()],
    { tags: ['works', 'posts', 'global_contact-page'], revalidate: 600 },
  )()
}
