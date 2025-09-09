import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import React from 'react'
import WorksClient from '@/app/(frontend)/works/page.client'

export const dynamic = 'force-dynamic'

const getWorks = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const works = await payload.find({
      collection: 'works',
      depth: 1,
      limit: 12,
      overrideAccess: false,
      sort: '_order',
      select: {
        title: true,
        slug: true,
        meta: true,
        hero: true,
        _order: true,
      },
    })

    return works
  },
  ['works-archive'],
  { revalidate: 600, tags: ['works'] },
)

export default async function Page() {
  const works = await getWorks()

  return (
    <div className="pt-16 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-center text-7xl font-light">Work</h1>
        </div>
      </div>

      <WorksClient works={works.docs} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Works`,
  }
}
