---
version: 1
slug: "src-components-sitechrome"
primary_target: "src/components/SiteChrome"
related_targets: []
---

# Site chrome

Scope: the persistent chrome on every public route (top bar, dock, Ask). Visitor mode: Operate inside an Experience site; the work leads, the chrome recedes.

Audience and job: hiring teams skimming the work. They need to know where they are, where they can go, and that they can ask or reach Miles in one step.

Source of approval: Paper file "Scratchpad", page "Chrome — B revised" (11 frames: R1–R4, M1–M4, S1–S3) for structure, states and motion. Revised by the user on 2026-09-29: the dock and Ask were too large and too round; they are now compact concentric rounded rectangles in real glass. Sizes, corners and materials below supersede the Paper frames; the tokens in `globals.css` are the source of truth.

## Direction contract

THESIS: Pages are always visible as tabs; Ask is a separate action beside them. Refuses the hidden-menu takeover and the search-field-as-navigation capsule.

OWN-WORLD: Liquid glass after Codrops' "Infinite Liquid Glass Grid" (user-directed 2026-09-29): the backdrop refracted through a superellipse bevel with per-channel dispersion (SVG backdrop filter, Chromium), a light 3px frost at 180% saturation, a thin tint (white 60%), a fresnel environment and rim drawn for each surface's size, a 0.5px ink hairline and a soft lift; dark glass (#1E1E21 62%) over dark bands. No gradients: no sheen, no scroll-edge fades. Surfaces that hold reading (Ask panel, phone sheet) are thicker glass: 82% tint, 16px frost, deeper lift. Corners are concentric rounded rectangles, never capsules: dock 12px outside, 8px inside (phone 16/12); Ask panel 16px, rows 8px. IBM Plex Sans 13px in the dock, 600 selected / 500 rest, every label full ink. One orange Ask glyph. Selected tab is an 8% ink fill.

STORY: A reviewer lands, reads the work, sees Home · Work · Posts · Contact with the current page filled, asks a question when browsing is slower than asking, and reaches Miles from any answer.

FIRST VIEWPORT: Wordmark top-left 32px in, New York clock top-right, nothing else on top. Dock centred 24px from the bottom: 40px tab bar (4px inset, 32px tabs), 8px gap, 40px Ask button. Phone: 52px icon tab bar + 52px square Ask, 16px from the sides, 12px up. Ask panel 560px wide; its field and close button are the dock's height and corner.

FORM: Approved Paper direction B revised (iOS 26 tab bar + separate search-role action), user-locked; no concept roll. Compact glass revision user-requested 2026-09-29.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

Ask widens out of its button into the field while the tabs step back (fade, 0.96, 8px blur); the panel grows up from the field's top edge. Close plays the same path back.

## Open

- Suggested questions live in Site Info › Ask (new field, needs a migration).
- Source rows keep glyphs; the Paper thumbnails need image data the Ask endpoint does not stream.
