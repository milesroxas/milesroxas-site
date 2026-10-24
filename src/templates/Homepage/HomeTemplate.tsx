import { RenderBlocks } from '@/blocks/RenderBlocks'
import { HomeHero } from '@/heros/HomeHero'
import type { Home, SiteInfo } from '@/payload-types'
import { homeHeading } from '@/shared/content/home'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function HomeTemplate({
  hero,
  layout,
}: {
  hero: Home['hero']
  layout: Home['layout']
}) {
  const siteInfo = (await getCachedGlobal('site-info', 1)()) as SiteInfo | null

  return (
    <article className="pb-24">
      <HomeHero heading={homeHeading(siteInfo)} media={hero.media} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}
