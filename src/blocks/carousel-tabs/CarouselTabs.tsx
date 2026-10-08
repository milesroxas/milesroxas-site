'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useMemo, useState } from 'react'
import { CarouselBlock, sharedDeckFrame } from '@/blocks/Carousel/Component'
import { CopyStack } from '@/blocks/shared/cells'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { TabbedRoot } from '@/blocks/shared/tabs'
import { Container } from '@/components/Container'
import type { CarouselApi } from '@/components/ui/carousel'
import type { CarouselTabsBlock as CarouselTabsBlockData } from '@/payload-types'
import { DeckControls } from './DeckControls'
import { DeckPanels } from './DeckPanels'

type Tab = NonNullable<CarouselTabsBlockData['tabs']>[number]

/**
 * Presentational tabbed decks on the composition grid, laid out as an anchored
 * panel from `lg`: the deck in columns 4-8, and columns 1-3 stretched to the
 * deck's height with the copy pinned to its top edge and the controls (the
 * tab index, then the readout; see ./DeckControls) pinned to its bottom edge. Both ends of the copy
 * column answer to an edge of the deck, so the column reads as the deck's
 * caption and transport rather than copy that happens to sit beside it.
 *
 * The grid carries the pin: two rows (`auto` then `1fr`), the deck spanning
 * both and sitting on their end edge, the controls at the end of the second.
 * A deck taller than the copy grows the second row and the controls ride its
 * bottom; copy taller than the deck pushes the deck down to the controls, so
 * the bottom edges always meet.
 *
 * Stacked below `lg` (copy, controls, deck): three columns of a tablet page
 * cannot hold a heading beside a deck, and directly above the deck the
 * controls read as its toolbar. The grid mounts its eight columns at `md`, so
 * every cell spans them explicitly there; left to auto-place, each would take
 * a single column.
 *
 * The Radix root wraps the whole grid because the strip and the panels sit in
 * different cells. Each panel is the Carousel block's component rendered
 * `bare` with its gutter and arrows off, because this shell owns the band,
 * the column and the transport. One deck is live at rest (two only while a
 * swap runs, see ./DeckPanels), and the active one's embla api is the one
 * the readout drives. Every deck takes one frame (`sharedDeckFrame`), sized
 * for the tallest any tab draws, so switching tabs never moves the page.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the Section block paints the band).
 *
 * A client component, as the tabs block is: `renderPanel` is a function, and
 * a function cannot cross the server/client boundary into `DeckPanels`.
 */

export const CarouselTabs = ({
  bare = false,
  block,
  content,
}: {
  bare?: boolean
  block: Pick<
    CarouselTabsBlockData,
    'deckStyle' | 'eyebrow' | 'heading' | 'slideSize' | 'tabs' | 'tabSize' | 'textSize' | 'theme'
  >
  content?: DefaultTypedEditorState | null
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [pending, setPending] = useState(false)
  const tabs = (block.tabs ?? []).filter((tab) => tab.slides?.length)
  const frame = useMemo(
    () =>
      sharedDeckFrame(
        (block.tabs ?? []).map((tab) => tab.slides),
        block.deckStyle,
      ),
    [block.tabs, block.deckStyle],
  )
  if (tabs.length === 0) return null

  return (
    <Section bare={bare} spacing="loose" theme={block.theme}>
      {/* The stack's track is unclipped (the leaving board must cross the copy
          column), so the page column clips it sideways or embla's off-slot
          slides would widen the page. */}
      <Container className="overflow-x-clip">
        <TabbedRoot orientation="vertical" rows={tabs}>
          <BlockGrid className="lg:grid-rows-[auto_1fr]">
            <div className="text-stack md:col-span-6 lg:col-span-3 lg:row-start-1">
              <CopyStack
                content={content}
                eyebrow={block.eyebrow}
                heading={block.heading}
                textSize={block.textSize}
              />
            </div>
            <div className="md:col-span-8 lg:col-span-3 lg:row-start-2 lg:self-end">
              <DeckControls api={api} pending={pending} rows={tabs} tabSize={block.tabSize} />
            </div>
            <DeckPanels<Tab>
              className="md:col-span-8 lg:col-span-5 lg:col-start-4 lg:row-span-2 lg:row-start-1 lg:self-end"
              onPendingChange={setPending}
              renderPanel={(tab, active) => (
                <CarouselBlock
                  bare
                  blockType="carousel"
                  deckStyle={block.deckStyle}
                  theme={block.theme}
                  enableGutter={false}
                  frame={frame}
                  onApi={active ? setApi : undefined}
                  showArrows={false}
                  slideSize={block.slideSize}
                  slides={tab.slides}
                  width="contained"
                />
              )}
              rows={tabs}
            />
          </BlockGrid>
        </TabbedRoot>
      </Container>
    </Section>
  )
}
