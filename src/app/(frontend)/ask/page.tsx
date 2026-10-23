import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { AskWidget } from '@/features/ask/AskWidget'
import { resolveAskHandoffTerms } from '@/features/ask/handoff'
import type { SiteInfo } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function Page() {
  // Site Info › Ask › Hide Ask takes the whole feature off the site, this
  // page included (src/features/ask/README.md).
  const siteInfo = (await getCachedGlobal('site-info', 1)()) as SiteInfo
  if (siteInfo?.ask?.hidden) notFound()

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <h1 className="text-heading-1 mb-8 text-center lg:mb-16">Ask</h1>
        <div className="mx-auto max-w-[50rem]">
          <AskWidget terms={resolveAskHandoffTerms(siteInfo)} />
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    doc: {
      title: 'Ask',
      meta: {
        description:
          'Ask about Miles Roxas’s work and writing. Answers come from the case studies and posts on this site.',
      },
    },
    pathname: '/ask',
  })
}
