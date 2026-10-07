# Media

How an upload becomes an image or video on the site, and what keeps it that way.

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
   asks Cloudflare Images (images) or Stream (videos) to fetch it from Blob and writes the ids back
   in the same transaction. The admin and `cms:upload` see the asset at once. The front end prefers
   `cloudflareImageUrl` (the `public` variant, through `next/image`) or the Stream HLS URL once the
   webhook has marked it ready, and falls back to the Blob URL.
4. **A failed sync never blocks a save.** It is logged as `[Cloudflare] Upload failed` after three
   attempts on rate limits, 5xx and network errors. The document is on the site from Blob meanwhile.
   `cloudflareMediaSweep` runs at 05:00 UTC (the daily cron in `vercel.json` executes it) and syncs
   every image or video still without its asset.
5. **A temp-file upload carries its bytes.** When Payload parks a file on disk (a browser upload
   read back for the thumbnail, or a Local API `tempFilePath`), `req.file.data` is empty and the
   Blob adapter would write zero bytes over the original. It did, for every webp uploaded from the
   admin until 2026-10-07. `readTempFile` fills the buffer first.
6. **Replacing or deleting a file purges Cloudflare.** A replacement is detected by filename or by
   a new object folder, so a same-name re-upload from the admin still purges the old asset.

Flexible variants are off on the Cloudflare account, so `public` is the only variant in use and
`next/image` does the per-breakpoint resizing. Turning them on would let a custom image loader move
that work to Cloudflare.

## Scripts

```bash
pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts [--dry-run]   # run the sweep now
pnpm exec tsx --env-file=.env scripts/prune-blob-sizes.ts [--delete]           # drop pre-2026-10 size files from Blob
```

Both read the database `POSTGRES_URL` names. For production: `PAYLOAD_DB_PUSH=false
POSTGRES_URL=<prod url> pnpm exec tsx ...`, with the deployed Blob and Cloudflare variables in
`.env`. The pruner lists first and deletes only with `--delete`; a stored original is never a
candidate.

## Environment

`BLOB_READ_WRITE_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_IMAGES_ACCOUNT_HASH`, `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`,
`CLOUDFLARE_STREAM_WEBHOOK_SECRET`. Local dev shares the production Blob store and Cloudflare
account: a local upload is a real asset, and deleting the document removes it.
