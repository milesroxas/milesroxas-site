# Media

How an upload becomes an image or video on the site, and what keeps it that way. What size to
export for each block: [media-dimensions.md](media-dimensions.md).

| Concern | Where |
| --- | --- |
| Collection, the one server-side size | [`src/collections/Media/index.ts`](../src/collections/Media/index.ts) |
| Storage adapter (Cloudflare R2, browser uploads, direct URLs) | `s3Storage` in [`src/payload.config.ts`](../src/payload.config.ts), URL in [`src/utilities/r2.ts`](../src/utilities/r2.ts) |
| Cloudflare sync, shared by hook, job and script | [`src/collections/Media/cloudflare.ts`](../src/collections/Media/cloudflare.ts) |
| Hooks: in-request sync, delete, Stream URLs | [`src/collections/Media/hooks/syncCloudflare.ts`](../src/collections/Media/hooks/syncCloudflare.ts) |
| Daily sweep for anything the hook missed | [`src/jobs/cloudflareMediaSweep.ts`](../src/jobs/cloudflareMediaSweep.ts) |
| Cloudflare API client with retries | [`src/utilities/cloudflare.ts`](../src/utilities/cloudflare.ts) |
| Stream "ready" webhook | [`src/app/(payload)/api/cloudflare-stream-webhook/route.ts`](<../src/app/(payload)/api/cloudflare-stream-webhook/route.ts>) |
| Agent upload | [`src/endpoints/agentMedia.ts`](../src/endpoints/agentMedia.ts), `pnpm cms:upload` ([mcp.md](mcp.md)) |
| Rendering | [`src/components/Media`](../src/components/Media) |

## The pipeline

1. **R2 is the origin.** Every file lives in the Cloudflare R2 bucket `R2_BUCKET`, served from
   its custom domain `R2_PUBLIC_URL` (edge cached, no egress charge). The admin uploads straight
   from the browser on a presigned PUT (`clientUploads`): the server mints a fresh
   `<_objectKey>/<filename>` key per upload and never receives the bytes, so a video never meets
   Vercel's 4.5 MB body limit. `pnpm cms:upload` and the Local API upload server-side, with no
   folder. `disablePayloadAccessControl` plus `generateFileURL` make `url` and the size URL direct
   bucket URLs in both cases, so nothing is proxied through a function and the URL the hooks see
   is the final one. The bucket needs a CORS rule for the presigned PUT (see Setup).
   Until 2026-10-11 the origin was Vercel Blob; its browser-upload path authorised an "overwrite"
   whenever a filename already existed on any row (payloadcms/payload#17823), so a re-upload of a
   known name landed at a key the row never pointed at and Cloudflare got a 404.
2. **One size, `thumbnail` (300 wide).** It feeds the admin list and the Studio pickers. Every
   other render comes from Cloudflare, so more sizes only cost upload time and Blob writes. Payload
   re-reads a browser upload from Blob to make it, which is the one server-side cost per image.
3. **Cloudflare serves.** After the storage adapter has written the file, `syncCloudflareUpload`
   asks Cloudflare Images (images) or Stream (videos) to fetch it from the bucket and writes the ids
   straight to the row (`writeCloudflareFields`, `payload.db.updateOne`) in the same transaction.
   No hook sees that write: a `payload.update` would run the storage adapter again, which
   re-uploads the file it kept on the request, and Payload merges the call's `context` into
   `req.context` and leaves it there, so a skip flag would silence the sync for the next file
   saved on the same request (the Studio publishes two posters on one request; the second never
   synced until 2026-10-11). The admin and `cms:upload` see the asset at once. The front end
   prefers `cloudflareImageUrl` (the `public` variant, through `next/image`) or the Stream HLS
   URL once the video is marked ready, and falls back to the bucket URL.
4. **A failed sync never blocks a save.** It is logged as `[Cloudflare] Upload failed` after three
   attempts on rate limits, 5xx and network errors. The document is on the site from the bucket meanwhile.
   `cloudflareMediaSweep` runs at 05:00 UTC (the daily cron in `vercel.json` executes it; it needs
   `CRON_SECRET` on the deployment or the run endpoint answers 401 and nothing runs). It syncs every
   image or video still without its asset and marks every video Stream has finished encoding.
5. **A video is marked ready two ways.** The Stream webhook sets `cloudflareStreamReady` as soon
   as encoding finishes; the sweep asks Stream for every video still unmarked. The webhook is a
   plain server-to-server POST, so Vercel's Bot Protection (managed ruleset, action `challenge`)
   answers it with a 429 challenge page unless a WAF rule bypasses
   `/api/cloudflare-stream-webhook` the way `Agent API bypass` does for `/api/mcp`. Until that rule
   exists, readiness arrives with the next sweep instead of within minutes.
   The poster is Stream's thumbnail sized by `streamPosterUrl` (`src/utilities/streamPoster.ts`):
   Stream's default `thumbnail.jpg` is 640 px wide, a 4× upscale in a retina hero, so a priority
   video asks for 1920, any other frame 1280, and the carousel's poster overlay carries a
   640/1280/1920 srcset with the slide's `sizes`. A caller whose frame is narrower says so with
   `posterWidth`: the home hero's portrait is 30vh wide and takes 640 (its 1920 poster was a
   356 KB JPEG and the page's LCP element, 73 KB at 640). The admin list and pickers paint `adminThumbnail`
   (`src/collections/Media/adminThumbnail.ts`): the Cloudflare image at 300 wide, a Stream frame
   for a video, else the size file beside the original. Payload's own thumbnail read the size's
   stored URL, empty for a browser upload, and fell back to a file route that looked on a disk
   nothing was written to, one 500 per row per list view.
   Playback (`src/components/Media/VideoMedia`) goes through hls.js, or Safari's native player.
   hls.js is given a 6 Mbps opening estimate capped to the frame's rendered size, since its own
   0.5 Mbps guess opens every video at 240p. The cap counts device pixels up to 1.5x
   (`maxDevicePixelRatio`): at the full ratio the 270 px home portrait on a 3x phone asked for the
   1280 rendition, 1.7 MB before the page had its scripts. Safari gets `clientBandwidthHint` from
   the frame's width, the only control its player offers. hls.js loads no segment until the element is asked
   to play, and a `play()` that lands before the manifest (the carousel selects a slide while
   hls.js is still importing) is kept from the element's play/pause events and honoured once the
   manifest parses. Chrome's built-in HLS player answers `canPlayType` too now, so current Chrome
   and Safari both play the manifest URL natively, pinned to one rendition by the hint.
   A `mediawarm` event on the element (`warmVideo`) fetches its opening frames without playing:
   hls.js starts its load, the native player gets `preload="auto"`. The carousel plays the chosen
   slide on embla's `select` (the moment a drag is released, about a second before it settles)
   and warms the two slides beside it once the active one can paint, so the next slide reveals
   as soon as it is chosen rather than after a manifest, a playlist and a segment. The works
   index plate (`src/sections/MoreWork/plate-videos.ts`) does the same for its stacked rows: the
   shown row's video plays, the rows either side warm, the rest fetch nothing, and its canvas
   warms every video it has to sample. The stored `cloudflareStreamPlaybackUrl` is recomputed from the uid on every
   read (`resolveStreamUrls`); rows written before 2026-02-26 hold a doubled host and are never
   served as stored.
6. **A temp-file upload carries its bytes.** When Payload parks a file on disk (a browser upload
   read back for the thumbnail, or a Local API `tempFilePath`), `req.file.data` is empty and the
   storage adapter would write zero bytes over the original (payloadcms/payload#18333). It did,
   for every webp uploaded from the admin until 2026-10-07. `readTempFile` fills the buffer first.
7. **Replacing or deleting a file purges Cloudflare.** A replacement is detected by filename or by
   a new object folder, so a same-name re-upload from the admin still purges the old asset.

Flexible variants are on for the Cloudflare account (since 2026-10-07). `cloudflareImageUrl` stores
the `public` variant; `cloudflareImageLoader` (`src/utilities/cloudflareImageLoader.ts`) rewrites it
to `w=<width>,q=<quality>,f=auto` per `next/image` breakpoint, so Cloudflare resizes and encodes
(AVIF or WebP by Accept header) and Vercel's optimizer only handles non-Cloudflare sources. A server
component renders `CloudflareImage` to get the loader; a client component passes it directly.

Cloudflare Images takes JPEG, PNG, WebP, GIF, HEIC and SVG and refuses AVIF (code 5455), so the
Media collection's `mimeTypes` stop an AVIF at the admin. One that got in before that rule stays
on the bucket, served through Vercel's optimizer; `scripts/replace-avif-media.ts` re-encodes each
as WebP and replaces the file, which runs the normal sync.

## Scripts

```bash
pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts [--dry-run]   # sync + mark ready now
pnpm exec tsx --env-file=.env scripts/migrate-blob-to-r2.ts [--dry-run]       # copy the old Blob store into R2, same keys
```

The resync reads the database `POSTGRES_URL` names. For production: `PAYLOAD_DB_PUSH=false
POSTGRES_URL=<prod url> pnpm exec tsx ...`, with the deployed R2 and Cloudflare variables in
`.env`. The migration touches no database: keys are identical on both sides, and an object
already in R2 at the same size is skipped, so it can run again.

## Setup (R2)

Done once on 2026-10-11; recorded so it can be repeated for another account.

1. R2 > Manage API tokens > Create: permission Admin Read & Write, all buckets, no expiry. The
   page shows a Token value (`R2_ADMIN_TOKEN`, setup only, the app never reads it), an Access Key
   ID (`R2_ACCESS_KEY_ID`) and a Secret Access Key (`R2_SECRET_ACCESS_KEY`). `R2_ACCOUNT_ID` is
   the Cloudflare account id, the same value as `CLOUDFLARE_ACCOUNT_ID`.
2. With the token, through the REST API (`accounts/<id>/r2/buckets`): create the bucket
   (`R2_BUCKET`, `milesroxas-media`), enable its Public Development URL (`domains/managed`,
   the `https://pub-….r2.dev` host is `R2_PUBLIC_URL`) and put the CORS rule the admin's
   presigned PUT needs. The adapter sends `If-None-Match: *` with the file, so the rule must
   allow that header or the browser's preflight gets 403 and the upload never starts:
   ```json
   {
     "rules": [
       {
         "allowed": {
           "origins": ["https://www.milesroxas.com", "http://localhost:3000"],
           "methods": ["PUT", "GET", "HEAD"],
           "headers": ["content-type", "content-length", "if-none-match"]
         },
         "exposeHeaders": ["ETag"],
         "maxAgeSeconds": 3600
       }
     ]
   }
   ```
   Add a Conductor workspace's port or a preview host when uploading from there. A custom
   domain would need the zone on Cloudflare; milesroxas.com's DNS is on Vercel. The r2.dev URL
   is rate limited, which is fine here: only Cloudflare's own ingest and the fallback for an
   unsynced file ever read the origin.
3. Set the five `R2_*` variables in `.env` and on Vercel (Production and Preview), run the
   migration once, release, then drop `BLOB_READ_WRITE_TOKEN` and the Blob store.

## Environment

`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`,
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_IMAGES_ACCOUNT_HASH`, `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`,
`CLOUDFLARE_STREAM_WEBHOOK_SECRET`, and `CRON_SECRET` for the sweep. Local dev shares the
production bucket and Cloudflare account: a local upload is a real asset, and deleting the
document removes it.
