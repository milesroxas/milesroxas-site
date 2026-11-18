import type React from 'react'
import { FieldHero } from '@/heros/FieldHero'
import { HighImpactHero } from '@/heros/HighImpact'
import { InstrumentHero } from '@/heros/InstrumentHero'
import { LiftHero } from '@/heros/LiftHero'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import type { Page } from '@/payload-types'

const heroes = {
  field: FieldHero,
  highImpact: HighImpactHero,
  instrument: InstrumentHero,
  lift: LiftHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
