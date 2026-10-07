import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { readTempFile } from './hooks/readTempFile'
import { resolveStreamUrls, syncCloudflareDelete } from './hooks/syncCloudflare'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    // The upload sync is `cloudflareMediaSync`, registered after the storage adapter
    // (docs/media.md).
    afterDelete: [syncCloudflareDelete],
    afterRead: [resolveStreamUrls],
    // Before the storage adapter's own hooks, which the plugin appends.
    beforeChange: [readTempFile],
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
      // Computed at read time by `resolveStreamUrls`
      name: 'cloudflareStreamThumbnailUrl',
      type: 'text',
      virtual: true,
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
    // One server-side size, for the admin list and the Studio pickers. The
    // site serves every image from Cloudflare Images (docs/media.md), so more
    // sizes only cost upload time and Blob writes.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
    ],
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  // Enable folders for media organization
  folders: true,
}
