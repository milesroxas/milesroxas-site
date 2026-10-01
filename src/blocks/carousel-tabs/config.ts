import type { Block } from 'payload'
import {
  carouselSlidesField,
  showArrowsField,
  slideSizeField,
} from '@/blocks/shared/carousel-fields'
import { tabSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { contentLexical } from '@/fields/contentLexical'

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
 * Laid out as a split, the arrangement the legacy Tab slider used and the
 * one Split and Split narrow share: the copy stack (eyebrow, heading, body)
 * in the narrow column, the trigger strip and the deck in the wide one. The
 * block therefore owns its heading rather than sitting under a Standard: a
 * Standard is a band of its own with the run's rhythm around it, which left
 * the strip stranded a screen away from the words that introduce it.
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
    { name: 'eyebrow', type: 'text', admin: { description: 'Short kicker above the heading.' } },
    { name: 'heading', type: 'text' },
    {
      name: 'body',
      type: 'richText',
      editor: contentLexical,
      admin: { description: 'The copy column beside the tabs.' },
    },
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
