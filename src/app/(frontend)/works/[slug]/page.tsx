import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Work } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import PageTransition from '@/components/PageTransition'

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
  const relatedWorks = work?.relatedWorks || []
  const title = work?.title || 'Work'

  return (
    <>
      <PageClient />

      <PageTransition>
        <article className="pt-16 pb-16 relative z-10">
          <PayloadRedirects disableNotFound url={url} />

          {draft && <LivePreviewListener />}

          <div className="container mb-8">
            <h1 className="text-4xl font-bold">{title}</h1>
          </div>

          {hero && <RenderHero {...hero} />}

          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container">
              {layout && layout.length > 0 && (
                <div className="max-w-[48rem] mx-auto">
                  <RenderBlocks blocks={layout} />
                </div>
              )}

              {relatedWorks && relatedWorks.length > 0 && (
                <div className="mt-12 max-w-[52rem] mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Related Works</h2>
                </div>
              )}
            </div>
          </div>
        </article>
      </PageTransition>
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
