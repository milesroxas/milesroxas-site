import type { Block } from 'payload'
import {
  carouselSlidesField,
  showArrowsField,
  slideSizeField,
} from '@/blocks/shared/carousel-fields'
import { designFields, themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'

export const Carousel: Block = {
  slug: 'carousel',
  admin: { group: BLOCK_GROUPS.interactive },
  interfaceName: 'CarouselBlock',
  labels: { singular: 'Carousel', plural: 'Carousels' },
  fields: [
    carouselSlidesField(),
    designFields([
      {
        name: 'width',
        type: 'select',
        defaultValue: 'contained',
        options: [
          { label: 'Contained', value: 'contained' },
          { label: 'Full width', value: 'full-width' },
        ],
        admin: {
          description: 'Full width runs edge to edge of the browser window.',
        },
      },
      showArrowsField(
        'Previous/next buttons. Contained places them beside the slides; full width overlays them on the slides.',
      ),
      slideSizeField(
        'Slides visible at once from tablet up. Phones always show one slide plus a sliver of its neighbours, whichever size is picked.',
      ),
      themeField(),
    ]),
  ],
}
