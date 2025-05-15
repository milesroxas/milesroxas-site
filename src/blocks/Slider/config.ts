import type { Block, Field } from 'payload'

import { sectionSpacing } from '@/fields/sectionSpacing'

const slideFields: Field[] = [
  {
    name: 'image',
    type: 'upload',
    relationTo: 'media',
    required: true,
  },
  {
    name: 'caption',
    type: 'text',
  },
  {
    name: 'link',
    type: 'relationship',
    relationTo: ['works', 'posts'],
    hasMany: false,
  },
]

const introFields: Field[] = [
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
]

export const SliderBlock: Block = {
  slug: 'slider',
  interfaceName: 'SliderBlock',
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
    {
      name: 'introContent',
      type: 'group',
      fields: introFields,
      label: 'Intro Content',
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Cropped',
          value: 'cropped',
        },
        {
          label: 'Single',
          value: 'single',
        },
      ],
    },
    sectionSpacing(),
    {
      name: 'slides',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'slide',
          type: 'group',
          fields: slideFields,
        },
      ],
      admin: {
        initCollapsed: true,
      },
    },
  ],
  labels: {
    plural: 'Sliders',
    singular: 'Slider',
  },
}
