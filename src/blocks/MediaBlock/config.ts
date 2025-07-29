import type { Block } from 'payload'
import { sectionSpacing } from '@/fields/sectionSpacing'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
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
          label: 'Landscape (16:9)',
          value: 'landscape',
        },
        {
          label: 'Square (1:1)',
          value: 'square',
        },
        {
          label: 'Portrait (4:5)',
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
      label: 'Full Width Display',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Makes the media span the full width of its container. Note: For true edge-to-edge display, set both this option AND use "Full Width" in the parent Content Block settings.',
      },
    },
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
      name: 'showCaption',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'captionLayout',
      type: 'select',
      defaultValue: 'center',
      admin: {
        condition: (_, siblingData) => siblingData.showCaption === true,
      },
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
        { label: 'Split Left', value: 'split-left' },
        { label: 'Split Right', value: 'split-right' },
      ],
    },
    {
      name: 'richText',
      type: 'richText',
      label: false,
      admin: {
        condition: (_, siblingData) => siblingData.showCaption === true,
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'textSize',
      type: 'select',
      defaultValue: 'base',
      admin: {
        condition: (_, siblingData) => siblingData.showCaption === true,
      },
      options: ['sm', 'base', 'lg', 'xl', '2xl'],
    },
    sectionSpacing(),
  ],
}
