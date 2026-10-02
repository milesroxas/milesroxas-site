import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { headingLexical } from '@/fields/headingLexical'
import { sectionSpacing } from '@/fields/sectionSpacing'

export const FormBlock: Block = {
  slug: 'formBlock',
  admin: { group: BLOCK_GROUPS.forms },
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    sectionSpacing(),
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introAlign',
      type: 'select',
      label: 'Intro alignment',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: headingLexical(),
      label: 'Intro Content',
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
