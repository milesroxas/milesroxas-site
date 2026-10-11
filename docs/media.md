# Media

How an upload becomes an image or video on the site, and what keeps it that way. What size to
export for each block: [media-dimensions.md](media-dimensions.md).

| Concern | Where |
| --- | --- |
| Collection, the one server-side size | [`src/collections/Media/index.ts`](../src/collections/Media/index.ts) |
| Storage adapter (Vercel Blob, browser uploads, direct URLs) | `vercelBlobStorage` in [`src/payload.config.ts`](../src/payload.config.ts) |
| Cloudflare sync, shared by hook, job and script | [`src/collections/Media/cloudflare.ts`](../src/collections/Media/cloudflare.ts) |
| Hooks: in-request sync, delete, Stream URLs | [`src/collections/Media/hooks/syncCloudflare.ts`](../src/collections/Media/hooks/syncCloudflare.ts) |
| Daily sweep for anything the hook missed | [`src/jobs/cloudflareMediaSweep.ts`](../src/jobs/cloudflareMediaSweep.ts) |
| Cloudflare API client with retries | [`src/utilities/cloudflare.ts`](../src/utilities/cloudflare.ts) |
| Stream "ready" webhook | [`src/app/(payload)/api/cloudflare-stream-webhook/route.ts`](<../src/app/(payload)/api/cloudflare-stream-webhook/route.ts>) |
| Agent upload | [`src/endpoints/agentMedia.ts`](../src/endpoints/agentMedia.ts), `pnpm cms:upload` ([mcp.md](mcp.md)) |
| Rendering | [`src/components/Media`](../src/components/Media) |

## The pipeline

1. **Blob is the origin.** Every file lives in Vercel Blob. The admin uploads straight from the
   browser (`clientUploads`): the file lands in its own folder, `<_objectKey>/<filename>`, and the
   server never receives the bytes. `pnpm cms:upload` and the Local API upload server-side, with no
   folder. `disablePayloadAccessControl` makes `url` and the size URL direct Blob URLs in both
   cases, so nothing is proxied through a function and the URL the hooks see is the final one.
2. **One size, `thumbnail` (300 wide).** It feeds the admin list and the Studio pickers. Every
   other render comes from Cloudflare, so more sizes only cost upload time and Blob writes. Payload
   re-reads a browser upload from Blob to make it, which is the one server-side cost per image.
3. **Cloudflare serves.** After the storage adapter has written the file, `syncCloudflareUpload`
   asks Cloudflare Images (images) or Stream (videos) to fetch it from Blob and writes the ids
   straight to the row (`writeCloudflareFields`, `payload.db.updateOne`) in the same transaction.
   No hook sees that write: a `payload.update` would run the storage adapter again, which
   re-uploads the file it kept on the request, and Payload merges the call's `context` into
   `req.context` and leaves it there, so a skip flag would silence the sync for the next file
   saved on the same request (the Studio publishes two posters on one request; the second never
   synced until 2026-10-11). The admin and `cms:upload` see the asset at once. The front end
   prefers `cloudflareImageUrl` (the `public` variant, through `next/image`) or the Stream HLS
   URL once the video is marked ready, and falls back to the Blob URL.
4. **A failed sync never blocks a save.** It is logged as `[Cloudflare] Upload failed` after three
   attempts on rate limits, 5xx and network errors. The document is on the site from Blob meanwhile.
   `cloudflareMediaSweep` runs at 05:00 UTC (the daily cron in `vercel.json` executes it; it needs
   `CRON_SECRET` on the deployment or the run endpoint answers 401 and nothing runs). It syncs every
   image or video still without its asset and marks every video Stream has finished encoding.
5. **A video is marked ready two ways.** The Stream webhook sets `cloudflareStreamReady` as soon
   as encoding finishes; the sweep asks Stream for every video still unmarked. The webhook is a
   plain server-to-server POST, so Vercel's Bot Protection (managed ruleset, action `challenge`)
   answers it with a 429 challenge page unless a WAF rule bypasses
   `/api/cloudflare-stream-webhook` the way `Agent API bypass` does for `/api/mcp`. Until that rule
   exists, readiness arrives with the next sweep instead of within minutes.
   Playback (`src/components/Media/VideoMedia`) goes through hls.js, or Safari's native player.
   hls.js is given a 6 Mbps opening estimate capped to the frame's rendered size, since its own
   0.5 Mbps guess opens every video at 240p; Safari gets `clientBandwidthHint` from the frame's
   width, the only control its player offers. hls.js loads no segment until the element is asked
   to play, and a `play()` that lands before the manifest (the carousel settles on a slide while
   hls.js is still importing) is kept from the element's play/pause events and honoured once the
   manifest parses. The stored `cloudflareStreamPlaybackUrl` is recomputed from the uid on every
   read (`resolveStreamUrls`); rows written before 2026-02-26 hold a doubled host and are never
   served as stored.
6. **A temp-file upload carries its bytes.** When Payload parks a file on disk (a browser upload
   read back for the thumbnail, or a Local API `tempFilePath`), `req.file.data` is empty and the
   Blob adapter would write zero bytes over the original. It did, for every webp uploaded from the
   admin until 2026-10-07. `readTempFile` fills the buffer first.
7. **Replacing or deleting a file purges Cloudflare.** A replacement is detected by filename or by
   a new object folder, so a same-name re-upload from the admin still purges the old asset.

Flexible variants are on for the Cloudflare account (since 2026-10-07). `cloudflareImageUrl` stores
the `public` variant; `cloudflareImageLoader` (`src/utilities/cloudflareImageLoader.ts`) rewrites it
to `w=<width>,q=<quality>,f=auto` per `next/image` breakpoint, so Cloudflare resizes and encodes
(AVIF or WebP by Accept header) and Vercel's optimizer only handles non-Cloudflare sources. A server
component renders `CloudflareImage` to get the loader; a client component passes it directly.

## Scripts

```bash
pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts [--dry-run]   # sync + mark ready now
pnpm exec tsx --env-file=.env scripts/prune-blob-sizes.ts [--delete]           # drop pre-2026-10 size files from Blob
```

Both read the database `POSTGRES_URL` names. For production: `PAYLOAD_DB_PUSH=false
POSTGRES_URL=<prod url> pnpm exec tsx ...`, with the deployed Blob and Cloudflare variables in
`.env`. The pruner lists first and deletes only with `--delete`; a stored original is never a
candidate.

## Environment

`BLOB_READ_WRITE_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_IMAGES_ACCOUNT_HASH`, `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`,
`CLOUDFLARE_STREAM_WEBHOOK_SECRET`, and `CRON_SECRET` for the sweep. Local dev shares the
production Blob store and Cloudflare account: a local upload is a real asset, and deleting the
document removes it.
