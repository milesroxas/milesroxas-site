import type React from 'react'
import { MEDIA_SIZE_CLASS } from '@/blocks/shared/media-size'
import { Section } from '@/blocks/shared/section'
import type { YouTubeBlock as YouTubeBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { LiteYouTube } from './LiteYouTube'
import { parseYouTube } from './video'

type Props = YouTubeBlockProps & {
  /** Skip the band when the caller's shell owns it (the Section block). */
  bare?: boolean
  className?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

/**
 * The YouTube block on a composition band, sized the way the Caption block
 * sizes an image so the two read as one family. An unreadable link renders
 * nothing: draft saves skip field validation, so a half-typed URL reaches
 * this component on every preview.
 */
export const YouTubeBlock: React.FC<Props> = ({
  bare,
  className,
  enableGutter = true,
  size,
  theme,
  title,
  url,
}) => {
  const video = parseYouTube(url)
  if (!video) return null

  const sizeKey = size ?? 'contained'
  // In rich text (`enableGutter` off) there is no column to leave, so Full fills the text measure.
  const bleed = sizeKey === 'full' && enableGutter

  return (
    <Section bare={bare} spacing="loose" theme={theme}>
      <div className={cn({ container: enableGutter && !bleed }, className)}>
        <div className={MEDIA_SIZE_CLASS[sizeKey]}>
          <LiteYouTube className={bleed ? 'rounded-none' : undefined} title={title} video={video} />
        </div>
      </div>
    </Section>
  )
}
