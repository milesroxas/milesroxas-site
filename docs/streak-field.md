# Streak Field guide

The Streak Field is the site's signature WebGL effect and one of the two shaders that double as **CMS media**: an editor can pick it instead of an image or video on a hero or a media block.

This is the practical guide: what every control does to the picture, how the pieces fit together, and the rules that keep it fast and legible.

- Looks are authored in the Studio plugin: [streak-field-studio.md](streak-field-studio.md) is the editorial workflow, [studio-effects.md](studio-effects.md) the contract an effect meets to be authorable there.
- The defaults/presets contract that both immersive effects share is in [immersive-effects.md](immersive-effects.md).

## Contents

- [The two faces](#the-two-faces)
- [Quick start](#quick-start)
- [Control reference](#control-reference)
- [Shipped looks](#shipped-looks)
- [Editor controls (Payload)](#editor-controls-payload)
- [How a visual resolves](#how-a-visual-resolves)
- [Placement policy and admission](#placement-policy-and-admission)
- [Lifecycle: poster, live, failure](#lifecycle-poster-live-failure)
- [Posters](#posters)
- [Best practices](#best-practices)
- [Authoring a look](#authoring-a-look)
- [Adding a shipped look](#adding-a-shipped-look)
- [Troubleshooting](#troubleshooting)

## The two faces

| Face | Entry | Who uses it |
|------|-------|-------------|
| **Effect component** | `StreakField` from `src/features/immersive/ui/streak-field.tsx` | Stories, inside the feature only. Owns its own canvas, takes the full props bag. |
| **CMS visual** | `StreakVisual` / `Visual` from `@/features/immersive/visual` and `@/components/Visual` | Shipped pages. Poster first, look ids only, code-owned ceilings. |

The light entry (`@/features/immersive/visual`) imports no Three, so Payload config, server resolvers and validation hooks can read it. Only `StreakVisual` reaches the runtime chunk, and only after every gate passes.

| Layer | File |
|-------|------|
| Props, defaults, `resolveStreakTuning` | `src/features/immersive/ui/streak-field-tuning.ts` |
| GLSL | `src/features/immersive/ui/streak-field-shader.ts` |
| Shared scene (`FieldScene`) | `src/features/immersive/ui/streak-field-scene.tsx` |
| Story owner (own canvas) | `src/features/immersive/ui/streak-field.tsx` |
| Production owner (gated canvas) | `src/features/immersive/ui/streak-field-runtime.tsx` |
| Looks, descriptor, compose, placement, admission, capability, posters | `src/features/immersive/visual/` |
| Studio contract: authorable parameters, faces, limits | `src/features/immersive/studio/effects/streak-field.ts` |
| Payload field factory | `src/fields/visual.ts`, `src/fields/visual-validate.ts` |
| Studio plugin (looks collection, publish, slot picker, admin UI) | `src/plugins/streak-studio/` |
| Inspector copy: labels, meanings, dependencies | `src/plugins/streak-studio/components/copy/streak-field.ts` |

## Quick start

**Editor.** On a hero or a supported block, set **Visual** to `Streak Field`, pick a **Look** (a shipped look, or one made in Studio), save. A seed is assigned on save for a shipped look. Optionally set speed, intensity, pointer response, or an approved poster image. The media upload can stay in place: it is kept but neither fetched nor shown in a block; a hero keeps showing it beside the effect.

**Developer, shipped page.** Resolve at the server boundary, render through `Visual`:

```tsx
import { resolveVisual } from '@/features/immersive/visual'
import { Visual } from '@/components/Visual'

const visual = resolveVisual(slot, { seedKey: doc.id })
// …
{visual && <Visual visual={visual} placement="hero" priority fill sizes="100vw" />}
```

**Developer, a story.** Use the effect directly, deltas only:

```tsx
import { STREAK_FIELD_BACKDROP } from '../presets'
import { StreakField } from './streak-field'

<StreakField {...STREAK_FIELD_BACKDROP} surface="dark" />
```

## Control reference

Every knob is defaulted in `STREAK_FIELD_DEFAULTS` and documented on `StreakFieldProps`. Pass deltas only; anything you do not pass falls through. The tables below say what each control changes about the picture and what it interacts with.

### Canvas

| Control | Default | What it does |
|---------|---------|--------------|
| `count` | 8000 | Streaks alive in the buffer. One draw call regardless, so this is density and fill rate, not CPU. On `grid` it caps how many cells fill; the scene widens both pitches (`coveragePitch`) so the frame stays covered instead of rows truncating at the bottom. The default is the ceiling the most generous placement grants (`PLACEMENT_LIMITS.hero`), since every live path caps the look's count against its placement first; it is also the top of the Studio's Count slider. |
| `dpr` | 2 | Device-pixel-ratio cap. Streaks are a pixel or two thick, so 2 keeps them crisp and 1 makes them mushy. The single biggest fill-rate lever after `count`. |
| `seed` | 694 | Seeds the per-streak hashes. Same seed, same composition, every load. |
| `segments` | 1 | Quads per streak. 1 is a rigid dash. Raise it only when a streak must visibly bend along the flow; it costs vertices, not draw calls. The Studio envelope fixes it at 1. |
| `surface` | `dark` | The ground. Over `dark` the streaks add light (`ink`); over `light` they are ink (`paperInk`). |
| `surfaceEase` | 15.5 | Crossfade rate per second when `surface` flips. The DOM ground usually snaps, so keep this short. |

### Layout

| Control | Default | What it does |
|---------|---------|--------------|
| `layout` | `rows` | `rows` scatters streaks along their rows at random phases (the tape look). `grid` pins instance `i` to cell `i` of a row and column grid (the tick-plot look). |
| `shape` | `dash` | `dash` is a streak `thickness` high and `minLength`..`maxLength` long that bends with the field. `dot` is a disc: the length knobs become its diameter, `thickness` is unused, `cap` softens the rim, and it stays rigid. |
| `columnPitch` | 4 | Horizontal cell spacing in CSS px. `grid` only. |
| `rowPitch` | 4 | Vertical row spacing in CSS px. Together with `count` this sets apparent density. |
| `rowJitter` | 0 | How far a streak may sit off its row, as a fraction of the pitch. 0 is a strict grid, above 0 loosens it toward a scatter. |
| `thickness` | 2.8 | Streak height in CSS px. |
| `minLength` / `maxLength` | 4 / 7 | Length range in CSS px. Equal values give a uniform tick field where orientation, not length, carries the shape. |
| `lengthBias` | 6 | Length distribution. 1 is uniform; higher skews the population toward short ticks with a few long ones. |

### Motion

| Control | Default | What it does |
|---------|---------|--------------|
| `motion` | `drift` | `drift` slides streaks along their rows while the field morphs under them: stateless, deterministic, no simulation pass. `flow` advects particles through the field on the GPU, so ticks stream out along the flow and respawn at their layout position when their life ends. `flow` allocates render targets and needs a renderable float target. |
| `flowSpeed` | 40 | `flow` only. Speed along the field direction in CSS px/s. |
| `drift` | 4 | Speed along the rows in CSS px/s. Negative creeps left, 0 holds still. Under `flow` it acts as a wind on top of the advection. |
| `driftSpread` | 0 | Per-streak speed variance, 0..1. Above 0 the field stops moving as one sheet. |
| `timeScale` | 1.2 | Playback rate for everything time-driven, advection included. 0 freezes the field; with no pointer terms the runtime then draws on demand and stops. |

### Flow field

The noise both displaces the field and supplies the height the relief reads. That second job runs even when `noiseStrength` is 0, which is exactly what the default look does: no displacement, but a slow fbm height map lighting the rows.

| Control | Default | What it does |
|---------|---------|--------------|
| `noise` | `fbm` | Formula. `none` keeps streaks on their rows (no displacement, no relief, no orientation). `value` is a boxy lattice drift, `simplex` a smooth isotropic one, `fbm` adds octaves of detail, `ridged` creases the field into seams, `curl` takes the curl of an fbm potential (a divergence-free swirl that runs along contours), `gradient` its slope (straight up the hill). |
| `noiseScale` | 1080 | Size of one feature in CSS px. Larger is a broader, slower swell; smaller is busier chop. |
| `noiseStrength` | 0 | How far the field may push a point, in CSS px. 0 means the noise only shades and orients, never displaces. |
| `noiseSpeed` | 0.08 | How fast the field evolves, in noise units per second. 0 freezes its shape (streaks may still drift through it). |
| `noiseOctaves` | 3 | Detail octaves for `fbm`, `ridged`, `curl`, 1..6. More is finer and costlier. The Studio envelope caps it at 3 (2 under `curl` and `gradient`). |
| `noiseGain` | 0.5 | Amplitude ratio between octaves, 0..1. Higher is rougher. |
| `noiseAxis` | 0.5 | Which way the displacement acts, 0..1. 0 bends rows up and down only, 1 bunches streaks along their rows only, 0.5 does both. |
| `orient` | 0 | How far each dash turns to face the field direction at its centre, 0..1. 0 stays on the row, 1 is a full tick plot. With `curl` the ticks follow contours; with `gradient` they climb. Values between read as a lean, so the rows are still legible. |

### Relief

Relief is what makes the field read as lit terrain rather than noise. It reads the noise potential as height.

| Control | Default | What it does |
|---------|---------|--------------|
| `relief` | 0.73 | How much height shades brightness, 0..1. 0 ignores height entirely. |
| `reliefFloor` | 0.42 | Height below which ground goes dark, 0..1. Raise it and only the crests survive out of black. |
| `reliefContrast` | 1.65 | Exponent on the shade. 1 is linear; higher pushes light onto the peaks and empties the mid-slopes. |
| `reliefLength` | 0.82 | How much height scales length, 0..1. Low ground shrinks to a dot, so altitude reads as size as well as brightness. |

### Pointer

Pointer terms only run where the placement allows them and the editor enabled them. `pointerRadius: 0` turns every term off and lets the scene skip its listeners.

| Control | Default | What it does |
|---------|---------|--------------|
| `pointerRadius` | 420 | Reach of the influence in CSS px. 0 is off. |
| `pointerPush` | 0 | Radial displacement in CSS px. Negative pulls the field inward. |
| `pointerSwirl` | 0 | Tangential displacement: a vortex around the cursor. |
| `pointerWake` | 0.19 | Displacement along the pointer's own motion, in seconds of its velocity (0.04 moves the field 40 px at 1000 px/s). Capped at the radius. This is what makes a flick read as a shove. |
| `pointerAgitate` | 4.2 | Extra flow amplitude under the pointer, as a multiple of `noiseStrength`. Does nothing when `noiseStrength` is 0. |
| `pointerGlow` | 2.15 | Extra brightness under the pointer, as a multiple of the streak's own. |
| `pointerLift` | 0.25 | Height added to the relief under the pointer, -1..1. Negative digs a hollow. |
| `pointerEase` | 3 | How fast the field's pointer follows the real one, per second. Lower is lazier and heavier. |

### Life

| Control | Default | What it does |
|---------|---------|--------------|
| `lifetime` | 11.4 | Seconds a streak lives before fading and being reborn elsewhere on its row (in its cell, under `flow`). |
| `lifeSpread` | 0.62 | Per-streak lifetime variance, 0..1. Keeps the field from breathing in unison. Push it up whenever the whole field visibly pulses. |
| `fadeIn` / `fadeOut` | 0.05 / 0.09 | Fraction of the life spent fading in and out. |

### Look

| Control | Default | What it does |
|---------|---------|--------------|
| `ink` | `[0.518, 0.655, 1]` | Streak colour over a dark ground. Emissive: it only ever adds light. |
| `paperInk` | `[0.31, 0.361, 0.502]` | Streak colour over a light ground. |
| `brightness` | 1.18 | Overall intensity. Over dark it is brightness; over light it is coverage. |
| `brightnessSpread` | 0.51 | Per-streak brightness range, 0..1. 0 is a flat field; 1 lets streaks go fully dim, which is what gives depth. |
| `flicker` | 0.31 | Depth of the per-streak shimmer, 0..1. Reads as signal over dark and as print noise over light, so paper looks run it lower. |
| `flickerRate` | 0.7 | Shimmer rate in Hz. |
| `tail` | 0.42 | How much a streak fades head to tail. 0 is a flat dash. |
| `cap` | 2 | Softening at each end, in CSS px. On `dot` it softens the rim. |

### Control-flow props (not tuning)

`force` (mount despite low-power or reduced-motion flags, stories only) and `className` are not part of the defaults contract. Neither are the Studio Inspector's ranges and steps: those come from the effect's contract (`studio/effects/streak-field.ts`), which points at the defaults and never restates one.

## Shipped looks

Looks are stable versioned ids stored as text (`src/features/immersive/visual/looks.ts`). Each maps to a delta-only preset in `src/features/immersive/presets.ts`. No enum, no migration.

| Id | Label | Motion | What it is |
|----|-------|--------|-----------|
| `signal-v1` | Signal | drift | The defaults as shipped: a fine tick grid lit by a slow fbm relief, creeping right. No displacement, no orientation, all shape from relief. |
| `backdrop-v1` | Quiet backdrop | drift | `STREAK_FIELD_BACKDROP`: 900 streaks, 18 px rows, a slow leftward creep, shimmer down. Built for copy to sit on. |
| `topography-v1` | Topography | flow | `STREAK_FIELD_TOPOGRAPHY`: a 12000-tick grid streaming along `curl` contours, full `orient`, relief at 1 with a low floor. Ridges read as lit relief, valleys fall into black. |
| `depth-map-v1` | Depth map | flow | `STREAK_FIELD_DEPTH_MAP`: the same grid leaning up the slope (`gradient`, `orient` 0.6), broader noise, high floor, so only crests surface as one soft form. |
| `technical-lines-v1` | Technical Lines | drift | `STREAK_FIELD_TECHNICAL_LINES`: thin, long strokes in a cooler blue. A sparse schematic overlay, not a tick grid. |
| `technical-b2b-v1` | Technical B2B | flow | `STREAK_FIELD_TECHNICAL_B2B`: a sparse grid of bent dashes streaming along a simplex field, fully oriented, cyan on dark. |

`STREAK_FIELD_PAPER` is not a look. It is the light-ground delta (denser stroke, less shimmer) that `composeStreakTuning` folds in automatically whenever the ground is light.

`STREAK_LOOK_REVISION` versions rendered derivatives. Bump it when a shared default or a shipped look changes, then replace the posters: Payload revisions version content, not deployed TypeScript.

## Editor controls (Payload)

`visualSlotFields(upload)` wraps an existing upload into a slot. Field names are identical on every parent, so one resolver reads them all, and the upload keeps its name and relation. Two factories call it: `heroVisualSlotFields` (the hero opening in `src/heros/config.ts`, where the effect grounds the band and the upload keeps its frame) and `blockVisualSlotFields` (the Stacked, Split, Split narrow and Tabs blocks, where one frame holds either the upload or the effect; each tab row is its own slot, resolved per row by `resolveRowVisuals`, `src/blocks/shared/row-visuals.ts`).

| Field | Type | Rules |
|-------|------|-------|
| `visualType` | select: `media` / effect id | Empty keeps legacy media behavior. In a block slot an effect wins over a retained upload; that upload is hidden, not deleted, and never fetched or mounted. In a hero opening the effect grounds the band instead of filling the frame, so the upload stays visible and renders beside it. |
| `shader.studio` | relationship to `streak-looks`, the `FieldPicker` component | A look made in Studio. The picker is the one control for the look: it writes `shader.preset` for a shipped look and this field for a Studio one. A page cannot publish while the look it points at was never published. Never populated: the Studio plugin hydrates it with the published snapshot and posters. |
| `shader.preset` | hidden text | A shipped look id, written by the picker. Validated against the chosen effect's looks. An unknown stored id degrades to `signal-v1` **poster only**: rendering never guesses a live look. |
| `shader.seed` | integer 0..2147483647 | Assigned on save when empty, for a shipped look. Same seed, same composition. Never derived from array order. Hidden once a Studio look is chosen. |
| `shader.speed` | 0..1 | Multiplies the look's `timeScale`. 0 freezes the field. Empty is the look as shipped. Hidden under a Studio look. |
| `shader.intensity` | 0.5..1.25 | Multiplies the look's `brightness`. Empty is the look as shipped. Hidden under a Studio look. |
| `shader.surface` | radio: follow the theme / always light / always dark | Pins one use to a face ("Appearance"): see [studio-effects.md](studio-effects.md#light-and-dark-faces). |
| `shader.pointerInteraction` | checkbox | Honored only where the placement allows pointer terms and the field runs live. |
| `shader.posterMedia` | upload, images only | Replaces a shipped look's built-in poster. Hidden once a Studio look is chosen: its own light and dark posters win. Video uploads are refused server side. |

Ranges and membership are validated on the server (`src/fields/visual-validate.ts`), not only hidden by `admin.condition`. A `required` upload becomes required-unless-effect, because hiding a field does not relax `required`.

Code owns what editors never see: DPR, segments, noise complexity, simulation, backend, transitions. Raw shader code, arbitrary props and `force` are never accepted from CMS data. Page editors pick a look and its bounded multipliers, nothing else; `count` and every other authorable parameter are set one level up, in Studio, bounded by the same ceilings ([streak-field-studio.md](streak-field-studio.md)).

## How a visual resolves

Server boundary, once:

```
resolveVisual(slot) -> Visual = { kind: 'media', media } | { kind: 'streakField', descriptor } | { kind: 'lightLeak', descriptor }
```

Then, in the client slot:

```
STREAK_FIELD_DEFAULTS
  -> look deltas (STREAK_LOOKS[id].tuning)
  -> STREAK_FIELD_PAPER          (only when the ground is light)
  -> editor multipliers          (timeScale * speed, brightness * intensity, pointerRadius or 0)
  -> placement ceilings          (count capped, dpr capped, pointer and flow allowed or not)
```

That is `composeStreakTuning` (`visual/compose.ts`). A published Studio look replaces the first three steps with its snapshot for that ground, then goes through `limitStreakTuning`. Nothing along the chain restates a default, and ceilings only ever lower a look, never raise it.

The ground polarity is read from the stylesheet (`readGround`, the computed `color-scheme`) through `useGroundSurface`: a `[data-theme]` pin, an inverted band, else the site theme. An inverted Section band can therefore ground a dark field on a light page. An editor can pin one use to a face instead (`shader.surface`).

## Placement policy and admission

`PLACEMENT_LIMITS` (`visual/placement.ts`) is the code-owned budget. These are calibrated starting values, not measured capacity.

| Placement | Live | DPR cap | Count cap | Flow | Pointer |
|-----------|------|---------|-----------|------|---------|
| `hero` | yes | 1.5 | 8000 | yes | yes |
| `block` | yes | 1 | 4000 | yes | yes |
| `menu` | yes | 2 | 1000 | yes | no |
| `card` | no | 1 | 0 | no | no |

`menu` is a ceiling the Studio stage can preview; no page surface on this site renders a Streak Field at it. Cards (More work, More posts, the contact page's recommendations) render posters only.

- **One live field per document** (`STREAK_KIND_CEILING`), inside the document GPU budget shared with every other canvas (`src/lib/webgl/gpu-budget.ts`: `GPU_LIVE_CEILING` contexts in total across Streak Fields, light leaks and the More work plate). A slot holds a `streak` lease (`useGpuLease`) at `hero` > `block` > `backdrop` (menu) > `overlay` (card) on the shared `GPU_PRIORITY` scale; a light leak slot ranks by the same placement table. A hero field outranks a block field; a block field ties with a block leak and with the More work plate and yields to an earlier arrival; a bare `LightLeak` component holds `overlay` and ranks last. Release is idempotent, so a stale cleanup can never switch another slot off. `<html data-gpu-leases data-gpu-admitted data-gpu-contexts>` shows the live numbers.
- **One step down, then the poster.** A frame watchdog (two consecutive slow 90-frame windows averaging worse than 40 fps) drops to `degradedLimits`: half the particles (500 at least) at DPR 1. A second trip fails to the poster. There is no step back up.
- **Grid coverage is preserved when count is capped.** `coveragePitch` widens both pitches rather than truncating rows.
- `NEXT_PUBLIC_STREAK_LIVE=off` turns live rendering off for a deployment (`visual/rollout.ts`). Posters still render; nothing falls back to a retained upload.

### Support matrix

| Surface | Live | Poster |
|---------|------|--------|
| High impact, Medium impact and Editorial (post) heroes, through `HeroGround` | yes (`hero`) | yes |
| Stacked (`fullMedia`), Split (`mediaContentSplit`), Split narrow (`splitContentNarrow`), Tabs (`featureTabs`), top level or inside a Section | yes (`block`) | yes |
| The posts index ground (`PostsIndex`, the shown post's hero visual under the list) | yes (`block`) | yes |
| Work cards, post cards, contact recommendations | no | yes |
| Reduced motion, coarse pointer, software renderer, no WebGL2, live switch off | no | yes |

## Lifecycle: poster, live, failure

`StreakVisual` exposes its state as `data-visual-status`, which is also what stories and tests assert on.

```
poster -> preparing -> live -> suspended -> poster
                  \-> failed (never retries)
```

A live field is admitted only when **all** of these hold (`visual/use-live-visual.ts`): hydrated, placement allows live, descriptor not degraded, no `prefers-reduced-motion`, not paused, not a coarse-pointer device, WebGL2 probe passed without a software renderer, a renderable float target for `flow` looks, near the viewport, document visible, the owner's `active` (hero intros hold it), and a lease under the ceiling. The `usePageCovered` gate (a page frame marked `inert`, or `data-menu-handoff` on the document) is wired but nothing on this site sets either attribute.

- The server HTML always contains a real `<img>` poster in a stable frame. A canvas `cloneNode` copies no pixels, so the poster is load bearing, not decoration.
- Reveal happens on the **first drawn frame of the current generation**. A late callback from a previous seed, route or lost context cannot reveal a blank buffer.
- Suspension parks the canvas at `frameloop="never"` and releases the lease. After 8 s the poster fades back and the canvas unmounts.
- Failures (`context`, `shader`, `context-lost`, `flow-unsupported`, `performance`, `chunk`) restore the poster and stop. No retry loops, ever.
- `context-lost` means the browser took the context from a running field. R3F tears every unmounted canvas down with `forceContextLoss()` about 500 ms later, which logs `THREE.WebGLRenderer: Context Lost.` in the console; the runtime's `ContextGuard` (shared with every other effect, `src/lib/webgl/components/context-guard`) is removed with the tree at unmount, so a release or a route change is never reported as a failure. That log line on its own is teardown, not a GPU reset. See [immersive-effects.md](immersive-effects.md#contexts-the-document-budget-and-real-loss).
- A document-wide pause exists in code (`visual/motion-preference.ts`, read by `useMotionPaused`; kept in sessionStorage). It stops work and releases leases; it does not set speed to zero. Nothing in the site chrome toggles it today.

## Posters

- Shipped looks: `public/images/streak-field/<look>-<surface>.webp` at 1600x900, one per look and ground polarity, served with `?v=<STREAK_LOOK_REVISION>` so the optimizer cache follows the revision.
- Studio looks: the two posters are rendered in the editor's browser and filed in Media when the look is published ([streak-field-studio.md](streak-field-studio.md#rendering)); they outrank an editor's `posterMedia` upload, which outranks the shipped still (`visual/posters.ts`).
- **They carry alpha.** The CSS ground beneath (a Section band, the hero's `bg-background`) supplies the colour, so the still composites exactly as the live field does.
- Both twins ship. `globals.css` ("Visual posters") shows one based on the `dark` variant (the ground's polarity), so the server HTML already carries the right still.
- This repo carries no poster script. The shipped stills were rendered before the port; to change one, author the look in Studio (its Export tab renders a still at a chosen size) or copy a still rendered elsewhere into the folder, then bump `STREAK_LOOK_REVISION`.
- A preset poster represents the **look**, not any one entry's seed. When an editor needs exact artwork, they upload one to `shader.posterMedia` or publish a Studio look.

## Best practices

**Tuning**

- Never restate a default. Not in a preset, not at a call site, not in the Studio contract.
- One usage, inline props. A second usage, promote it to a named preset in `presets.ts` and import it from both. That is the rule of two.
- Deltas only in `STREAK_LOOKS[...].tuning`, and remember that changing a shared default changes every shipped look and the top of the Studio's sliders. Review them all, replace the posters, bump the revision.

**Performance**

- Reach for `count` and `dpr` first; they dominate. `segments` above 1 and `noiseOctaves` above 3 are the next costs (the Studio envelope forbids both).
- `flow` adds a simulation pass and render targets. Use it only where the look needs particles to leave their cells, and expect it to degrade to a poster on contexts with no renderable float target.
- Do not raise a placement ceiling to make a look work. Re-tune the look.
- Frozen fields (`timeScale` 0, no pointer terms) should stay frozen: the runtime already runs them on demand and stops after the eases settle.

**Composition and legibility**

- Copy sits over the field, so check contrast at the busiest frame, not at rest. `backdrop-v1` exists for exactly this.
- Pair the ground, do not fight it: let a Section band pin polarity, and let `composeStreakTuning` fold in `STREAK_FIELD_PAPER` rather than hand-tuning a second light look.
- Equal `minLength` and `maxLength` when orientation is the subject; a wide range plus high `lengthBias` when texture is.
- Raise `lifeSpread` whenever the field visibly breathes in unison.

**Integration**

- Resolve once, on the server, with `resolveVisual`. Never re-resolve in a client component.
- Always pass a stable `seedKey` (document or block id). Never an array index: reordering must not reshuffle the field.
- The poster `<img>` must stay inside the slot's frame. Do not replace it with the canvas.
- Blocks keep the Section spacing contract: a shader source does not create a full-viewport section and never writes its own `py-*`.
- New media references need `collectVisualMediaRefs` coverage (`src/fields/visual-refs.ts`) so publish checks and revalidation see `shader.posterMedia`.
- Every new visual UI ships a Storybook story, including the poster, failure and light/dark cases.
- `force` is stories only. The `Visual` adapter does not forward it, and CMS data can never reach it.

## Authoring a look

Looks for pages are made in Studio, not in code: open the slot's picker, choose **New field**, tune it in the drawer, **Publish**. The posters render in the browser and the page updates on its own. The full editorial workflow (drafts, history, compare, the Inspector, Export) is in [streak-field-studio.md](streak-field-studio.md#editorial-workflow). The parameters the Inspector offers, their ranges and the production envelope are the contract in `src/features/immersive/studio/effects/streak-field.ts`; their labels and one-line meanings are `src/plugins/streak-studio/components/copy/streak-field.ts`.

## Adding a shipped look

A shipped look is code: a preset every editor sees in the picker without opening Studio.

1. Preset in `src/features/immersive/presets.ts`, deltas only, with a comment on the art direction, not only the numbers.
2. Entry in `STREAK_LOOKS` (`visual/looks.ts`): stable versioned id (`name-v1`), label, one-line description for the picker, and `motion` set to `drift` or `flow` so the runtime can gate float-target support.
3. Both posters in `public/images/streak-field/` (see [Posters](#posters)), then bump `STREAK_LOOK_REVISION`.
4. Story coverage for the new look on dark and light grounds (`ui/streak-field.stories.tsx`).
5. No migration. The id is text and the allowlist is code.

Removing a look is a **content** change: keep its id, entry and posters until every stored document has been updated.

## Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| Poster shows, canvas never mounts | Check `data-visual-status`. `poster` means a gate is unmet: placement, reduced motion, coarse pointer, offscreen, the owner holding `active`, or another slot holds the only lease. |
| `THREE.WebGLRenderer: Context Lost.` in the console with no `failed` slot | Routine: R3F force-loses the context of every unmounted canvas (an 8 s release, a route change). Only a slot whose status is `failed` with `data-visual-failure="context-lost"` is a real loss. Read `<html data-gpu-contexts>` for the contexts that exist right now. |
| Slot stays `poster` while another canvas is live | The document budget is full (`data-gpu-admitted` equals `GPU_LIVE_CEILING`) or another Streak Field holds the one `streak` slot. A hero field outranks a block field; a block field yields to an earlier arrival. It mounts once a slot frees. |
| `data-visual-status="failed"` | Read `data-visual-failure`: `context` (no WebGL2 or a performance caveat), `shader`, `context-lost`, `flow-unsupported` (no renderable float target for a `flow` look), `performance` (watchdog gave up), `chunk` (runtime failed to load). |
| Field runs, then drops back to a still | The frame watchdog stepped down and then failed. Lower the look's `count`, `dpr` or octaves rather than raising the ceiling. |
| Grid truncates at the bottom | Something bypassed `coveragePitch`. Grid density must widen pitch when `count` is capped, not drop rows. |
| Wrong ground, poster looks washed out or doubled | The ground is the `dark` variant's call (a `[data-theme]` pin, an inverted band, the site theme). Posters carry alpha, so a missing CSS ground shows as a pale or doubled image. |
| Look changed but the site still shows the old still | Posters not replaced, or `STREAK_LOOK_REVISION` not bumped. |
| Editor picked a look but it renders static everywhere | The stored preset is not a shipped id, so the descriptor is `degraded`: poster only by design. Fix the stored value. |
| Page refuses to publish over a Studio look | The look has nothing published yet (no snapshot, no posters). Publish it in Studio first, or pick a shipped look. |

## Related

- [streak-field-studio.md](streak-field-studio.md): the Studio, where looks are authored and published.
- [studio-effects.md](studio-effects.md): the contract an effect meets to be authorable, slots, faces, the light leak.
- [immersive-effects.md](immersive-effects.md): the defaults/presets contract shared by both effects and the document GPU budget.
- [performance.md](performance.md): the load contract and the measurement scripts under `scripts/perf/`.
