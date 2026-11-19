# CTA link

One call to action that opens a work, a post or an external link, in the aim-field language. Block `ctaLink` (`src/blocks/cta-link`), in the Section run, so Pages, Works, Posts and the Home global all offer it (Forms & CTAs group).

Decided 2026-11-19 from the `/proto/cta` picker (DialKit on each look). All three looks shipped as the block's `variant`; the tuned values live in `src/blocks/cta-link/look.ts`.

## The looks

| Variant | What it is | When |
|---|---|---|
| Instrument (default) | Spec sheet beside an ink panel. Pointing wakes the panel and paints the target's picture in through 32px cells (mosaic, then sharp); the yellow readout counts `NNN/100`. Past 85% the rest floods in. | A work with a strong picture |
| Field | Full-bleed band, the field as ground, the title as display type (clamp 2.75–8rem). Hover inks the title orange. | Closing a page; it spends the page's one full-bleed break |
| Strip | One quiet row between rules; the field opens behind it from the pointer's entry point, 600ms in, 360ms out. | Between sections, repeatable |

## Shared behaviour

- The whole block opens the target. A pointer click holds 650ms so the ripple and hit read before the page leaves; the title link is the keyboard path (Enter and modified clicks go straight through).
- The reticle snaps to the pointer (`lockMs: 0`, `follow: 0`) and locks on every part: metadata by line, the description and each fact as a whole (`data-aim="block"`), the action as a control (orange corners).
- Corner arms scale with the lock: 15% of the box's shorter side, 6–200px (`armRatio`, `armMin`, `armMax`).
- Reticle lines are white under `mix-blend-mode: difference`, so they read on paper, ink and pictures; over Instrument's panel they are signal orange. The crosshair is DOM over the content, 20% opacity, 12px clear of the pointer.
- The cursor cluster is radius 1 (3×3 cells) with an orange core.
- The site cursor is cut at the block's edge (`[data-cursor-zone]`, `src/providers/Cursor/zones.ts`), so it hands over to the reticle instead of swapping.
- A work resolves through `resolveVisibleWork` (a protected work shows its fallback, or the block hides); members-only and draft targets hide it. Part numbers: `MR–16–W` + the work's place in the visible work list, `P–` + the post id.

## Engine options added to the aim field

All opt-in; existing heroes and Media list are unchanged.

- `data-aim="block"` locks a whole element as text (`aim.ts`).
- `lockMs` may be 0 (snap).
- `armRatio` / `armMin` / `armMax` (0 keeps the old fixed arm).
- `data-tone="invert" | "spot"` on the reticle root.

## Rejected along the way

- Stretched-link block (`::after` over the section): every point locked on the headline and the click left before the ripple played.
- Line-by-line locks on the description and facts: read as noise; whole boxes read as targets.
- Square cell outlines for the brush cursor: too busy; a 40px ring on the pointer matches the site cursor.
- Orange crosshair over the panel: too loud; it stays neutral.
- Trailing ring and box (200ms follow, 140ms lock ease): read as lag.
- Instant hide of the site cursor on entry: a hard swap; clipping at the edge reads as one cursor handing over.
- Blanking the panel's field under the lock: the shader vanished on hover; the panel's field takes no lock.
