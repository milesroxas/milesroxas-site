import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { headingLexical } from '@/fields/headingLexical'

import { linkGroup } from '../../fields/linkGroup'

export const CallToAction: Block = {
  slug: 'cta',
  admin: { group: BLOCK_GROUPS.forms },
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: headingLexical(),
      label: false,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
  labels: {
    plural: 'Calls to Action',
    singular: 'Call to Action',
  },
}
