import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { headingLexical } from '@/fields/headingLexical'

export const CallOut: Block = {
  slug: 'callout',
  admin: { group: BLOCK_GROUPS.statements },
  interfaceName: 'CallOutBlock',
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: headingLexical(),
      label: false,
    },
  ],
  labels: {
    plural: 'Call Outs',
    singular: 'Call Out',
  },
}
