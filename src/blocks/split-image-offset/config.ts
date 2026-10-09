import type { Block } from 'payload'
import { designFields, textSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * A large 5:4 figure beside a narrower column holding a 3:2 figure with
 * caption copy beneath it, on the composition grid (5 columns and 3). The
 * caption starts where the small figure ends, the offset the block is named
 * for. `captionPosition` picks the side.
 *
 * Self-contained by default (authors the body inline), so it can be dropped
 * into any collection's `blocks` field. On Work and Lab Pages the `source`
 * select can pull canonical story content instead.
 */
export const SplitImageOffset: Block = {
  slug: 'splitImageOffset',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_split_offset`,
  interfaceName: 'SplitImageOffsetBlock',
  labels: { singular: 'Pair offset', plural: 'Pair offsets' },
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
      name: 'largeMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 5:4.' },
    },
    {
      name: 'smallMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 3:2. Shown above the caption.' },
    },
    designFields([
      textSizeField(),
      {
        name: 'captionPosition',
        type: 'select',
        label: 'Layout',
        defaultValue: 'left',
        options: ['left', 'right'],
        admin: {
          description:
            'Place the small image and caption on the left or the right of the large image.',
        },
      },
      themeField(),
    ]),
  ],
}
