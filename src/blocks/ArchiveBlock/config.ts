import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { headingLexical } from '@/fields/headingLexical'

export const Archive: Block = {
  slug: 'archive',
  admin: { group: BLOCK_GROUPS.lists },
  interfaceName: 'ArchiveBlock',
  fields: [
    themeField(),
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'card',
      options: [
        {
          label: 'Card',
          value: 'card',
        },
        {
          label: 'Featured',
          value: 'featured',
        },
      ],
    },
    {
      name: 'introContent',
      type: 'richText',
      editor: headingLexical(),
      label: 'Intro Content',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: 'Collections To Show',
      options: [
        {
          label: 'Posts',
          value: 'posts',
        },
        {
          label: 'Works',
          value: 'works',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
        description: 'The order of items here will be preserved in the display',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['posts', 'works'],
    },
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}
