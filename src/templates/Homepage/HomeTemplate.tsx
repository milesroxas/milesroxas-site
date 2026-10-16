import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import type { Page, SiteInfo } from '@/payload-types'
import { homeHeading } from '@/shared/content/home'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function HomeTemplate({
  hero,
  layout,
}: {
  hero: Page['hero']
  layout: Page['layout']
}) {
  const siteInfo = (await getCachedGlobal('site-info', 1)()) as SiteInfo | null

  return (
    <article className="pb-24">
      <RenderHero {...hero} heading={homeHeading(siteInfo)} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}
