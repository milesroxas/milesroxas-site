import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { postCardSelect } from '@/collections/Posts/cardSelect'
import { JsonLd } from '@/components/JsonLd'
import { generateMeta } from '@/utilities/generateMeta'
import { breadcrumbSchema, collectionPageSchema } from '@/utilities/schema'

import PostsClient from './page.client'

const POSTS_INDEX = { path: '/posts', title: 'Posts', description: 'Writing by Miles Roxas.' }

export const revalidate = 600 // Revalidate every 10 minutes

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
  const posts = await getPosts()

  return (
    <div className="pt-24 pb-24">
      <JsonLd
        data={[
          collectionPageSchema({ ...POSTS_INDEX, name: POSTS_INDEX.title }),
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

export function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    doc: { title: POSTS_INDEX.title, meta: { description: POSTS_INDEX.description } },
    pathname: POSTS_INDEX.path,
  })
}
