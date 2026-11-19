import type { Block } from 'payload'
import { designFields, eyebrowFields, textSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Media list: Split narrow's frame beside a heading, a short description and
 * a list of items, each with its own media. Hovering an item (or clicking,
 * tapping, arrowing to it) swaps the frame to that item's media. `title` and
 * `description` are TEXT_KEYS names, so every item reaches Ask and llms.txt.
 */
export const MediaList: Block = {
  slug: 'mediaList',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_media_list`,
  interfaceName: 'MediaListBlock',
  labels: { singular: 'Media list', plural: 'Media lists' },
  fields: [
    ...eyebrowFields(),
    { name: 'heading', type: 'text' },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'One or two sentences under the heading.' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 6,
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        initCollapsed: true,
        description: 'Each item swaps the frame to its own media. Two to six.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'One short sentence, two lines at most.' },
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'An image or a muted video loop, cropped to 5:4.' },
        },
      ],
    },
    {
      name: 'showNumbers',
      type: 'checkbox',
      label: 'Show numbers',
      defaultValue: true,
    },
    designFields([
      textSizeField(),
      {
        name: 'imagePosition',
        type: 'select',
        label: 'Layout',
        defaultValue: 'left',
        options: ['left', 'right'],
        admin: { description: 'Arrange the media on the left or the right of the list.' },
      },
      themeField(),
    ]),
  ],
}
