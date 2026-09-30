'use client'

import { CarouselBlock } from '@/blocks/Carousel/Component'
import { Section } from '@/blocks/shared/section'
import { TabbedPanels } from '@/blocks/shared/tabs'
import { Container } from '@/components/Container'
import type { CarouselTabsBlock as CarouselTabsBlockData } from '@/payload-types'

type Tab = NonNullable<CarouselTabsBlockData['tabs']>[number]

/**
 * Presentational tabbed decks: the shared trigger strip
 * (`shared/tabs.tsx`) over one deck per tab.
 *
 * Each panel is the Carousel block's component rendered `bare` with its
 * gutter off, because the shell already owns the band and the page column.
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
}: {
  bare?: boolean
  block: Pick<CarouselTabsBlockData, 'showArrows' | 'slideSize' | 'tabs' | 'tabSize' | 'theme'>
}) => {
  const tabs = (block.tabs ?? []).filter((tab) => tab.slides?.length)
  if (tabs.length === 0) return null

  const inner = (
    <Container>
      <TabbedPanels<Tab>
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
    </Container>
  )
  if (bare) return inner
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
