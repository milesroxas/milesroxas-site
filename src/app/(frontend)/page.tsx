import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Home } from '@/payload-types'
import { HOME_SURFACE } from '@/shared/content/surfaces'
import HomeTemplate from '@/templates/Homepage/HomeTemplate'
import { generateMeta } from '@/utilities/generateMeta'
import { faqPageSchema, profilePageSchema } from '@/utilities/schema'

// Cached HTML, regenerated every ten minutes and on publish (src/globals/Home.ts).
export const revalidate = 600

/** The Home global; null until it is first published. */
const queryHome = cache(async (): Promise<Home | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  // Trusted fetch so protected works referenced in blocks stay populated for
  // render-time gating (RenderBlocks → processLayoutBlocks). depth 3 is
  // required to populate media on works nested inside blocks.
  const home = await payload.findGlobal({ slug: HOME_SURFACE.global, depth: 3, draft })
  return draft || home?._status === 'published' ? home : null
})

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode()
  const home = await queryHome()
  if (!home) notFound()

  return (
    <>
      <JsonLd data={[profilePageSchema(home), faqPageSchema(home.layout)]} />
      {draft && <LivePreviewListener />}
      <HomeTemplate hero={home.hero} layout={home.layout} />
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const home = await queryHome()

  return generateMeta({
    doc: home,
    pathname: HOME_SURFACE.path,
    ...(home && !home.meta?.noIndex ? { markdownPath: '/index.md' } : {}),
  })
}
