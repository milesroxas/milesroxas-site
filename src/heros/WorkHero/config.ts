import type { Field } from 'payload'

import { headingLexical } from '@/fields/headingLexical'

/**
 * The case study opening (`WorkHero`). Works have one hero layout, so there
 * is no type to pick: the title, client and facts come from the work itself,
 * and this group holds the picture and the summary. Both keep the names they
 * had under the shared `heroField`, so every work's media and summary carry
 * over without a data move.
 */
export const workHeroField = (): Field => ({
  name: 'hero',
  type: 'group',
  label: false,
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The picture centered in the opening. A work card opens into it, so use the card image.',
      },
    },
    {
      name: 'richText',
      type: 'richText',
      editor: headingLexical(),
      label: 'Summary',
      admin: {
        description:
          'One or two sentences on the work. Cards and search show it; the hero does not.',
      },
    },
  ],
})
