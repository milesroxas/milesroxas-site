import type { Block } from 'payload'
import { designFields, textSizeField, themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'

export const FeatureImageStatement: Block = {
  slug: 'featureImageStatement',
  admin: { group: BLOCK_GROUPS.media },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_image_statement`,
  interfaceName: 'FeatureImageStatementBlock',
  labels: { singular: 'Statement', plural: 'Statements' },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Statement',
      admin: { description: 'Set large beneath the image.' },
    },
    designFields([
      textSizeField(),
      {
        name: 'textPosition',
        type: 'select',
        label: 'Layout',
        defaultValue: 'left',
        options: ['left', 'right'],
        admin: { description: 'Which edge the statement aligns to beneath the image.' },
      },
      {
        name: 'imageWidth',
        type: 'select',
        defaultValue: 'contained',
        options: ['contained', 'full'],
        admin: {
          description: 'Contained keeps the image in the site container; full bleeds edge to edge.',
        },
      },
      {
        name: 'aspectRatio',
        type: 'select',
        defaultValue: 'responsive',
        options: [
          { label: 'Responsive (3:2, 21:9 from md)', value: 'responsive' },
          { label: '16:9', value: '16-9' },
          { label: '3:2', value: '3-2' },
          { label: '21:9', value: '21-9' },
        ],
        admin: {
          description:
            'Crop for the image, at both widths. Responsive keeps the taller small-screen crop that widens to 21:9 from md up.',
        },
      },
      themeField(),
    ]),
  ],
}
