---
version: 1
slug: "src-components-sitechrome"
primary_target: "src/components/SiteChrome"
related_targets: []
---

# Site chrome

Scope: the persistent chrome on every public route (top bar, dock, Ask). Visitor mode: Operate inside an Experience site; the work leads, the chrome recedes.

Audience and job: hiring teams skimming the work. They need to know where they are, where they can go, and that they can ask or reach Miles in one step.

Source of approval: Paper file "Scratchpad", page "Chrome — B revised" (11 frames: R1–R4, M1–M4, S1–S3) for structure, states and motion. Revised by the user on 2026-09-29: the dock and Ask were too large and too round; they are now compact concentric rounded rectangles in real glass. Revised again the same day: still too round against the rest of the site, so every chrome corner now comes from the site's own radius scale. Sizes, corners and materials below supersede the Paper frames; the tokens in `globals.css` are the source of truth.

## Direction contract

THESIS: Pages are always visible as tabs; Ask is a separate action beside them. Refuses the hidden-menu takeover and the search-field-as-navigation capsule.

OWN-WORLD: Minimal frosted glass (user-directed 2026-10-01, replacing the 2026-09-29 gradient-and-rim glass, which read forced in dark mode): one flat tint (white 78%, thick 90%; dark rgb(32 32 36) 72%, thick rgb(26 26 30) 88%) over a 20px frost at 140% saturation (thick 32px); a 1px hairline at 8% ink (white 8% in dark) and one soft drop shadow. No gradient, no rim, no bevel highlight. Dark glass over dark bands. Nothing stacks on the glass: no sheen, no veil, no scroll-edge fades, no fill in the collapsed phone tab. Legibility first. Corners are concentric rounded rectangles, never capsules, on the site's own radius scale (the cards' and media's): dock, Ask button, field, close and panel 8px (`--radius`) at every size; tabs and the send button 4px inside (`--radius-sm`); suggestion rows, sources, the handoff card and question bubbles 6px (`--radius-md`). IBM Plex Sans 13px in the dock, 600 selected / 500 rest, every label full ink. One orange Ask glyph. Selected tab is a 7% ink fill (9% white in dark).

STORY: A reviewer lands, reads the work, sees Home · Work · Posts · Contact with the current page filled, asks a question when browsing is slower than asking, and reaches Miles from any answer.

FIRST VIEWPORT: Wordmark top-left 32px in, New York clock top-right, nothing else on top. Dock centred 24px from the bottom: 40px tab bar (4px inset, 32px tabs), 8px gap, 40px Ask button. Phone: 52px icon tab bar + 52px square Ask, 16px from the sides, 12px up. Ask panel 560px wide; its field and close button are the dock's height and corner.

FORM: Approved Paper direction B revised (iOS 26 tab bar + separate search-role action), user-locked; no concept roll. Compact glass revision user-requested 2026-09-29.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

Ask widens out of its button into the field while the tabs step back (fade, 0.96, 8px blur); the button's label, carried inside the field, blurs out as the field's contents sharpen in; the panel grows up from the field's top edge. Close plays the same path back and lands as the button, label already in place.

## Open

- Suggested questions live in Site Info › Ask (new field, needs a migration).
- Source rows keep glyphs; the Paper thumbnails need image data the Ask endpoint does not stream.
