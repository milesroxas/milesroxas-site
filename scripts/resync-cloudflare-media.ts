import config from '@payload-config'
import { getPayload } from 'payload'
import { sweepMedia } from '../src/collections/Media/cloudflare'

/**
 * Runs the Cloudflare sweep by hand: every image or video in Media without a
 * Cloudflare asset is uploaded now, and every encoded video is marked ready,
 * instead of at the next 05:00 UTC job (`src/jobs/cloudflareMediaSweep.ts`,
 * docs/media.md).
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
console.info(`synced ${synced}, ready ${ready}, failed ${failed}`)
process.exit(failed > 0 ? 1 : 0)
