import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type {
  Media as MediaDoc,
  SplitImageOffsetBlock as SplitImageOffsetBlockType,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { MediaCell } from '../shared/cells'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'
import { typeScale } from '../shared/typography'

/**
 * A large 5:4 figure and a narrower column on the composition grid: the
 * figure spans 5 columns, the column holding the 3:2 figure and its caption
 * spans 3 (the same 5:3 split as Image pair), with `captionPosition` picking
 * the side. The column is one cell, so the small figure and the caption
 * travel together, top-aligned, a grid gap apart. Below `md` the grid
 * collapses: the small figure and caption sit at 4/5 width to keep the
 * offset's trailing air.
 *
 * It used to pad to the page gutter and run to the viewport edge on its own
 * fr grid, which left it starting left of every other block's column.
 */
export const SplitImageOffset = ({
  bare = false,
  block,
  content,
  large,
  small,
}: {
  bare?: boolean
  block: Pick<SplitImageOffsetBlockType, 'captionPosition' | 'heading' | 'textSize' | 'theme'>
  content: DefaultTypedEditorState | null | undefined
  large: MediaDoc
  small: MediaDoc
}) => {
  if (!content) return null
  const captionLeft = block.captionPosition === 'left'
  const type = typeScale(block.textSize)
  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      <Container>
        <BlockGrid>
          <MediaCell
            className={cn(
              'relative aspect-5/4 w-full overflow-hidden rounded-lg bg-muted md:col-span-5 md:row-start-1 md:self-start',
              captionLeft ? 'md:col-start-4' : 'md:col-start-1',
            )}
            resource={large}
            size="(max-width: 768px) 100vw, 62vw"
          />
          <div
            className={cn(
              'flex flex-col gap-grid md:col-span-3 md:row-start-1 md:self-start',
              captionLeft ? 'md:col-start-1' : 'md:col-start-6',
            )}
          >
            <MediaCell
              className="relative aspect-3/2 w-4/5 overflow-hidden rounded-lg bg-muted md:w-full"
              resource={small}
              size="(max-width: 768px) 80vw, 37vw"
            />
            <div className="w-4/5 max-w-80 text-stack md:w-full md:max-w-none" data-reveal>
              {block.heading && (
                <h2 className={cn(type.heading, 'text-balance')}>{block.heading}</h2>
              )}
              <RichText
                className={type.body}
                data={content}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}
