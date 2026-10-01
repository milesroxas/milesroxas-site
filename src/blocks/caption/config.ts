import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * sas-site's Caption block (its `mediaBlock`), under its own slug here: this
 * site's legacy `mediaBlock` keeps its slug, tables and rows
 * (docs/composer-roadmap.md, Section 4).
 */
export const Caption: Block = {
  slug: 'caption',
  admin: { group: BLOCK_GROUPS.media },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_caption`,
  interfaceName: 'CaptionBlock',
  labels: { singular: 'Caption', plural: 'Captions' },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Inset', value: 'inset' },
        { label: 'Small', value: 'small' },
      ],
      admin: {
        description:
          'Presentation for this placement only; the media document itself stays layout-neutral.',
      },
    },
    {
      name: 'captionOverride',
      type: 'richText',
      admin: {
        description:
          "Optional. Replaces the media document's canonical caption for this placement only.",
      },
    },
    themeField(),
  ],
}
