import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { AskWidget } from '@/features/ask/AskWidget'
import { resolveAskHandoffTerms } from '@/features/ask/handoff'
import type { SiteInfo } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function Page() {
  // Site Info › Ask › Hide Ask takes the whole feature off the site, this
  // page included (src/features/ask/README.md).
  const siteInfo = (await getCachedGlobal('site-info', 1)()) as SiteInfo
  if (siteInfo?.ask?.hidden) notFound()

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <h1 className="mb-8 text-center text-heading-1 lg:mb-16">Ask</h1>
        <div className="mx-auto max-w-[50rem]">
          <AskWidget terms={resolveAskHandoffTerms(siteInfo)} />
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Ask | Miles Roxas',
  }
}
