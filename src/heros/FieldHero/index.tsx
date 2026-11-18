import type React from 'react'
import { AimFieldGround } from '@/features/aim-field/AimFieldGround'
import { HeroCopy, heroMeta } from '@/heros/HeroCopy'
import type { Page } from '@/payload-types'
import { cn } from '@/utilities/ui'

/**
 * The aim field grounds the whole opening, edge to edge, under quiet type:
 * a statement sized past `text-display` at the foot of the band, and a rule
 * whose readout names what the reticle is locked on. The band clears the
 * fixed top bar and the dock.
 */
export const FieldHero: React.FC<Page['hero']> = ({ links, richText }) => (
  <section className="bg-background text-foreground relative isolate flex min-h-[92svh] flex-col overflow-clip">
    <AimFieldGround />
    <div className="container flex flex-1 flex-col justify-end pt-[calc(var(--chrome-top)+12vh)] pb-10">
      <HeroCopy
        links={links}
        richText={richText}
        titleClassName="md:[&_h1]:text-[clamp(3.25rem,8vw,9.5rem)] md:[&_h1]:leading-[0.98] md:[&_h1]:tracking-[-0.035em]"
      />
    </div>
    <div className="container">
      <div
        aria-hidden
        className="border-foreground/15 flex justify-between gap-4 border-t pt-2.5 pb-[calc(var(--dock-clearance)+1rem)]"
      >
        <span className={heroMeta}>
          aim / <span data-aim-out="target">idle</span>
        </span>
        <span className={cn(heroMeta, 'hidden md:inline')} data-aim-out="cell" />
      </div>
    </div>
  </section>
)
