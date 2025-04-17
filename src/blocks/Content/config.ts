import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import { SliderBlock } from '@/blocks/Slider/config'
import { sectionSpacing } from '@/fields/sectionSpacing'

const richTextFields: Field[] = [
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
    label: false,
  },

  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

const sectionHeadingFields: Field[] = [
  {
    name: 'heading',
    type: 'text',
  },
  {
    name: 'subheading',
    type: 'text',
  },
  {
    name: 'size',
    type: 'select',
    defaultValue: 'base',
    options: ['base', 'lg', 'xl'],
  },
  {
    name: 'align',
    type: 'select',
    defaultValue: 'left',
    options: ['left', 'center'],
  },
  {
    name: 'style',
    type: 'select',
    defaultValue: 'default',
    options: ['default', 'border', 'jumbo'],
  },
]

const archiveFields: Field[] = [
  {
    name: 'archive',
    type: 'relationship',
    relationTo: 'posts',
    hasMany: true,
  },
]

const mediaFields: Field[] = [
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    required: true,
  },
  {
    name: 'aspectRatio',
    type: 'select',
    defaultValue: 'landscape',
    options: [
      {
        label: 'Square',
        value: 'square',
      },
      {
        label: 'Landscape',
        value: 'landscape',
      },
      {
        label: 'Portrait',
        value: 'portrait',
      },
    ],
  },
]

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'contentType',
    type: 'select',
    defaultValue: 'text',
    options: [
      {
        label: 'Rich Text',
        value: 'text',
      },
      {
        label: 'Section Heading',
        value: 'sectionHeading',
      },
      {
        label: 'Archive',
        value: 'archive',
      },
      {
        label: 'Media',
        value: 'media',
      },
      {
        label: 'Slider',
        value: 'slider',
      },
    ],
  },
  {
    name: 'text',
    type: 'group',
    fields: richTextFields,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'text',
    },
  },
  {
    name: 'sectionHeading',
    type: 'group',
    fields: sectionHeadingFields,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'sectionHeading',
    },
  },
  {
    name: 'archive',
    type: 'group',
    fields: archiveFields,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'archive',
    },
  },
  {
    name: 'slider',
    type: 'group',
    fields: SliderBlock.fields,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'slider',
    },
  },
  {
    name: 'media',
    type: 'group',
    fields: mediaFields,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'media',
    },
  },
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    sectionSpacing(),
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
