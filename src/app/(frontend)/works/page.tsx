import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'

import WorksClient from '@/app/(frontend)/works/page.client'

export const revalidate = 600 // Revalidate every 10 minutes

const getWorksPublished = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const works = await payload.find({
      collection: 'works',
      depth: 2,
      pagination: false,
      overrideAccess: false,
      sort: '_order',
      select: {
        title: true,
        slug: true,
        meta: true,
        hero: true,
        _order: true,
        isProtected: true,
        fallbackWork: true,
      },
    })

    return works
  },
  ['works-archive', 'published'],
  { revalidate: 600, tags: ['works'] },
)

// Cache draft-enabled results separately to avoid leaking caches across preview/public
const getWorksDraft = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const works = await payload.find({
      collection: 'works',
      depth: 1,
      pagination: false,
      draft: true,
      overrideAccess: true,
      sort: '_order',
      select: {
        title: true,
        slug: true,
        meta: true,
        hero: true,
        _order: true,
        isProtected: true,
        fallbackWork: true,
      },
    })

    return works
  },
  ['works-archive', 'draft'],
  { revalidate: 60, tags: ['works'] },
)

export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  const works = draft ? await getWorksDraft() : await getWorksPublished()

  // Check if user has access to protected works
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const urlObj = new URL(url, 'http://localhost')
  const hasAccess = hasWorkAccess(urlObj.searchParams)

  // Replace protected works with fallback if user doesn't have access
  const payload = await getPayload({ config: configPromise })
  const processedWorks = await Promise.all(
    works.docs.map(async (work) => {
      if (work.isProtected && !hasAccess && work.fallbackWork) {
        const fallbackId = typeof work.fallbackWork === 'number' ? work.fallbackWork : work.fallbackWork.id
        const fallbackWork = await payload.findByID({
          collection: 'works',
          id: fallbackId,
          depth: 2,
        })
        return fallbackWork
      }
      return work
    })
  )

  return (
    <div className="pt-16 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-center font-light text-7xl">Work</h1>
        </div>
      </div>

      <WorksClient works={processedWorks} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Works', description: 'Portfolio of selected works',
  }
}
