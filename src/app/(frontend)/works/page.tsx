import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { WorksIndex } from '@/payload-types'
import {
  type MoreWorkItem,
  toWorkIndexItem,
  WORK_INDEX_SELECT,
  type WorkIndexDoc,
} from '@/sections/MoreWork/query'
import { WorkDial } from '@/sections/WorkDial/WorkDial.client'
import { WORKS_INDEX_DEFAULTS } from '@/shared/content/worksIndex'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'

// Force dynamic rendering to support query param access control
export const dynamic = 'force-dynamic'

type IndexedWork = WorkIndexDoc & { isProtected?: boolean | null }

const SELECT = { ...WORK_INDEX_SELECT, isProtected: true } as const

// Trusted fetch (protected works included): the render filter below hides them
// per request; the public API is gated by the works read access rule.
const getWorksPublished = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'works',
      depth: 1,
      pagination: false,
      where: { _status: { equals: 'published' } },
      sort: '_order',
      select: SELECT,
    })
    return docs as IndexedWork[]
  },
  ['works-index', 'published'],
  { revalidate: 600, tags: ['works'] },
)

// Draft results are per-preview-session; never cache them
const getWorksDraft = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'works',
    depth: 1,
    draft: true,
    pagination: false,
    sort: '_order',
    select: SELECT,
  })
  return docs as IndexedWork[]
}

/** The Works index global; null until it is first published, so the defaults stand in. */
const queryWorksIndex = cache(async (): Promise<WorksIndex | null> => {
  const { isEnabled: draft } = await draftMode()

  if (draft) {
    const payload = await getPayload({ config: configPromise })
    return payload.findGlobal({ slug: 'works-index', depth: 1, draft: true })
  }

  const index = (await getCachedGlobal('works-index', 1)()) as WorksIndex
  return index?._status === 'published' ? index : null
})

export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  const [index, works, hasAccess] = await Promise.all([
    queryWorksIndex(),
    draft ? getWorksDraft() : getWorksPublished(),
    hasWorkAccess(),
  ])

  // Protected works stay off the index without access; no fallback stands in here.
  const items = works
    .filter((work) => hasAccess || !work.isProtected)
    .map(toWorkIndexItem)
    .filter((item): item is MoreWorkItem => item !== null)
  const title = index?.title || WORKS_INDEX_DEFAULTS.heading

  if (items.length === 0) {
    return (
      <section className="px-gutter pt-[calc(var(--chrome-top)+--spacing(12))] pb-[calc(var(--dock-clearance)+--spacing(12))]">
        {draft && <LivePreviewListener />}
        <h1 className="text-heading-1">{title}</h1>
        <p className="mt-4 text-base text-muted-foreground">No work is published yet.</p>
      </section>
    )
  }

  return (
    <>
      {draft && <LivePreviewListener />}
      <WorkDial items={items} lead={index?.lead} title={title} />
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const index = await queryWorksIndex()

  return generateMeta({
    doc: {
      ...index,
      meta: {
        ...index?.meta,
        title: index?.meta?.title || index?.title || WORKS_INDEX_DEFAULTS.heading,
        description: index?.meta?.description || index?.lead || WORKS_INDEX_DEFAULTS.description,
      },
    },
    pathname: '/works',
  })
}
