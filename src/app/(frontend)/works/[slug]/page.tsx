import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderHero } from '@/heros/RenderHero'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

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
      industry: true,
      role: true,
      deliverables: true,
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

  let work = await queryWorkBySlug({ slug })

  if (!work) return <PayloadRedirects url={url} />

  // Check if user has access to protected works
  const headersList = await headers()
  const fullUrl = headersList.get('x-url') || ''
  const urlObj = new URL(fullUrl, 'http://localhost')
  const hasAccess = hasWorkAccess(urlObj.searchParams)

  // If work is protected and user doesn't have access, redirect to fallback
  if (work.isProtected && !hasAccess && work.fallbackWork) {
    const payload = await getPayload({ config: configPromise })
    const fallbackId = typeof work.fallbackWork === 'number' ? work.fallbackWork : work.fallbackWork.id
    const fallbackWork = await payload.findByID({
      collection: 'works',
      id: fallbackId,
      depth: 1,
    })
    
    if (fallbackWork) {
      work = fallbackWork
    }
  }

  const hero = work?.hero
  const layout = work?.layout || []

  return (
    <>
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <article className="relative z-10">
        {hero && <RenderHero {...hero} />}
        <PageClient work={work} />
        <RenderBlocks blocks={layout} />
      </article>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const work = await queryWorkBySlug({ slug })

  return generateMeta({ doc: work })
}

const queryWorkBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'works',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  return result.docs?.[0] || null
})
