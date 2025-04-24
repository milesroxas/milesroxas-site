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

const workEntryFields: Field[] = [
  {
    name: 'works',
    label: 'Select Work Entry',
    type: 'relationship',
    relationTo: 'works',
  },
  {
    name: 'aspect',
    type: 'select',
    defaultValue: 'wide',
    options: [
      { label: 'Wide', value: 'wide' },
      { label: 'Square', value: 'square' },
      { label: 'Portrait', value: 'portrait' },
    ],
  },
  {
    name: 'variant',
    label: 'Style',
    type: 'select',
    defaultValue: 'featured',
    options: [
      { label: 'Featured', value: 'featured' },
      { label: 'Card', value: 'card' },
    ],
  },
]

const PostEntryFields: Field[] = [
  {
    name: 'posts',
    label: 'Select Post Entry',
    type: 'relationship',
    relationTo: 'posts',
  },
  {
    name: 'aspect',
    type: 'select',
    defaultValue: 'wide',
    options: [
      { label: 'Wide', value: 'wide' },
      { label: 'Square', value: 'square' },
      { label: 'Portrait', value: 'portrait' },
    ],
  },
  {
    name: 'variant',
    label: 'Style',
    type: 'select',
    defaultValue: 'featured',
    options: [
      { label: 'Featured', value: 'featured' },
      { label: 'Card', value: 'card' },
    ],
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
    name: 'content',
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
        label: 'Work Entry',
        value: 'work',
      },
      {
        label: 'Post Entry',
        value: 'post',
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
      condition: (_, siblingData) => siblingData.content === 'text',
    },
  },
  {
    name: 'sectionHeading',
    type: 'group',
    fields: sectionHeadingFields,
    admin: {
      condition: (_, siblingData) => siblingData.content === 'sectionHeading',
    },
  },
  {
    name: 'work',
    type: 'group',
    fields: workEntryFields,
    admin: {
      condition: (_, siblingData) => siblingData.content === 'work',
    },
  },
  {
    name: 'post',
    type: 'group',
    fields: PostEntryFields,
    admin: {
      condition: (_, siblingData) => siblingData.content === 'post',
    },
  },
  {
    name: 'slider',
    type: 'group',
    fields: SliderBlock.fields,
    admin: {
      condition: (_, siblingData) => siblingData.content === 'slider',
    },
  },
  {
    name: 'media',
    type: 'group',
    fields: mediaFields,
    admin: {
      condition: (_, siblingData) => siblingData.content === 'media',
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
