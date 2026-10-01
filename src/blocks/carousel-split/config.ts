import type { Block } from 'payload'
import {
  carouselSlidesField,
  showArrowsField,
  slideSizeField,
} from '@/blocks/shared/carousel-fields'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { contentLexical } from '@/fields/contentLexical'

/**
 * A carousel beside its copy: the deck in the wide column, a narrow stack of
 * eyebrow, heading and body in the other. The Split narrow of the Interactive
 * family — Split narrow holds one image, this holds a deck — and the shape the
 * legacy Columns block reached for when it put a Slider column next to a
 * Section heading column (the live `identity-for-higher-stakes-work`
 * "Differentiator" band). Without it a carousel can only sit under its copy.
 *
 * The deck itself is the Carousel block's component rendered `bare`, so the
 * slide pose, the velocity RGB split and the poster dissolve are the same
 * code in both blocks; only the shell differs. `slides` therefore mirrors the
 * Carousel's slide fields exactly.
 *
 * Not in sas-site: this site's own block, so it never blocks a later port.
 */
export const CarouselSplit: Block = {
  slug: 'carouselSplit',
  admin: { group: BLOCK_GROUPS.mediaContent },
  interfaceName: 'CarouselSplitBlock',
  labels: { singular: 'Carousel split', plural: 'Carousel splits' },
  fields: [
    { name: 'eyebrow', type: 'text', admin: { description: 'Short kicker above the heading.' } },
    { name: 'heading', type: 'text' },
    {
      name: 'body',
      type: 'richText',
      editor: contentLexical,
      admin: { description: 'The copy column beside the deck.' },
    },
    carouselSlidesField(),
    {
      name: 'carouselPosition',
      type: 'select',
      label: 'Layout',
      defaultValue: 'right',
      options: ['left', 'right'],
      admin: { description: 'Arrange the deck on the left or the right of the copy.' },
    },
    slideSizeField(
      'Slides visible at once within the deck column, from tablet up. Phones always show one slide plus a sliver of its neighbours.',
    ),
    showArrowsField(
      'Previous/next buttons beside the slides. They take an outer gutter from the deck column, which is already the narrower half of a split.',
    ),
    themeField(),
  ],
}
