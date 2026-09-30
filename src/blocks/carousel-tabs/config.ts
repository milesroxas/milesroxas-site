import type { Block } from 'payload'
import {
  carouselSlidesField,
  showArrowsField,
  slideSizeField,
} from '@/blocks/shared/carousel-fields'
import { tabSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * A deck per tab: the reader picks a direction and swipes through only that
 * direction's slides. The shape every round of a design presentation on this
 * site is written in (the legacy Tab slider: "Spark / Rounded / Velocity",
 * "Ambitious / Bold / Intelligent"), and the one the Phase 6 composer had
 * nowhere to put, so it stacked every tab's deck instead and turned three
 * choices into one long scroll.
 *
 * Tabs holds one media per tab and a column of copy beside it; this holds a
 * deck and nothing else, so the two are different blocks rather than one with
 * a mode. They share the trigger strip (`shared/tabs.tsx`) and this shares
 * its deck with the Carousel block (`shared/carousel-fields.ts` and
 * `blocks/Carousel/Component.tsx`), so a reader meets one tab strip and one
 * carousel across the site.
 *
 * `slideSize` and `showArrows` are set once for the block, not per tab: the
 * tabs are alternatives to each other, and a deck that changed size when the
 * reader switched would read as a different component.
 *
 * Not in sas-site: this site's own block.
 */
export const CarouselTabs: Block = {
  slug: 'carouselTabs',
  admin: { group: BLOCK_GROUPS.interactive },
  interfaceName: 'CarouselTabsBlock',
  labels: { singular: 'Carousel tabs', plural: 'Carousel tabs' },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 8,
      labels: { singular: 'Tab', plural: 'Tabs' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', label: 'Tab label', required: true },
        carouselSlidesField(),
      ],
    },
    slideSizeField(
      'Slides visible at once inside a tab panel, from tablet up. Phones always show one slide plus a sliver of its neighbours.',
    ),
    showArrowsField(
      'Previous/next buttons beside the slides, in every tab. The panel is the page column, so they sit in its outer gutter.',
    ),
    tabSizeField(),
    themeField(),
  ],
}
