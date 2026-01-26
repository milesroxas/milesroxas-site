import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import WorksClient from '@/app/(frontend)/works/page.client'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'

// Force dynamic rendering to support query param access control
export const dynamic = 'force-dynamic'

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

  // Check if user has access to protected works (cookie persists across navigation)
  const hasAccess = await hasWorkAccess()

  // Filter out protected works if user doesn't have access (don't show fallback on archive)
  const processedWorks = works.docs.filter((work) => {
    // If work is protected and user doesn't have access, hide it entirely
    if (work.isProtected && !hasAccess) {
      return false
    }
    return true
  })

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
    title: 'Works',
    description: 'Portfolio of selected works',
  }
}
