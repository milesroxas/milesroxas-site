import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { sectionSpacing } from '@/fields/sectionSpacing'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  admin: { group: BLOCK_GROUPS.media },
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
    themeField(),
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
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature(), HeadingFeature()]
        },
      }),
      defaultValue: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
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
