import config from '@payload-config'
import { getPayload } from 'payload'
import { sweepMedia } from '../src/collections/Media/cloudflare'
import { sweepVideos } from '../src/collections/Videos/stream'

/**
 * The Cloudflare sweep, which only runs from here: every image or video in
 * Media without a Cloudflare asset is uploaded now, every encoded video is
 * marked ready, and every Video not yet ready takes its next step
 * (docs/media.md). Nothing on the site runs on a schedule; the Stream
 * webhook and the admin's status poll cover the day-to-day, this the rest.
 *
 *   pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts --dry-run
 *   pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts
 *
 * Against production, override POSTGRES_URL from the pulled prod env and keep
 * schema push off: PAYLOAD_DB_PUSH=false POSTGRES_URL=<prod> pnpm exec tsx ...
 * The Blob and Cloudflare variables in `.env` must be the deployed ones.
 */

const dryRun = process.argv.includes('--dry-run')
const payload = await getPayload({ config })
const { failed, ready, synced } = await sweepMedia(payload, { dryRun })
const videos = await sweepVideos(payload, { dryRun })
console.info(
  `synced ${synced}, ready ${ready}, videos advanced ${videos.advanced}, failed ${failed + videos.failed}`,
)
process.exit(failed + videos.failed > 0 ? 1 : 0)
