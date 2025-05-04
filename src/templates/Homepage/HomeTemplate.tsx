import React from 'react'

import HomeTemplateClient from './HomeTemplate.client'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'

export default async function HomeTemplate({ hero, layout }: { hero: any; layout: any }) {
  return (
    <article className="pb-24">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
      <HomeTemplateClient />
    </article>
  )
}
