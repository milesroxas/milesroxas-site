import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { SliderBlock } from '@/blocks/Slider/config'
import { link } from '@/fields/link'
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
          BlocksFeature({
            blocks: [MediaBlock],
          }),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'textSize',
    type: 'select',
    defaultValue: 'base',
    options: ['sm', 'base', 'lg', 'xl', '2xl'],
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
    name: 'eyebrow',
    type: 'text',
  },

  {
    name: 'content',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ],
    }),
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
      {
        label: 'Original',
        value: 'original',
      },
    ],
  },
  {
    name: 'fullWidth',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    name: 'captionSize',
    type: 'select',
    defaultValue: 'normal',
    options: ['normal', 'large', 'xl'],
  },
]

const youTubeFields: Field[] = [
  {
    name: 'url',
    type: 'text',
    required: true,
    label: 'YouTube URL',
    admin: {
      description: 'Enter the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
    },
  },
  {
    name: 'aspectRatio',
    type: 'select',
    defaultValue: 'landscape',
    options: [
      {
        label: 'Landscape (16:9)',
        value: 'landscape',
      },
      {
        label: 'Square (1:1)',
        value: 'square',
      },
      {
        label: 'Portrait (9:16)',
        value: 'portrait',
      },
    ],
  },
  {
    name: 'fullWidth',
    type: 'checkbox',
    defaultValue: false,
  },
]

const columnFields: Field[] = [
  {
    name: 'sizes',
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
        label: 'Five Cols',
        value: 'fiveCols',
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
      {
        label: 'YouTube',
        value: 'youTube',
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
  {
    name: 'youTube',
    type: 'group',
    fields: youTubeFields,
    admin: {
      condition: (_, siblingData) => siblingData.content === 'youTube',
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
      defaultValue: 'system',
      admin: {
        description: 'Override the site theme for this content block.',
      },
      options: [
        { label: 'System (Follow site theme)', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    {
      name: 'containerWidth',
      type: 'select',
      defaultValue: 'contained',
      admin: {
        description: 'Control the width of the content container',
      },
      options: [
        { label: 'Contained (default width)', value: 'contained' },
        { label: 'Full Width (edge to edge)', value: 'fullWidth' },
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
