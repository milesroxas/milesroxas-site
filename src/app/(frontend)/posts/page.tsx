import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { JsonLd } from '@/components/JsonLd'
import { Pagination } from '@/components/Pagination'
import {
  type MorePostsDoc,
  type MorePostsItem,
  POST_ITEM_SELECT,
  toPostItem,
} from '@/sections/MorePosts/query'
import { PostsIndex } from '@/sections/PostsIndex/PostsIndex.client'
import { POSTS_INDEX, readPostsIndexMeta } from '@/shared/content/postsIndex'
import { generateMeta } from '@/utilities/generateMeta'
import { breadcrumbSchema, collectionPageSchema } from '@/utilities/schema'

const POSTS_PER_PAGE = 12

export const revalidate = 600 // Revalidate every 10 minutes

const getPostsIndexMeta = unstable_cache(
  async () => readPostsIndexMeta(await getPayload({ config: configPromise })),
  ['posts-index-meta'],
  { revalidate: 600, tags: ['pages'] },
)

const getPosts = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: POSTS_PER_PAGE,
      overrideAccess: false,
      select: POST_ITEM_SELECT,
    })

    return {
      items: (posts.docs as MorePostsDoc[])
        .map(toPostItem)
        .filter((item): item is MorePostsItem => item !== null),
      totalDocs: posts.totalDocs,
      totalPages: posts.totalPages,
    }
  },
  ['posts-archive'],
  { revalidate: 600, tags: ['posts'] },
)

export default async function Page() {
  const [{ items, totalDocs, totalPages }, meta] = await Promise.all([
    getPosts(),
    getPostsIndexMeta(),
  ])

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            path: POSTS_INDEX.path,
            name: POSTS_INDEX.title,
            description: meta.description,
            items: items.map((item) => ({ name: item.title, path: `/posts/${item.slug}` })),
          }),
          breadcrumbSchema([{ name: POSTS_INDEX.title, path: POSTS_INDEX.path }]),
        ]}
      />
      <PostsIndex items={items} title={POSTS_INDEX.title} total={totalDocs}>
        {totalPages > 1 && <Pagination className="pb-24" page={1} totalPages={totalPages} />}
      </PostsIndex>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPostsIndexMeta()
  return generateMeta({
    doc: { title: POSTS_INDEX.title, meta: { title: meta.title, description: meta.description } },
    pathname: POSTS_INDEX.path,
    markdownPath: `${POSTS_INDEX.path}.md`,
  })
}
