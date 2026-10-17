import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { adminThumbnail } from '@/collections/Media/adminThumbnail'
import { readTempFile } from '@/collections/Media/hooks/readTempFile'
import { defaultTitle, purgeVideoStreamOnDelete, stageHook, streamUrl } from './hooks'
import { LOOP, VIDEO_STAGES } from './stage'
import { videoStatusEndpoint } from './status'

const hidden = { admin: { hidden: true } } as const

/**
 * Full-length videos: a few seconds loop muted in the block until a visitor
 * presses play, then the whole video plays with sound (docs/media.md,
 * "Videos"). Media keeps images and the short ambient loops that play whole;
 * this collection exists so a long file never streams whole just to fill a
 * frame, and so the admin can show where the encoding stands.
 *
 * The file lives on R2 like every upload; Stream encodes it and cuts the loop
 * (`stream.ts`). The sync hook is `videoStreamSync`, registered after the
 * storage adapter in `payload.config.ts`.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'status', 'updatedAt'],
    description:
      'Full-length videos that play on click. A few seconds loop muted until then. An image or a short loop that plays whole goes in Media.',
    useAsTitle: 'title',
  },
  endpoints: [videoStatusEndpoint],
  hooks: {
    afterDelete: [purgeVideoStreamOnDelete],
    // Before the storage adapter's own hooks, which the plugin appends.
    beforeChange: [readTempFile],
    beforeValidate: [defaultTitle],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Names the video for the visitor: the play button reads it out. Blank takes the filename.',
      },
    },
    {
      name: 'status',
      type: 'select',
      virtual: true,
      options: Object.entries(VIDEO_STAGES).map(([value, label]) => ({ label, value })),
      hooks: { afterRead: [stageHook] },
      admin: {
        components: { Field: '@/collections/Videos/VideoStatusField#VideoStatusField' },
        readOnly: true,
      },
    },
    {
      name: 'loop',
      type: 'group',
      label: 'Loop',
      admin: {
        description: `The seconds that loop, muted, until a visitor presses play. Blank loops the first ${LOOP.length} seconds. Changing these recuts the loop on save.`,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'start',
              type: 'number',
              label: 'Start (seconds)',
              min: 0,
              admin: {
                description: 'Moved back when the loop would run past the end.',
                placeholder: String(LOOP.start),
                step: 0.5,
                width: '50%',
              },
            },
            {
              name: 'length',
              type: 'number',
              label: 'Length (seconds)',
              min: LOOP.min,
              max: LOOP.max,
              admin: {
                description: `${LOOP.min} to ${LOOP.max}. A video no longer than this loops whole.`,
                placeholder: String(LOOP.length),
                step: 1,
                width: '50%',
              },
            },
          ],
        },
      ],
    },
    // The Stream side, written by `stream.ts` straight to the row.
    { name: 'duration', type: 'number', ...hidden },
    { name: 'cloudflareStreamUid', type: 'text', ...hidden },
    { name: 'cloudflareStreamReady', type: 'checkbox', defaultValue: false, ...hidden },
    {
      name: 'cloudflareStreamPlaybackUrl',
      type: 'text',
      virtual: true,
      hooks: { afterRead: [streamUrl('cloudflareStreamUid', 'playback')] },
      ...hidden,
    },
    {
      name: 'cloudflareStreamThumbnailUrl',
      type: 'text',
      virtual: true,
      hooks: { afterRead: [streamUrl('cloudflareStreamUid', 'thumbnail')] },
      ...hidden,
    },
    { name: 'loopUid', type: 'text', ...hidden },
    { name: 'loopReady', type: 'checkbox', defaultValue: false, ...hidden },
    {
      name: 'loopPlaybackUrl',
      type: 'text',
      virtual: true,
      hooks: { afterRead: [streamUrl('loopUid', 'playback')] },
      ...hidden,
    },
    {
      name: 'loopThumbnailUrl',
      type: 'text',
      virtual: true,
      hooks: { afterRead: [streamUrl('loopUid', 'thumbnail')] },
      ...hidden,
    },
    { name: 'streamError', type: 'text', ...hidden },
  ],
  upload: {
    adminThumbnail,
    crop: false,
    focalPoint: false,
    mimeTypes: ['video/*'],
  },
}
