import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import {
  resolveBlobUrl,
  syncCloudflareDelete,
  syncCloudflareUpload,
} from './hooks/syncCloudflare'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [syncCloudflareUpload],
    afterDelete: [syncCloudflareDelete],
    afterRead: [resolveBlobUrl],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    // Cloudflare Images fields (populated by hooks)
    {
      name: 'cloudflareImageId',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'cloudflareImageUrl',
      type: 'text',
      admin: { hidden: true },
    },
    // Cloudflare Stream fields (populated by hooks)
    {
      name: 'cloudflareStreamUid',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'cloudflareStreamPlaybackUrl',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'cloudflareStreamReady',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  // Enable folders for media organization
  folders: true,
}
