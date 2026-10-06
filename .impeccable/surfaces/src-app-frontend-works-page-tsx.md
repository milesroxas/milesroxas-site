---
version: 1
slug: "src-app-frontend-works-page-tsx"
primary_target: "src/app/(frontend)/works/page.tsx"
related_targets: ["src/sections/WorkDial"]
---

# Works index

Scope: the works landing at /works. Visitor mode: Experience inside an Operate habit; hiring teams skim every case study and pick what to open.

Audience and job: a reviewer with little time who wants the whole body of work at a glance, then one click into a case study.

Source of approval: on 2026-10-06 the user rejected the plate-beside-rows index for /works and pinned the dial: one fixed picture in the centre that morphs as the page scrolls, titles and facts scrolling vertically past it, inactive rows dimmer and smaller the nearer they are to the page edge, like a rotary. More work (case study endings) keeps the plate-beside-rows index. Heading and lead are edited in the Works index global.

## Direction contract

THESIS: /works is a dial, not a feed. One picture holds the centre; the list turns past it and the row on the centre line is the work you are looking at. Refuses card grids, side-by-side plate and list, and pictures repeated per row.

OWN-WORLD: the site's ink-on-paper system. Centre plate (4:5 desktop, 4:3 phone) with the existing WebGL dither dissolve, scrubbed by scroll position. Titles left, industry and services right, both flanking the plate on one baseline. Row ink and scale fall off with distance from the centre line; a slight drum tilt. Mono caption under the plate: client and position.

STORY: the reviewer reads "Work" and its count, scrolls, watches each picture dissolve into the next as its row reaches the centre, clicks a row or the picture, and it opens into the case study hero.

FIRST VIEWPORT: desktop, heading top left level with the plate's top edge, lead top right, plate centred between top bar and dock, first row on the centre line, the next rows dimming below. Phone: heading, plate pinned under the top bar, rows turning in the band beneath it.

FORM: user-pinned dial; no concept roll (structured-question answer, 2026-10-06).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
