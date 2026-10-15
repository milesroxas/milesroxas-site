---
version: 1
slug: "src-app-frontend-works-page-tsx"
primary_target: "src/app/(frontend)/works/page.tsx"
related_targets: ["src/sections/WorkDial"]
---

# Works index

Scope: the works landing at /works. Visitor mode: Experience inside an Operate habit; hiring teams skim every case study and pick what to open.

Audience and job: a reviewer with little time who wants the whole body of work at a glance, then one click into a case study.

Source of approval: on 2026-10-06 the user rejected the plate-beside-rows index for /works and pinned the dial: one fixed picture in the centre that morphs as the page scrolls, titles scrolling vertically past it, inactive rows dimmer and smaller the nearer they are to the page edge, like a rotary. More work (case study endings) keeps the plate-beside-rows index. Heading and lead are edited in the Works index global. Later the same day the user removed the right column (industry and services), set the plate to the case study hero's aspect, and asked for a drum bulge, then moved the titles to the right of the plate held the heading at the middle left (centred between browser edge and plate), widened the row gap and asked rows to blur as they disappear: rows dim and shrink along a smooth curve, neighbours spread from the centre row and gather at the edges.

On 2026-10-14 the user said the phone dial made browsing hard and asked for a faster mobile index built for browsing, with desktop unchanged. Below 64rem the index is now a list of cards; a card opens its case study by carrying its picture to the hero frame (`work-travel`). Only the first screen plays an entrance (picture wipe, then copy).

## Direction contract

THESIS: /works is a dial, not a feed. One picture holds the centre; the list turns past it and the row on the centre line is the work you are looking at. Refuses card grids, side-by-side plate and list, and pictures repeated per row.

OWN-WORLD: the site's ink-on-paper system. Centre plate at the case study hero's 1.6 frame (desktop width 41.25vw, the hero's own) with the existing WebGL dither dissolve, scrubbed by scroll position. While it sweeps, the frame's edge frays through a second dither and each cell prints as one-bit halftone in the page's ink as it flips; at rest the edge is straight. Titles are light (300), as on the homepage. Desktop: heading and lead held level with the centre line, centred between the browser edge and the plate; titles turn on the right of the plate. Below 64rem (phones, tablets): no dial. A natively scrolled list (`src/sections/WorkDial/WorkList.client.tsx`), one column, two from 40rem: each work has its own 1.6 picture, a mono caption with client, rule and industry, a light title and a two-line summary. Nothing is pinned and nothing runs on scroll. Row ink and scale fall off along a bell from the centre line, and rows blur as they fade out; rows sit on a drum (sine spacing) with a slight tilt. Mono caption under the plate: client and position.

STORY: the reviewer reads "Work" and its count, scrolls, watches each picture dissolve into the next as its row reaches the centre, clicks a row or the picture, and it opens into the case study hero.

FIRST VIEWPORT: desktop, heading and lead middle left on the centre line, titles right of the plate, plate centred between top bar and dock, first row on the centre line, the next rows dimming below. Phone: heading and lead, then the first card's picture.

FORM: user-pinned dial; no concept roll (structured-question answer, 2026-10-06).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
