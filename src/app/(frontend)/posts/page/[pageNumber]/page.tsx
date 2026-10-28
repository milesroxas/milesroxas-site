import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { MEMBERS_TEASER } from '@/access/members'
import { Pagination } from '@/components/Pagination'
import {
  type MorePostsDoc,
  type MorePostsItem,
  POST_ITEM_SELECT,
  toPostItem,
} from '@/sections/MorePosts/query'
import { PostsIndex } from '@/sections/PostsIndex/PostsIndex.client'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

const POSTS_PER_PAGE = 12

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PER_PAGE,
    page: sanitizedPageNumber,
    context: MEMBERS_TEASER,
    overrideAccess: false,
    select: POST_ITEM_SELECT,
  })

  const items = (posts.docs as MorePostsDoc[])
    .map(toPostItem)
    .filter((item): item is MorePostsItem => item !== null)

  return (
    <PostsIndex items={items} title="Posts" total={posts.totalDocs}>
      {posts.page && posts.totalPages > 1 && (
        <Pagination className="pb-24" page={posts.page} totalPages={posts.totalPages} />
      )}
    </PostsIndex>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  // Page 1 is the index itself; later pages are their own canonical URLs.
  const pathname = pageNumber === '1' ? '/posts' : `/posts/page/${pageNumber}`
  return generateMeta({ doc: { title: `Posts, page ${pageNumber}` }, pathname })
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    context: MEMBERS_TEASER,
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / POSTS_PER_PAGE)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
