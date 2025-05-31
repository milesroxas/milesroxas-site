import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import PageClient from './page.client'
import { PageRange } from '@/components/PageRange'
import { WorkArchive } from '@/components/WorkArchive'
import { Pagination } from '@/components/Pagination'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const works = await payload.find({
    collection: 'works',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      meta: true,
      hero: true,
    },
  })

  return (
    <div className="pt-16 pb-24">
      <PageClient />

      <div className="container mb-8">
        <PageRange
          collection="works"
          currentPage={works.page}
          limit={12}
          totalDocs={works.totalDocs}
        />
      </div>

      <WorkArchive works={works.docs} />

      <div className="container">
        {works.totalPages > 1 && works.page && (
          <Pagination page={works.page} totalPages={works.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Works`,
  }
}
