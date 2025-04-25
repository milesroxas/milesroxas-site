import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Work } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const works = await payload.find({
    collection: 'works',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
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
  const url = '/works/' + slug

  const work = await queryWorkBySlug({ slug })

  if (!work) return <PayloadRedirects url={url} />

  const hero = work?.hero
  const layout = work?.layout || []

  return (
    <>
      <PageClient />

      <article className="relative z-10">
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        {hero && <RenderHero {...hero} />}
        <RenderBlocks blocks={layout as any} />
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
