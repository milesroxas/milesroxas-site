import type React from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText/Legacy'
import { resolveOpening } from '@/features/immersive/visual'
import { HeroGround, pinnedOpening } from '@/heros/HeroGround'
import type { Page } from '@/payload-types'
import { linkKeys } from '@/utilities/reactKeyDomains'

export const MediumImpactHero: React.FC<Page['hero']> = (hero) => {
  const { links, media, richText } = hero
  // The effect the editor chose to ground the band (composer roadmap, D12).
  // With none, the hero renders exactly as it did before the visual slot.
  const { ground, surface } = resolveOpening(hero, { seedKey: 'hero' })
  return (
    <div
      {...(ground
        ? pinnedOpening(surface, 'relative isolate overflow-clip py-12')
        : { className: '' })}
    >
      <HeroGround ground={ground} />
      <div className="container mb-8">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => (
              <li key={linkKeys.fromLink(link, i)}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="container">
        {media && typeof media === 'object' && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
