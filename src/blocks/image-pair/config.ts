import type { Block } from 'payload'
import { designFields, textSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Two images side by side: a 4:5 portrait on 3 columns beside a landscape on 5
 * that stretches to the portrait's height. Text sits under one of the images
 * and is sized to that column: compact under the portrait, large under the
 * landscape.
 *
 * Self-contained by default (authors the body inline), so it can be dropped
 * into any collection's `blocks` field. On Work and Lab Pages the `source`
 * select can pull canonical story content instead.
 */
export const ImagePair: Block = {
  slug: 'imagePair',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_image_pair`,
  interfaceName: 'ImagePairBlock',
  labels: { singular: 'Pair', plural: 'Pairs' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description:
          'Shown when source is "Custom", or as a Work or Lab Page override for canonical content.',
      },
    },
    {
      name: 'portraitMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 4:5.' },
    },
    {
      name: 'landscapeMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Matches the portrait height: about 1.37:1 beside it (export 1736 × 1270), 16:10 on phones.',
      },
    },
    designFields([
      textSizeField(),
      {
        name: 'portraitPosition',
        type: 'select',
        label: 'Layout: primary media',
        defaultValue: 'left',
        options: ['left', 'right'],
        admin: {
          description:
            'Arrange the portrait on the left or the right; the landscape fills the other column. On small screens the left image stacks first.',
        },
      },
      {
        name: 'textPosition',
        type: 'select',
        label: 'Layout: content',
        defaultValue: 'under-portrait',
        options: ['under-portrait', 'under-landscape'],
        admin: {
          description:
            'Which image the text sits under. Under the portrait it stays compact; under the landscape it runs larger and wider.',
        },
      },
      themeField(),
    ]),
  ],
}
