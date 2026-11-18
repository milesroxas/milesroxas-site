import type React from 'react'
import { AimFieldGround } from '@/features/aim-field/AimFieldGround'
import { HeroCopy, heroMeta } from '@/heros/HeroCopy'
import type { Page } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { pixelFont } from './pixelFont'

/**
 * A flat paper opening whose one moment is an ink panel running the aim
 * field, beside the copy. The panel is pinned dark in either visitor theme,
 * so its fluoro readout (the cell under the reticle) never sits on paper.
 */
export const InstrumentHero: React.FC<Page['hero']> = ({ links, richText }) => (
  <section className="bg-background text-foreground">
    <div className="container grid items-end gap-10 pt-[calc(var(--chrome-top)+9vh)] pb-14 md:grid-cols-12 md:gap-x-6">
      <HeroCopy className="md:col-span-6" links={links} richText={richText} />
      <div
        className={cn(
          pixelFont.variable,
          'bg-background text-foreground ring-foreground/15 relative isolate aspect-square ring-1 md:col-span-5 md:col-start-8 md:aspect-auto md:h-[min(68svh,680px)]',
        )}
        data-theme="dark"
      >
        <AimFieldGround look="panel" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3.5 top-3 flex items-start justify-between"
        >
          <span className={heroMeta}>x / y</span>
          <span
            className="text-fluoro font-[family-name:var(--font-geist-pixel-square)] text-[22px] leading-none tabular-nums"
            data-aim-out="cell"
          >
            000·000
          </span>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-3.5 bottom-3">
          <span className={heroMeta} data-aim-out="target">
            idle
          </span>
        </div>
      </div>
    </div>
  </section>
)
