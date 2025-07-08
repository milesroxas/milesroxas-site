import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import PostsClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      hero: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-center text-7xl font-light">Posts</h1>
        </div>
      </div>

      <PostsClient posts={posts.docs} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Posts`,
  }
}
