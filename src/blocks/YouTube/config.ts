import type { Block } from 'payload'

export const YouTubeBlock: Block = {
  slug: 'youTube',
  interfaceName: 'YouTubeBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube URL',
      admin: {
        description:
          'Enter the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
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
      label: 'Full Width Display',
      admin: {
        description: 'Makes the video span the full width of its container.',
      },
    },
  ],
}
