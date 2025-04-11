import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

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
        label: 'Archive',
        value: 'archive',
      },
      {
        label: 'Media',
        value: 'media',
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
    name: 'archive',
    type: 'group',
    fields: archiveFields,
    admin: {
      condition: (_, siblingData) => siblingData.contentType === 'archive',
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
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
