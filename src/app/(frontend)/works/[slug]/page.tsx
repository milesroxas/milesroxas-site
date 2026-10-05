import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache, Suspense } from 'react'
import { slugWhere } from '@/app/(frontend)/slug-where'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ContentsButton } from '@/features/contents'
import { WorkHero } from '@/heros/WorkHero'
import { MoreWork } from '@/sections/MoreWork'
import { WorkIntro } from '@/sections/WorkIntro'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'
import { generateMeta } from '@/utilities/generateMeta'
import { resolveVisibleWork } from '@/utilities/resolveVisibleWork'
import PageClient from './page.client'

// Force dynamic rendering to support query param access control
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const works = await payload.find({
    collection: 'works',
    draft: false,
    limit: 10,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      title: true,
    },
  })

  const params = works.docs
    ?.filter((doc) => {
      return doc.slug !== 'works'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Work({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = `/works/${slug}`

  const work = await queryWorkBySlug({ slug })

  if (!work) return <PayloadRedirects url={url} />

  // Protected works resolve to their fallback (or 404 without one)
  const hasAccess = await hasWorkAccess()
  const visibleWork = await resolveVisibleWork(work, hasAccess)

  if (!visibleWork) notFound()

  const layout = visibleWork.layout || []

  return (
    <>
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <article className="relative z-10">
        <WorkHero {...visibleWork} />
        <PageClient work={visibleWork} />
        {/* Arriving from a work card, the body loads in after the hero (globals.css). */}
        <div data-slot="work-body">
          {visibleWork.intro?.title && (
            <WorkIntro
              body={visibleWork.intro.body}
              eyebrow={visibleWork.intro.eyebrow}
              title={visibleWork.intro.title}
            />
          )}
          <RenderBlocks blocks={layout} />
          <Suspense fallback={null}>
            <MoreWork work={visibleWork} />
          </Suspense>
        </div>
        {visibleWork.showContents && <ContentsButton />}
      </article>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const work = await queryWorkBySlug({ slug })

  // Never leak protected-work meta: resolve to the fallback (or nothing)
  const hasAccess = await hasWorkAccess()
  const visibleWork = work ? await resolveVisibleWork(work, hasAccess) : null

  return generateMeta({ doc: visibleWork })
}

const queryWorkBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  // Trusted server fetch (overrideAccess default) so protected works stay
  // resolvable for keyed visitors; rendering is gated via resolveVisibleWork
  // and the public API is protected by the works read access rule.
  const result = await payload.find({
    collection: 'works',
    draft,
    limit: 1,
    pagination: false,
    where: slugWhere(slug, draft),
  })
  return result.docs?.[0] || null
})
