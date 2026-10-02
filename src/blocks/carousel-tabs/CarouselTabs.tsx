'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { CopyStack } from '@/blocks/shared/cells'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { TabbedPanels } from '@/blocks/shared/tabs'
import { Container } from '@/components/Container'
import type { CarouselTabsBlock as CarouselTabsBlockData } from '@/payload-types'

type Tab = NonNullable<CarouselTabsBlockData['tabs']>[number]

/**
 * Presentational tabbed decks on the composition grid: the copy stack in
 * columns 1-3 from `lg`, the trigger strip and the deck in 4-8. Same split as
 * Tabs' own panel, so the two tabbed blocks read as one family, and the same
 * arrangement the legacy Tab slider used, so a converted document keeps its
 * shape.
 *
 * Stacked below `lg` (copy first): three columns of a tablet page cannot hold
 * a heading beside a deck. Both cells pin `lg:row-start-1` so the strip's
 * first row lines up with the top of the copy.
 *
 * The strip aligns to the start rather than centring: it shares a row with
 * the copy column here, and a centred strip would line up with nothing.
 *
 * Each panel is the Carousel block's component rendered `bare` with its
 * gutter off, because this shell already owns the band and the column.
 * Radix mounts only the active panel, so one deck is ever live: the others
 * hold no embla instance and run no per-frame writer.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the Section block paints the band).
 *
 * A client component, as the tabs block is: `renderPanel` is a function, and
 * a function cannot cross the server/client boundary into `TabbedPanels`.
 */
export const CarouselTabs = ({
  bare = false,
  block,
  content,
}: {
  bare?: boolean
  block: Pick<
    CarouselTabsBlockData,
    'eyebrow' | 'heading' | 'showArrows' | 'slideSize' | 'tabs' | 'tabSize' | 'textSize' | 'theme'
  >
  content?: DefaultTypedEditorState | null
}) => {
  const tabs = (block.tabs ?? []).filter((tab) => tab.slides?.length)
  if (tabs.length === 0) return null

  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      <Container>
        <BlockGrid>
          <div className="text-stack lg:col-span-3 lg:row-start-1">
            <CopyStack
              content={content}
              eyebrow={block.eyebrow}
              heading={block.heading}
              textSize={block.textSize}
            />
          </div>
          <div className="lg:col-span-5 lg:col-start-4 lg:row-start-1">
            <TabbedPanels<Tab>
              align="start"
              ariaLabel="Carousel tabs"
              renderPanel={(tab) => (
                <CarouselBlock
                  bare
                  blockType="carousel"
                  enableGutter={false}
                  showArrows={block.showArrows}
                  slideSize={block.slideSize}
                  slides={tab.slides}
                  width="contained"
                />
              )}
              rows={tabs}
              tabSize={block.tabSize}
            />
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}
