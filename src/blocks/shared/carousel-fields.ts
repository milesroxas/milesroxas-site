import type { ArrayField, CheckboxField, Condition, SelectField } from 'payload'
import type { DeckStyle } from '@/blocks/Carousel/visual-state'

/**
 * The deck's fields, stated once for every block that holds a carousel:
 * the Carousel block, Carousel split and Carousel tabs all render the same
 * deck component (`blocks/Carousel/Component.tsx`), so they must all store
 * the same rows. A block that declared its own slide array would drift from
 * the component the moment either changed.
 *
 * Each factory takes only the admin description, because that is the one
 * thing a shell genuinely says differently: a deck in a page column, a deck
 * in a grid cell and a deck in a tab panel do not explain their arrow gutter
 * the same way. Everything with a schema consequence is fixed here.
 */

/** Slides: an upload and an optional caption, two rows minimum. */
export const carouselSlidesField = (): ArrayField => ({
  name: 'slides',
  type: 'array',
  required: true,
  minRows: 2,
  labels: { singular: 'Slide', plural: 'Slides' },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional. Renders below the slide.',
      },
    },
  ],
})

/** How many slides the deck shows at once from `md` up. */
export const slideSizeField = (description: string, condition?: Condition): SelectField => ({
  name: 'slideSize',
  type: 'select',
  defaultValue: 'full',
  options: [
    { label: 'Full width', value: 'full' },
    { label: 'Half', value: 'half' },
    { label: 'One third', value: 'third' },
  ],
  admin: { condition, description },
})

/**
 * How the deck poses its slides (see `blocks/Carousel/visual-state.ts`):
 * a centred coverflow row, or a pile of boards with the next ones fanned
 * behind the top one. A stack always shows one board, so a block that offers
 * it hides its slide size behind `isCoverflow`.
 */
export const deckStyleField = (): SelectField => ({
  name: 'deckStyle',
  type: 'select',
  defaultValue: 'coverflow',
  options: [
    { label: 'Coverflow', value: 'coverflow' },
    { label: 'Stack', value: 'stack' },
  ] satisfies Array<{ label: string; value: DeckStyle }>,
  admin: {
    description:
      'Coverflow centres the slide with its neighbours either side. Stack piles the next slides behind the current one, like boards in a presentation.',
  },
})

export const isCoverflow: Condition = (_, siblingData) => siblingData?.deckStyle !== 'stack'

/** Previous/next buttons. Off by default: the deck is draggable everywhere. */
export const showArrowsField = (description: string): CheckboxField => ({
  name: 'showArrows',
  type: 'checkbox',
  defaultValue: false,
  label: 'Show arrows',
  admin: { description },
})
