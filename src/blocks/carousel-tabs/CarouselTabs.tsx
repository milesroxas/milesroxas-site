'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { useState } from 'react'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { CopyStack } from '@/blocks/shared/cells'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { TabbedRoot, TabPanels } from '@/blocks/shared/tabs'
import { Container } from '@/components/Container'
import type { CarouselApi } from '@/components/ui/carousel'
import type { CarouselTabsBlock as CarouselTabsBlockData } from '@/payload-types'
import { DeckControls } from './DeckControls'

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
 * the column and the transport. Radix mounts only the active panel, so one
 * deck is ever live, and its embla api is the one the readout drives.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the Section block paints the band).
 *
 * A client component, as the tabs block is: `renderPanel` is a function, and
 * a function cannot cross the server/client boundary into `TabPanels`.
 */
/**
 * A deck arriving on a tab change: a short rise out of a slight defocus, so
 * the swap reads as the same deck changing rather than a cut. Short because
 * a reader flips tabs back and forth; the outgoing deck simply goes.
 */
const PANEL_ENTRANCE =
  'transition-[opacity,translate,filter] duration-300 ease-(--ease-out-quint) starting:translate-y-2 starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none'

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
  const tabs = (block.tabs ?? []).filter((tab) => tab.slides?.length)
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
              <DeckControls api={api} rows={tabs} tabSize={block.tabSize} />
            </div>
            <TabPanels<Tab>
              className="md:col-span-8 lg:col-span-5 lg:col-start-4 lg:row-span-2 lg:row-start-1 lg:self-end"
              panelClassName={PANEL_ENTRANCE}
              renderPanel={(tab) => (
                <CarouselBlock
                  bare
                  blockType="carousel"
                  deckStyle={block.deckStyle}
                  theme={block.theme}
                  enableGutter={false}
                  onApi={setApi}
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
