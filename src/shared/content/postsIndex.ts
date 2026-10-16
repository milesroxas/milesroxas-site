import type { Payload } from 'payload'

/**
 * The index's own words when the Pages document with the `posts` slug has
 * none in its SEO tab. That document never renders (the route owns the path);
 * its SEO title and description are the editor's handle on this page.
 */
export const POSTS_INDEX = {
  path: '/posts',
  title: 'Posts',
  description:
    'Articles by Miles Roxas on design systems, brand strategy, Payload CMS, Webflow tooling and running a small design studio.',
} as const

/** The posts index's SEO title and description, each falling back to `POSTS_INDEX`. */
export async function readPostsIndexMeta(
  payload: Payload,
): Promise<{ title: string; description: string }> {
  const { docs } = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: { slug: { equals: 'posts' } },
    select: { meta: true },
  })
  const meta = docs[0]?.meta
  return {
    title: meta?.title?.trim() || POSTS_INDEX.title,
    description: meta?.description?.trim() || POSTS_INDEX.description,
  }
}
