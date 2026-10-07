import type { StaticImageData } from 'next/image'
import type React from 'react'
import { MEDIA_SIZE_CLASS, type MediaSize } from '@/blocks/shared/media-size'
import { Section } from '@/blocks/shared/section'
import RichText from '@/components/RichText'
import type { CaptionBlock as CaptionBlockProps, Media as MediaDoc } from '@/payload-types'
import { hasRichTextContent } from '@/utilities/hasRichTextContent'
import { cn } from '@/utilities/ui'

import { Media } from '../../components/Media'

type Props = CaptionBlockProps & {
  /** Skip the band when the caller's shell owns it (the Section block). */
  bare?: boolean
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

/** `sizes` hints matching each MEDIA_SIZE_CLASS cap (max-w-3xl = 768px, max-w-md = 448px). */
const sizeHints: Record<MediaSize, string> = {
  full: '100vw',
  contained: '100vw',
  inset: '(min-width: 768px) 768px, 100vw',
  small: '(min-width: 448px) 448px, 100vw',
}

/** The populated media, the caption to show (a non-empty override wins) and whether anything mounts. */
const resolveCaptionMedia = ({
  captionOverride,
  media,
  staticImage,
}: Pick<Props, 'captionOverride' | 'media' | 'staticImage'>) => {
  // Lexical may leave `media` as an id when depth is too low; callers that
  // render rich text must query with enough depth to populate uploads.
  const mediaDoc = media && typeof media === 'object' ? media : null

  let caption: MediaDoc['caption'] | undefined
  if (captionOverride && hasRichTextContent(captionOverride)) caption = captionOverride
  else if (mediaDoc) caption = mediaDoc.caption

  // Videos may rely on filename + CDN rather than a populated `url`; don't
  // require `url` or image-only fields to mount the player.
  const hasRenderableMedia = Boolean(
    staticImage ||
      (mediaDoc && (mediaDoc.url || mediaDoc.filename || mediaDoc.mimeType?.startsWith('video'))),
  )

  return { caption, hasRenderableMedia, mediaDoc }
}

export const CaptionBlock: React.FC<Props> = (props) => {
  const {
    bare,
    captionClassName,
    captionOverride,
    className,
    enableGutter = true,
    imgClassName,
    media,
    size,
    staticImage,
    theme,
    disableInnerContainer,
  } = props

  const { caption, hasRenderableMedia, mediaDoc } = resolveCaptionMedia({
    captionOverride,
    media,
    staticImage,
  })

  const sizeKey = size ?? 'contained'
  // Full width: media leaves the column and drops its radius; the caption text stays in it.
  const bleed = sizeKey === 'full'
  const mediaClassName = cn('h-auto w-full', !bleed && 'rounded-lg', imgClassName)

  return (
    <Section bare={bare} spacing="loose" theme={theme}>
      <div className={cn({ container: enableGutter && !bleed }, className)}>
        <div className={MEDIA_SIZE_CLASS[sizeKey]}>
          {hasRenderableMedia && (
            // No border on the media itself: `border` takes its colour from the
            // base `* { @apply border-border }` reset, and --border is a light
            // value in both themes (light oklch(0.922), dark white at 10%), so
            // it drew a thin white line around every rich-text image. This is
            // the only media call site in the app that framed the asset — the
            // radius alone matches the rest.
            <div data-reveal="media">
              <Media
                imgClassName={mediaClassName}
                resource={mediaDoc}
                size={sizeHints[sizeKey]}
                src={staticImage}
                videoClassName={mediaClassName}
              />
            </div>
          )}
          {caption && (
            <div
              className={cn(
                'mt-6',
                {
                  container: bleed ? enableGutter : !disableInnerContainer,
                },
                captionClassName,
              )}
              data-reveal
            >
              <RichText data={caption} enableGutter={false} />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
