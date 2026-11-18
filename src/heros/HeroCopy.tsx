import type React from 'react'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText/Legacy'
import type { Page } from '@/payload-types'
import { linkKeys } from '@/utilities/reactKeyDomains'
import { cn } from '@/utilities/ui'

/**
 * Small caps metadata on a hero's frame rules: mono, tracked, tabular, in
 * the muted ink. Readouts (`data-aim-out`) take the same voice.
 */
export const heroMeta =
  'font-mono text-[11px] leading-snug tracking-[0.06em] whitespace-nowrap text-muted-foreground uppercase tabular-nums'

/**
 * A frame hero's copy: its rich text as a light lowercase statement over a
 * plain lede, then its links. Prose styles are off so the type tokens set
 * the voice; `titleClassName` lets a hero push the statement past
 * `text-display` when the band is all type.
 */
export const HeroCopy: React.FC<
  Pick<Page['hero'], 'links' | 'richText'> & { className?: string; titleClassName?: string }
> = ({ className, links, richText, titleClassName }) => (
  <div className={cn('flex flex-col gap-7', className)}>
    {richText && (
      <RichText
        className={cn(
          'flex flex-col gap-6',
          '[&_h1]:text-display [&_h1]:text-balance [&_h1]:lowercase',
          '[&_p]:max-w-[44ch] [&_p]:text-lg [&_p]:text-pretty',
          titleClassName,
        )}
        data={richText}
        enableGutter={false}
        enableProse={false}
      />
    )}
    {Array.isArray(links) && links.length > 0 && (
      <ul className="flex flex-wrap items-center gap-4">
        {links.map(({ link }, i) => (
          <li key={linkKeys.fromLink(link, i)}>
            <CMSLink {...link} />
          </li>
        ))}
      </ul>
    )}
  </div>
)
