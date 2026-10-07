import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import type { Page } from '@/payload-types'

export default async function HomeTemplate({
  hero,
  layout,
}: {
  hero: Page['hero']
  layout: Page['layout']
}) {
  return (
    <article className="pb-24">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}
