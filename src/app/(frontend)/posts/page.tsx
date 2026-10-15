import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { postCardSelect } from '@/collections/Posts/cardSelect'
import { JsonLd } from '@/components/JsonLd'
import { generateMeta } from '@/utilities/generateMeta'
import { breadcrumbSchema, collectionPageSchema } from '@/utilities/schema'

import PostsClient from './page.client'

/**
 * The index's own words when the Pages document with the `posts` slug has
 * none in its SEO tab. That document never renders (the route owns the path);
 * its SEO title and description are the editor's handle on this page.
 */
const POSTS_INDEX = {
  path: '/posts',
  title: 'Posts',
  description:
    'Articles by Miles Roxas on design systems, brand strategy, Payload CMS, Webflow tooling and running a small design studio.',
}

export const revalidate = 600 // Revalidate every 10 minutes

const getPostsIndexMeta = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
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
  },
  ['posts-index-meta'],
  { revalidate: 600, tags: ['pages'] },
)

const getPosts = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      overrideAccess: false,
      select: postCardSelect,
    })

    return posts
  },
  ['posts-archive'],
  { revalidate: 600, tags: ['posts'] },
)

export default async function Page() {
  const [posts, meta] = await Promise.all([getPosts(), getPostsIndexMeta()])
  const items = posts.docs.flatMap((post) =>
    post.slug && post.title ? [{ name: post.title, path: `/posts/${post.slug}` }] : [],
  )

  return (
    <div className="pt-24 pb-24">
      <JsonLd
        data={[
          collectionPageSchema({
            path: POSTS_INDEX.path,
            name: POSTS_INDEX.title,
            description: meta.description,
            items,
          }),
          breadcrumbSchema([{ name: POSTS_INDEX.title, path: POSTS_INDEX.path }]),
        ]}
      />
      <div className="container mb-16">
        <div className="max-w-none">
          <h1 className="text-center font-light text-7xl">Posts</h1>
        </div>
      </div>

      <PostsClient posts={posts.docs} />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPostsIndexMeta()
  return generateMeta({
    doc: { title: POSTS_INDEX.title, meta: { title: meta.title, description: meta.description } },
    pathname: POSTS_INDEX.path,
  })
}
