import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { ImagePairBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { MediaCell } from '../shared/cells'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'
import { typeScale } from '../shared/typography'

/**
 * Two figures side by side on the composition grid: the 4:5 portrait spans 3
 * columns, the landscape 5. From `md` the landscape drops its ratio and
 * stretches to the portrait's row height (about 1.37:1, the exact ratio drifts
 * with the fixed gap), so both always share a height; below `md` it is 16:10.
 * `portraitPosition` picks the side. Text lands in row 2 spanning 3 columns
 * from the start of whichever figure `textPosition` names; below `md` the grid
 * collapses and text always stacks last.
 */
export const ImagePair = ({
  bare = false,
  block,
  content,
  landscape,
  portrait,
}: {
  bare?: boolean
  block: Pick<
    ImagePairBlock,
    'heading' | 'portraitPosition' | 'textPosition' | 'textSize' | 'theme'
  >
  content: DefaultTypedEditorState | null | undefined
  landscape: MediaDoc
  portrait: MediaDoc
}) => {
  if (!content) return null
  const portraitRight = block.portraitPosition === 'right'
  const textUnderLandscape = block.textPosition === 'under-landscape'
  const type = typeScale(block.textSize)
  const landscapeStart = portraitRight ? 'md:col-start-1' : 'md:col-start-4'
  const portraitStart = portraitRight ? 'md:col-start-6' : 'md:col-start-1'
  const portraitFigure = (
    <MediaCell
      className={cn(
        'relative aspect-4/5 w-full overflow-hidden rounded-lg bg-muted md:col-span-3 md:row-start-1',
        portraitStart,
      )}
      resource={portrait}
      size="(max-width: 768px) 100vw, 33vw"
    />
  )
  const landscapeFigure = (
    <MediaCell
      className={cn(
        'relative aspect-16/10 w-full overflow-hidden rounded-lg bg-muted md:col-span-5 md:row-start-1 md:aspect-auto',
        landscapeStart,
      )}
      resource={landscape}
      size="(max-width: 768px) 100vw, 66vw"
    />
  )
  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      <Container>
        <BlockGrid>
          {portraitRight ? landscapeFigure : portraitFigure}
          {portraitRight ? portraitFigure : landscapeFigure}
          <div
            className={cn(
              'text-stack md:col-span-3 md:row-start-2',
              textUnderLandscape ? landscapeStart : portraitStart,
            )}
            data-reveal
          >
            {block.heading && <h2 className={cn(type.heading, 'text-balance')}>{block.heading}</h2>}
            <RichText
              className={type.body}
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}
