import React from 'react'

import HomeTemplateClient from './HomeTemplate.client'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { Page } from '@/payload-types'

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
      <HomeTemplateClient />
    </article>
  )
}
