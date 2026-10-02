import type { Block } from 'payload'
import { designFields, mediaSizeField, optionalFields, themeField } from '@/blocks/shared/fields'

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
    ...optionalFields({
      name: 'showCaptionOverride',
      label: 'Override caption',
      fields: [
        {
          name: 'captionOverride',
          type: 'richText',
          admin: {
            description: "Replaces the media document's canonical caption for this placement only.",
          },
        },
      ],
    }),
    designFields([
      mediaSizeField(
        'Full width runs edge to edge across the page. Contained fills the page column; Inset and Small sit centred in it, all with rounded corners. Presentation for this placement only; the media document itself stays layout-neutral.',
      ),
      themeField(),
    ]),
  ],
}
