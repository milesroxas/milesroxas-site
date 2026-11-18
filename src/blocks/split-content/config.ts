import type { Block } from 'payload'
import { designFields, eyebrowFields, textSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { contentLexical } from '@/fields/contentLexical'
import { blockVisualSlotFields } from '@/fields/visual'

/**
 * Split layout: a narrow text column beside a large image, with the image
 * arranged on the left or right. Self-contained by default (authors the body
 * inline), so it can be dropped into any collection's `blocks` field. The
 * body is written in the content-column editor (`contentLexical`).
 *
 * On Work and Lab Pages the `source` select can pull canonical story content
 * instead; on collections without a related story record it resolves to the
 * inline `body`, so the block degrades gracefully.
 *
 * `contentType: 'list'` sets a numbered list under the heading in place of the
 * body (design-system/blocks/media-content.elyx, `splitContentNarrowList`).
 * `title` and `description` are TEXT_KEYS names, so each item reaches Ask and
 * llms.txt.
 */

const isList = (_: unknown, siblingData: { contentType?: string } | undefined) =>
  siblingData?.contentType === 'list'
export const SplitContentNarrow: Block = {
  slug: 'splitContentNarrow',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_split_narrow`,
  interfaceName: 'SplitContentNarrowBlock',
  labels: { singular: 'Split narrow', plural: 'Split narrow' },
  fields: [
    ...eyebrowFields(),
    { name: 'heading', type: 'text' },
    {
      name: 'contentType',
      type: 'radio',
      label: 'Content',
      // Function, not literal: Payload then writes no column default naming a just-added enum label.
      defaultValue: () => 'body',
      options: [
        { label: 'Text', value: 'body' },
        { label: 'List', value: 'list' },
      ],
      admin: {
        layout: 'horizontal',
        description: 'Text sets rich text under the heading. List sets a numbered list of items.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      editor: contentLexical,
      admin: {
        condition: (_, siblingData) => !isList(_, siblingData),
        description:
          'Shown when source is "Custom", or as a Work or Lab Page override for canonical content.',
      },
    },
    {
      name: 'items',
      type: 'array',
      maxRows: 5,
      labels: { singular: 'Item', plural: 'Items' },
      admin: { condition: isList, initCollapsed: true },
      // The admin form passes the row count, the API the rows.
      validate: (value, { siblingData }) => {
        if (!isList(null, siblingData as { contentType?: string })) return true
        const rows = Array.isArray(value) ? value.length : Number(value) || 0
        if (rows === 0) return 'Add at least one item.'
        return rows <= 5 ? true : 'Use five items or fewer.'
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'One or two lines that explain the item.' },
        },
      ],
    },
    ...blockVisualSlotFields(
      {
        name: 'media',
        type: 'upload',
        relationTo: 'media',
        required: true,
      },
      { video: true },
    ),
    designFields([
      textSizeField(),
      {
        name: 'imagePosition',
        type: 'select',
        label: 'Layout',
        defaultValue: 'left',
        options: ['left', 'right'],
        admin: { description: 'Arrange the image on the left or the right of the text.' },
      },
      themeField(),
    ]),
  ],
}
