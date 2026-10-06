import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { WorksIndex } from '@/payload-types'
import { WORK_INDEX_GRID } from '@/sections/MoreWork/grid'
import { WorkIndex } from '@/sections/MoreWork/MoreWork.client'
import { moreWorkMotionStyle } from '@/sections/MoreWork/motion'
import {
  type MoreWorkItem,
  toWorkIndexItem,
  WORK_INDEX_SELECT,
  type WorkIndexDoc,
} from '@/sections/MoreWork/query'
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

  return (
    <section
      aria-labelledby="works-index-title"
      className="px-gutter pt-[calc(var(--chrome-top)+--spacing(12))] pb-[calc(var(--dock-clearance)+--spacing(12))] md:pt-[calc(var(--chrome-top)+--spacing(20))] md:pb-40"
      style={moreWorkMotionStyle}
    >
      {draft && <LivePreviewListener />}
      <div className="flex flex-col gap-12 md:gap-20">
        <header
          className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${WORK_INDEX_GRID} plate:items-end`}
        >
          <h1
            className="flex items-start gap-3 text-display leading-[0.9] tracking-[-0.035em]"
            id="works-index-title"
          >
            {title}
            <span
              aria-hidden
              className="pt-1.5 font-medium font-mono text-sm/none tracking-normal tabular-nums md:pt-2.5"
            >
              {String(items.length).padStart(2, '0')}
            </span>
          </h1>
          {index?.lead && (
            <p className="max-w-[34ch] text-pretty text-lg/snug text-muted-foreground md:pb-1 md:text-xl/snug">
              {index.lead}
            </p>
          )}
        </header>
        {items.length > 0 ? (
          <WorkIndex compact items={items} titleAs="h2" />
        ) : (
          <p className="border-foreground border-t pt-7 text-base text-muted-foreground">
            No work is published yet.
          </p>
        )}
      </div>
    </section>
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
