# Load performance

What the site does so a page is light on first load, where each rule lives, and how to measure
before and after a change to the load path. The rules came out of the audit of 2026-10-15
(below); the numbers there are the baseline the next audit compares against.

## The contract

**Server.** Every public page is cached HTML (`export const revalidate = 600`, busted on publish),
served stale-while-revalidate by Vercel. Functions run on Fluid Compute in `iad1`, next to the Neon
database in `us-east-1`. The proxy (`src/proxy.ts`) runs for pages only: any path with a file
extension, the API and Next's static output skip it, and the reports host matches on `has: host`.

**Scripts.** The layout's synchronous chunk group holds React, Next, GSAP, Lenis and the chrome,
about 300 KB raw. Everything a first paint does not need loads after `whenIdle`
(`src/utilities/whenIdle.ts`) in its own chunk:

- PostHog (`src/providers/PostHog/PostHogProvider.tsx`): dynamic import on idle, surveys and
  dead-click capture off. It is the site's one session recorder; Clarity was removed.
- The Ask runtime (`src/features/ask/AskSession.tsx`): the AI SDK and zod arrive on idle, the
  session exists once they do (`useAskReady`), and the panel (`SiteChromeClient.tsx`) is a
  `lazy()` chunk mounted then. A press before that opens it the moment it lands. The `/ask` page
  imports the runtime statically; it needs it.
- The code highlighter (`src/blocks/Code/CodeSurface.tsx`): `next/dynamic` from a client file.
  From the block's server component the split did not happen; the client-reference manifest in
  `.next/server/app/**/page_client-reference-manifest.js` is where to check which chunks a route
  loads synchronously.
- Charts (`src/features/figures/ui/chart/lazy-chart.tsx`) and every WebGL scene
  (`src/features/immersive`, `src/sections/MoreWork/Plate.tsx`) were already lazy.

**Images.** Cloudflare Images serves every image through `cloudflareImageLoader`; Vercel's
optimizer only handles a file Cloudflare has not taken, at quality 85 and cached for a year
(`images.minimumCacheTTL`, safe because every media URL carries its `updatedAt`). `ImageMedia`
defaults `sizes` to `100vw`, so a block that renders an image in a column must pass its own
`size`, or a 2x desktop asks for the 3840 rendition. Cloudflare Images refuses AVIF
(`docs/media.md`).

**Video.** The poster is the LCP element of any page with a video hero, so it is sized to the
frame (`posterWidth`), and the rendition is capped to the frame at no more than 1.5x device
pixels by `capLevelToFrame` (`src/components/Media/VideoMedia/index.tsx`) when the load starts,
because hls.js's own player-size cap measures once at manifest parse and lifts on a 0 × 0 box,
which is what the hero's frame is that early. Chrome and Safari do not use hls.js at all: they
play the manifest natively, and `bandwidthHintFor` turns the same frame measurement into Stream's
`clientBandwidthHint`, the one rendition control a native player has.

**Public assets.** `next.config.ts` serves `/images/*` as immutable (file names carry a
version) and `/textures/*` for a day with a week of stale-while-revalidate. A new folder under
`public/` needs its own rule, or it ships `max-age=0` and the browser revalidates it on every
visit.

**Field data.** `@vercel/speed-insights` is mounted in the root layout, so the Vercel project's
Speed Insights tab has real-user LCP, INP and CLS by route. (PostHog captures `$web_vitals` too,
but the PostHog MCP connection in Claude Code reaches a different organisation, so it is not a
source an agent can read.)

## Measuring

Both scripts use the Playwright that Storybook's tests install. Run them from the repo root
against production, before and after; the captures land in `.context/perf/`.

```bash
node scripts/perf/measure.mjs https://www.milesroxas.com/           # desktop, fast line
node scripts/perf/measure.mjs https://www.milesroxas.com/ mobile    # iPhone viewport, 3x
node scripts/perf/throttled.mjs https://www.milesroxas.com/         # Slow 4G + 4x CPU
```

`measure.mjs` prints navigation timings, LCP and its element, CLS, long tasks, every response by
size with its cache status, bytes per host and console errors. `throttled.mjs` is where the
hero's poster, its video and the scripts compete; the LCP there is the number to watch.

For the chunk graph without deploying: `pnpm build` (it compiles even when the export step fails
against a local database whose schema is behind), then read a route's
`page_client-reference-manifest.js`. The chunks listed for the `providers/index.tsx` module are
the layout's synchronous group; a library that should be lazy must not appear there.

## Audit of 2026-10-15

Miles reported slow loads. Production measured from a fast line was fine (home: TTFB 140 ms, LCP
0.9 s), which pointed at payload rather than the server. On Slow 4G with a 4x CPU slowdown the
home page took 11 s to `load` with LCP at 8.7 s.

Home page before, by part: 74 requests, 6.0 MB. Scripts 2.37 MB raw (644 KB on the wire
first-party, plus 370 KB PostHog and 74 KB Clarity), the hero video 1.7 MB in its first three
segments, images 835 KB, CSS 333 KB raw (45 KB on the wire).

What was wrong, and what changed:

1. The home hero's poster was a 1920 px JPEG (356 KB) for a 270 px frame, and hls.js fetched the
   1280 rendition because the player-size cap multiplied by device pixel ratio. Poster width from
   the frame, ratio capped at 1.5.
2. Images requested `w=3840` from Cloudflare because `sizes` defaulted to `100vw`; R2 fallbacks
   went through Vercel's optimizer at quality 100 and were re-fetched from the rate-limited
   `r2.dev` host every four hours. Home hero `sizes`, quality 85, a one-year optimizer cache.
3. PostHog core sat in the layout's synchronous chunk and then loaded its recorder, surveys and
   dead-click extensions; Clarity ran a second recorder. PostHog deferred and trimmed, Clarity
   removed.
4. The Ask panel's AI SDK and zod (161 KB raw) shipped on every page for a panel most visits never
   open. Deferred to idle.
5. Prism and its grammars (90 KB) shipped on pages with no code block, because the code surface is
   a client component in `RenderBlocks`'s static graph. Split on the client side of the boundary.
6. `/images/*` and `/textures/*` answered `Cache-Control: public, max-age=0, must-revalidate`; the
   only header rule covered `/media/*`, a path that stopped existing with R2. Rules added.
7. The proxy ran for every static file and RSC prefetch. Matcher narrowed.
8. The apex `milesroxas.com` redirected to `www` with a 307, which no browser caches. Set to 308
   in the project's domain settings.
9. 19 AVIF uploads and one JPEG had no Cloudflare Images copy. The Images API refuses AVIF (code
   5455); the JPEG's original had not survived the Blob move. The AVIFs were re-encoded as WebP
   and replaced in place (`scripts/replace-avif-media.ts`), the JPEG was deleted (nothing
   referenced it), and the Media collection now refuses AVIF at upload.

After the change the layout's synchronous group is about 300 KB raw, down from about 920 KB;
PostHog, the AI SDK, zod, Prism and the Ask panel are async chunks.

Noted and left alone:

- The production `payload_jobs` table was empty: the daily sweep (`cloudflareMediaSweep`) has
  never queued, so a sync the upload hook misses is never retried. `/api/payload-jobs/run`
  answers 429 from outside, which is the WAF; whether Vercel's own cron reaches it is unverified.
- The `dark` variant's polarity selector (`src/styles/shadcn-theme.css`, about 940 bytes) is
  repeated on each of the 57 rules that use it, mostly the ported shadcn `dark:` utilities: about
  54 KB of the 333 KB raw stylesheet. Production serves it brotli, which costs about 250 bytes
  (34.5 KB with it, 34.2 KB with a one-class stand-in), and each copy is matched only on elements
  that carry its utility. Left as is. A new colour that flips with the ground goes in
  `palette-light` / `palette-dark` as a token, not a `dark:` utility.
- `ImageMedia` inlines the same generic 2.6 KB blur placeholder per image. Brotli hides that too.
- A few videos not on Stream still play from `r2.dev` through `<source>`.
- An R2 custom domain would need the `milesroxas.com` zone on Cloudflare; its DNS is on Vercel.
  With Cloudflare Images holding every image, nothing on the site reads `r2.dev` for an image.
