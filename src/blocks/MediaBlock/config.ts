import type { Block } from 'payload'
import { sectionSpacing } from '@/fields/sectionSpacing'

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
      name: 'captionSize',
      type: 'select',
      defaultValue: 'normal',
      options: [
        {
          label: 'Normal',
          value: 'normal',
        },
        {
          label: 'Large',
          value: 'large',
        },
        {
          label: 'Extra Large',
          value: 'xl',
        },
      ],
    },
    sectionSpacing(),
  ],
}
