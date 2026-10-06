---
version: 1
slug: "src-app-frontend-works-page-tsx"
primary_target: "src/app/(frontend)/works/page.tsx"
related_targets: ["src/sections/WorkDial"]
---

# Works index

Scope: the works landing at /works. Visitor mode: Experience inside an Operate habit; hiring teams skim every case study and pick what to open.

Audience and job: a reviewer with little time who wants the whole body of work at a glance, then one click into a case study.

Source of approval: on 2026-10-06 the user rejected the plate-beside-rows index for /works and pinned the dial: one fixed picture in the centre that morphs as the page scrolls, titles scrolling vertically past it, inactive rows dimmer and smaller the nearer they are to the page edge, like a rotary. More work (case study endings) keeps the plate-beside-rows index. Heading and lead are edited in the Works index global. Later the same day the user removed the right column (industry and services), set the plate to the case study hero's aspect, and asked for a drum bulge, then moved the titles to the right of the plate and held the heading at the middle left: rows dim and shrink along a smooth curve, neighbours spread from the centre row and gather at the edges.

## Direction contract

THESIS: /works is a dial, not a feed. One picture holds the centre; the list turns past it and the row on the centre line is the work you are looking at. Refuses card grids, side-by-side plate and list, and pictures repeated per row.

OWN-WORLD: the site's ink-on-paper system. Centre plate at the case study hero's 1.6 frame (desktop width 41.25vw, the hero's own) with the existing WebGL dither dissolve, scrubbed by scroll position. Desktop: heading and lead held at the middle of the left column, level with the centre line; titles turn on the right of the plate. Phones: heading at the top, titles under the plate. Row ink and scale fall off along a bell from the centre line; rows sit on a drum (sine spacing) with a slight tilt. Mono caption under the plate: client and position.

STORY: the reviewer reads "Work" and its count, scrolls, watches each picture dissolve into the next as its row reaches the centre, clicks a row or the picture, and it opens into the case study hero.

FIRST VIEWPORT: desktop, heading and lead middle left on the centre line, titles right of the plate, plate centred between top bar and dock, first row on the centre line, the next rows dimming below. Phone: heading, plate pinned under the top bar, rows turning in the band beneath it.

FORM: user-pinned dial; no concept roll (structured-question answer, 2026-10-06).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
