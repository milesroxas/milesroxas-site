import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { eyebrowClassName, typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { CarouselSplitBlock as CarouselSplitBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Presentational split on the composition grid: the carousel deck beside a
 * narrow copy stack. Same tracks as Split narrow — deck 5 columns at `md` and
 * 6 from `lg`, copy the rest (3, then 2) — so a deck and a single image read
 * as the same layout down the page. Mirrored when `carouselPosition` is left.
 *
 * Stacked below `md` (the deck always first, whichever side it takes above),
 * with both cells pinned to `md:row-start-1`: with the deck on the right its
 * cell precedes the copy in source order but sits in later columns, and
 * auto-placement would push the copy to the next row.
 *
 * The deck is the Carousel block rendered `bare` with its gutter off: the
 * grid cell is its column, so it must not open a band or a container of its
 * own. Its slide sizes are fractions of whatever column it lands in, so
 * `slideSize` means the same thing here as it does at full width.
 *
 * No `data-reveal` markers: the deck writes its own per-frame transforms on
 * the slides (see Carousel/use-carousel-effects), so the block takes the CSS
 * block reveal from its renderer as the Carousel block does, and the two move
 * alike. That is also why it stays out of `blockRevealVariants`.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the Section block paints the band).
 */
export const CarouselSplit = ({
  bare = false,
  block,
  content,
}: {
  bare?: boolean
  block: Pick<
    CarouselSplitBlockData,
    | 'carouselPosition'
    | 'eyebrow'
    | 'heading'
    | 'showArrows'
    | 'slides'
    | 'slideSize'
    | 'textSize'
    | 'theme'
  >
  content: DefaultTypedEditorState | null | undefined
}) => {
  const deckLeft = block.carouselPosition === 'left'
  const type = typeScale(block.textSize)
  const inner = (
    <Container>
      <BlockGrid>
        <div
          className={cn(
            'w-full self-start md:col-span-5 md:row-start-1 lg:col-span-6',
            !deckLeft && 'md:col-start-4 lg:col-start-3',
          )}
        >
          <CarouselBlock
            bare
            blockType="carousel"
            enableGutter={false}
            showArrows={block.showArrows}
            slideSize={block.slideSize}
            slides={block.slides}
            width="contained"
          />
        </div>
        <div
          className={cn(
            'text-stack md:col-span-3 md:row-start-1 lg:col-span-2',
            deckLeft && 'md:col-start-6 lg:col-start-7',
          )}
        >
          {block.eyebrow && <p className={eyebrowClassName}>{block.eyebrow}</p>}
          {block.heading && <h2 className={cn(type.heading, 'text-balance')}>{block.heading}</h2>}
          {content && (
            <RichText
              className={type.body}
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          )}
        </div>
      </BlockGrid>
    </Container>
  )
  if (bare) return inner
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
