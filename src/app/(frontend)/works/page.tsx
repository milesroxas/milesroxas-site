import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import React from 'react'
import WorksClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 0

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const works = await payload.find({
    collection: 'works',
    depth: 1,
    limit: 12,
    overrideAccess: true,
    sort: '_order',
    select: {
      title: true,
      slug: true,
      meta: true,
      hero: true,
      _order: true,
    },
  })

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
