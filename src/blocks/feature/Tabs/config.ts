import type { Block } from 'payload'
import { tabSizeField, themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { blockVisualSlotFields } from '@/fields/visual'

export const FeatureTabs: Block = {
  slug: 'featureTabs',
  admin: { group: BLOCK_GROUPS.interactive },
  interfaceName: 'FeatureTabsBlock',
  labels: { singular: 'Tabs', plural: 'Tabs' },
  fields: [
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
        {
          name: 'heading',
          type: 'text',
          required: true,
          admin: { description: 'Lead statement for this tab.' },
        },
        {
          name: 'description',
          type: 'richText',
          admin: { description: 'Tab body copy. Leave empty to pull the source.' },
        },
        {
          name: 'subheading',
          type: 'text',
          label: 'List heading',
          defaultValue: 'Included',
        },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Item', plural: 'Items' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        // Each tab is its own visual slot (upload or Streak Field), the same
        // slot the heroes and media blocks carry.
        ...blockVisualSlotFields({
          name: 'media',
          type: 'upload',
          relationTo: 'media',
        }),
        {
          name: 'caption',
          type: 'textarea',
          label: 'Media callout',
          admin: { description: 'Short note shown as a card over the media.' },
        },
      ],
    },
    tabSizeField(),
    themeField(),
  ],
}
