import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { MEMBERS_TEASER } from '@/access/members'
import { postsIndexTitle, queryPostsIndex } from '@/app/(frontend)/posts/query-index'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Pagination } from '@/components/Pagination'
import {
  type MorePostsDoc,
  type MorePostsItem,
  POST_ITEM_SELECT,
  toPostItem,
} from '@/sections/MorePosts/query'
import { PostsIndex } from '@/sections/PostsIndex/PostsIndex.client'
import { POSTS_INDEX_DEFAULTS } from '@/shared/content/postsIndex'
import { generateMeta } from '@/utilities/generateMeta'
import { breadcrumbSchema, postsIndexSchema } from '@/utilities/schema'

const POSTS_PER_PAGE = 12

// Cached HTML, regenerated every ten minutes and on publish (revalidatePost,
// and the Posts index global's own hook).
export const revalidate = 600

const getPosts = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const posts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: POSTS_PER_PAGE,
      context: MEMBERS_TEASER,
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
  const { isEnabled: draft } = await draftMode()
  const [{ items, totalDocs, totalPages }, index] = await Promise.all([
    getPosts(),
    queryPostsIndex(),
  ])
  const title = postsIndexTitle(index)

  return (
    <>
      <JsonLd
        data={[
          postsIndexSchema(
            index ?? {},
            POSTS_INDEX_DEFAULTS,
            items.map((item) => ({ name: item.title, path: `/posts/${item.slug}` })),
          ),
          breadcrumbSchema([{ name: title, path: POSTS_INDEX_DEFAULTS.path }]),
        ]}
      />
      {draft && <LivePreviewListener />}
      <PostsIndex items={items} title={title} total={totalDocs}>
        {totalPages > 1 && <Pagination className="pb-24" page={1} totalPages={totalPages} />}
      </PostsIndex>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const index = await queryPostsIndex()

  return generateMeta({
    doc: {
      ...index,
      meta: {
        ...index?.meta,
        title: index?.meta?.title || postsIndexTitle(index),
        description: index?.meta?.description || POSTS_INDEX_DEFAULTS.description,
      },
    },
    pathname: POSTS_INDEX_DEFAULTS.path,
    ...(index?.meta?.noIndex ? {} : { markdownPath: `${POSTS_INDEX_DEFAULTS.path}.md` }),
  })
}
