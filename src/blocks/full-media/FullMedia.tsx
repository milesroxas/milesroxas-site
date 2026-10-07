import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { VisualCell } from '@/blocks/shared/cells'
import { eyebrowClassName, typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { Visual as VisualValue } from '@/features/immersive/visual'
import type { FullMediaBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Presentational full-media layout: media above an optional content row on the
 * composition grid. Collection-agnostic, the caller resolves `content` from
 * whichever source applies (inline body or canonical story content) and passes
 * it in.
 *
 * Media is the only requirement: with `showContent` off, or with no eyebrow,
 * heading or body authored, the block renders the media on its own.
 *
 * Full-width media is 16:9 below `md` and 21:9 from `md` up, edge to edge,
 * with the content row re-entering the page column. Contained media shares the
 * grid and spans all eight columns at the editor-chosen aspect ratio.
 *
 * Content row placement: heading cluster in columns 1-3 and body in columns
 * 4-6; columns 4-5 and 6-8 when `contentPosition` is `right`. With no eyebrow or
 * heading the body sits on the outer edge: columns 1-3 left, 6-8 right. Below
 * `md` the cells stack in one column.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
type FullMediaBlockFields = Pick<
  FullMediaBlock,
  | 'aspectRatio'
  | 'contentPosition'
  | 'eyebrow'
  | 'heading'
  | 'showContent'
  | 'textSize'
  | 'theme'
  | 'width'
>

const FullMediaContent = ({
  block,
  content,
}: {
  block: FullMediaBlockFields
  content: DefaultTypedEditorState | null | undefined
}) => {
  const contentRight = block.contentPosition === 'right'
  const hasTitle = Boolean(block.eyebrow || block.heading)
  const type = typeScale(block.textSize)
  return (
    <>
      {hasTitle && (
        <div
          className={cn(
            'text-stack',
            contentRight ? 'md:col-span-2 md:col-start-4' : 'md:col-span-3',
          )}
          data-reveal
        >
          {block.eyebrow && <p className={eyebrowClassName}>{block.eyebrow}</p>}
          {block.heading && <h2 className={cn(type.heading, 'text-balance')}>{block.heading}</h2>}
        </div>
      )}
      {content && (
        <div
          className={cn(
            'md:col-span-3',
            contentRight ? 'md:col-start-6' : hasTitle ? 'md:col-start-4' : 'md:col-start-1',
          )}
          data-reveal
        >
          <RichText className={type.body} data={content} enableGutter={false} enableProse={false} />
        </div>
      )}
    </>
  )
}

export const FullMedia = ({
  bare = false,
  block,
  content,
  visual,
}: {
  bare?: boolean
  block: FullMediaBlockFields
  content: DefaultTypedEditorState | null | undefined
  visual: VisualValue
}) => {
  const showContent =
    block.showContent !== false && Boolean(block.eyebrow || block.heading || content)
  const contained = block.width === 'contained'
  const mediaFrame = (
    <VisualCell
      className={cn(
        'relative w-full overflow-hidden bg-muted',
        contained ? ASPECT_RATIO_CLASS[block.aspectRatio ?? '16-9'] : 'aspect-16/9 md:aspect-21/9',
        contained && 'rounded-lg md:col-span-8',
      )}
      size="100vw"
      visual={visual}
    />
  )
  const contentCells = showContent ? <FullMediaContent block={block} content={content} /> : null
  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      {contained ? (
        <Container>
          <BlockGrid>
            {mediaFrame}
            {contentCells}
          </BlockGrid>
        </Container>
      ) : (
        <div className="flex flex-col gap-grid">
          {mediaFrame}
          {contentCells && (
            <Container>
              <BlockGrid>{contentCells}</BlockGrid>
            </Container>
          )}
        </div>
      )}
    </Section>
  )
}
