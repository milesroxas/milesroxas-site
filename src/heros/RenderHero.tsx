import type React from 'react'
import { HighImpactHero } from '@/heros/HighImpact'
import { HomeHero } from '@/heros/HomeHero'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import type { Page } from '@/payload-types'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  home: HomeHero,
}

type RenderHeroProps = Page['hero'] & {
  /** The page's h1 for the home hero, which has no title of its own (HomeHero). */
  heading?: string
}

export const RenderHero: React.FC<RenderHeroProps> = ({ heading, ...props }) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  if (type === 'home') return <HomeHero {...props} heading={heading} />

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
