import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { sectionSpacing } from '@/fields/sectionSpacing'
import { sectionHeading } from '@/fields/sectionHeading'
import { SliderBlock } from '@/blocks/Slider/config'

// Extract slider fields, excluding layout-related ones if necessary
// For now, let's just take all fields from SliderBlock for simplicity,
// assuming they are all relevant within a tab context.
// We might need to refine this later based on actual SliderBlock structure.
const sliderFieldsForTab = SliderBlock.fields.filter(
  (field) => 'name' in field && !['introContent', 'space'].includes(field.name),
) // Example: Exclude intro and spacing if they are handled by the Tabs block itself

const tabFields: Field[] = [
  {
    name: 'tabTitle',
    type: 'text',
    required: true,
  },
  {
    name: 'contentType',
    type: 'select',
    options: [
      { label: 'Rich Text', value: 'richText' },
      { label: 'Slider', value: 'slider' },
    ],
    defaultValue: 'richText',
    required: true,
    admin: {
      description: 'Choose the type of content for this tab.',
    },
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: 'Rich Text Content',
    required: true,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'richText',
    },
  },
  {
    name: 'slider',
    type: 'group',
    fields: sliderFieldsForTab,
    label: 'Slider Content',
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'slider',
    },
  },
]

export const TabsBlock: Block = {
  slug: 'tabs',
  interfaceName: 'TabsBlock',
  fields: [
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'system',
      options: [
        { label: 'System Default', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    sectionHeading(),
    sectionSpacing(),
    {
      name: 'tabs',
      type: 'array',
      fields: tabFields,
    },
  ],
}
