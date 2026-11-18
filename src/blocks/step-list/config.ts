import type { Block } from 'payload'
import { designFields, textSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Step list: a numbered run of steps in one row across the page column, each
 * an outlined card with its ordinal at the top and its title and description
 * at the foot (design-system/blocks/lists.elyx, `stepList`). It has no
 * heading of its own: pair it with a Section heading block.
 *
 * `title` and `description` are TEXT_KEYS names, so every step reaches Ask
 * and llms.txt.
 */
export const StepList: Block = {
  slug: 'stepList',
  admin: { group: BLOCK_GROUPS.lists },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_step_list`,
  interfaceName: 'StepListBlock',
  labels: { singular: 'Step list', plural: 'Step lists' },
  fields: [
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 4,
      labels: { singular: 'Step', plural: 'Steps' },
      admin: {
        initCollapsed: true,
        description: 'Two to four steps, numbered in order. They share one row at equal widths.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'One or two lines. Keep the steps about the same length.' },
        },
      ],
    },
    designFields([textSizeField(), themeField()]),
  ],
}
