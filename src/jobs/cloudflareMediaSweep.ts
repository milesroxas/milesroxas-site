import type { TaskConfig } from 'payload'
import { sweepUnsynced } from '@/collections/Media/cloudflare'

/**
 * Syncs every image or video that still has no Cloudflare asset: an upload
 * whose in-request sync failed, or one made while Cloudflare was down.
 *
 * Scheduled for 05:00 UTC like `askQuestionRetention`; the daily cron at
 * 05:10 (vercel.json) runs the due job. A document missed by the hook is on
 * the site from its Blob URL meanwhile. `scripts/resync-cloudflare-media.ts`
 * runs the same sweep by hand.
 */
export const cloudflareMediaSweepTask: TaskConfig = {
  slug: 'cloudflareMediaSweep',
  retries: 0,
  schedule: [{ cron: '0 0 5 * * *', queue: 'default' }],
  outputSchema: [
    { name: 'synced', type: 'number' },
    { name: 'failed', type: 'number' },
  ],
  handler: async ({ req }) => ({ output: await sweepUnsynced(req.payload) }),
}
