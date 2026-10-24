import type { Field } from 'payload'

/**
 * The home opening (`HomeHero`), the Home global's only hero. The heading
 * comes from Site Info and the word strips are fixed, so this group holds the
 * portrait alone. It keeps the `hero.media` name the shared `heroField` gave
 * it, so the home page's portrait carries over without a remap.
 */
export const homeHeroField = (): Field => ({
  name: 'hero',
  type: 'group',
  label: false,
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'The portrait between the two word strips: a 9:16 image or video, cropped to fill the frame.',
      },
    },
  ],
})
