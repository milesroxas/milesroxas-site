import type { Block } from 'payload'
import { designFields, optionalFields, textSizeField, themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { featureHeaderFields } from '../shared'

export const FeatureHeadingOffset: Block = {
  slug: 'featureHeadingOffset',
  admin: { group: BLOCK_GROUPS.sectionHeading },
  interfaceName: 'FeatureHeadingOffsetBlock',
  labels: { singular: 'Offset', plural: 'Offsets' },
  fields: [
    ...featureHeaderFields,
    ...optionalFields({
      name: 'showBody',
      label: 'Show supporting copy',
      fields: [
        {
          name: 'body',
          type: 'richText',
          admin: { description: 'Supporting copy in the offset right column.' },
        },
      ],
    }),
    designFields([textSizeField(), themeField()]),
  ],
}
