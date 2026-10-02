import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Media } from '@/components/Media'
import type { Props as MediaProps } from '@/components/Media/types'
import RichText from '@/components/RichText'
import { Visual } from '@/components/Visual'
import type { Visual as VisualValue } from '@/features/immersive/visual'
import { cn } from '@/utilities/ui'
import { eyebrowClassName, type TextSize, typeScale } from './typography'

/**
 * The eyebrow → heading → body run a split block sets inside its `text-stack`
 * cell. `reveal` marks each piece, the body through a wrapper, for a shell
 * that animates `data-reveal`.
 */
export const CopyStack = ({
  content,
  eyebrow,
  heading,
  reveal = false,
  textSize,
}: {
  content: DefaultTypedEditorState | null | undefined
  eyebrow?: string | null
  heading?: string | null
  reveal?: boolean
  textSize: TextSize | null | undefined
}) => {
  const type = typeScale(textSize)
  const revealMark = reveal || undefined
  const body = content && (
    <RichText className={type.body} data={content} enableGutter={false} enableProse={false} />
  )
  return (
    <>
      {eyebrow && (
        <p className={eyebrowClassName} data-reveal={revealMark}>
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2 className={cn(type.heading, 'text-balance')} data-reveal={revealMark}>
          {heading}
        </h2>
      )}
      {body && (reveal ? <div data-reveal>{body}</div> : body)}
    </>
  )
}

/** A grid cell the visual fills, cropped to cover, marked as media for a reveal shell. */
export const VisualCell = ({
  className,
  size,
  visual,
}: {
  className: string
  size: string
  visual: VisualValue
}) => (
  <div className={className} data-reveal="media">
    <Visual
      fill
      htmlElement={null}
      imgClassName="object-cover"
      placement="block"
      size={size}
      visual={visual}
    />
  </div>
)

/** A grid cell the media fills, cropped to cover, marked as media for a reveal shell. */
export const MediaCell = ({
  className,
  resource,
  size,
}: {
  className: string
  resource: MediaProps['resource']
  size: string
}) => (
  <div className={className} data-reveal="media">
    <Media fill htmlElement={null} imgClassName="object-cover" resource={resource} size={size} />
  </div>
)
