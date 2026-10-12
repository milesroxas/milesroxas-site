import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache, Suspense } from 'react'
import { slugWhere } from '@/app/(frontend)/slug-where'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ContentsButton } from '@/features/contents'
import { WorkHero } from '@/heros/WorkHero'
import { MoreWork } from '@/sections/MoreWork'
import { WorkIntro } from '@/sections/WorkIntro'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'
import { generateMeta } from '@/utilities/generateMeta'
import { resolveVisibleWork } from '@/utilities/resolveVisibleWork'
import { breadcrumbSchema, creativeWorkSchema, faqPageSchema } from '@/utilities/schema'
import PageClient from './page.client'

// Cached HTML, regenerated every ten minutes and on publish (revalidateWork).
// Only a protected work reads the visitor's cookie and so renders per request.
export const revalidate = 600

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
  const visibleWork = await resolveVisibleWork(work, hasWorkAccess)

  if (!visibleWork) notFound()

  const layout = visibleWork.layout || []

  return (
    <>
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <article className="relative z-10">
        {/* The visible work's facts only: a protected work's stand-in describes itself. */}
        <JsonLd
          data={[
            creativeWorkSchema(visibleWork),
            breadcrumbSchema([
              { name: 'Work', path: '/works' },
              { name: visibleWork.title, path: `/works/${visibleWork.slug}` },
            ]),
            faqPageSchema(layout),
          ]}
        />
        <WorkHero {...visibleWork} />
        <PageClient work={visibleWork} />
        {/* Arriving from a work card, the body loads in after the hero (globals.css). */}
        <div data-slot="work-body">
          {visibleWork.intro?.body && (
            <WorkIntro body={visibleWork.intro.body} title={visibleWork.intro.title} />
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
  const visibleWork = work ? await resolveVisibleWork(work, hasWorkAccess) : null

  // The canonical URL is the stand-in's own page: this address is not the public one.
  return generateMeta({
    doc: visibleWork,
    pathname: `/works/${visibleWork?.slug ?? slug}`,
    ...(visibleWork && !visibleWork.isProtected
      ? { markdownPath: `/works/${visibleWork.slug}.md` }
      : {}),
  })
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
