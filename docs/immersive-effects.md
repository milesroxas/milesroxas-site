# Immersive effects

How the WebGL effects are organized, tuned and reused across the site, and the single-source-of-truth contract that keeps them DRY. Authoring a look for a page happens in the Studio plugin: [studio-effects.md](studio-effects.md) is the contract that makes an effect authorable, [streak-field-studio.md](streak-field-studio.md) the editorial workflow. The Streak Field's controls and its life as CMS media are in [streak-field.md](streak-field.md).

## Where things live

| Layer | Path | Role |
|-------|------|------|
| Effect components | `src/features/immersive/ui/` | One `<effect>-tuning.ts` (props, `*_DEFAULTS`, Three-free), `<effect>-shader.ts`, `<effect>-scene.tsx`, `<effect>.tsx` (own canvas: stories) and `<effect>-runtime.tsx` (the gated canvas a slot mounts) per effect, plus the shared `overlay.ts` (in-view, pointer, first frame) and `failure-boundary.tsx`. |
| Named presets | `src/features/immersive/presets.ts` | Shipped, delta-only looks (`STREAK_FIELD_BACKDROP`, `LIGHT_LEAK_PAPER`, ...). |
| Resolve | `src/features/immersive/resolve-tuning.ts` | Folds a caller's deltas into a `*_DEFAULTS` table once, at the boundary between a component and its scene. |
| Visual contract (light) | `src/features/immersive/visual/` | Look ids, descriptors, `resolveVisual`, compose, placement ceilings, admission, capability probe, posters, the `StreakVisual` and `LeakVisual` slots. No Three. |
| Studio contract | `src/features/immersive/studio/` | `effect.ts` (`EffectContract`), `effects/<effect>.ts` (authorable parameters, faces, limits, slot capabilities), `recipe.ts`, `release.ts`, `scenes.tsx`, `capture.tsx`, `preview.tsx`, `ground.ts`. |
| WebGL infrastructure | `src/lib/webgl/` | `gpu-budget.ts` and `use-gpu-lease.ts` (the document budget), `components/context-guard` (the per-canvas census and loss report), `canvas-resize.ts`, `utils/gpu-detection.ts`, `three-console.ts`. |
| Studio plugin | `src/plugins/streak-studio/` | The looks collection, publish and export endpoints, slot hydration, and the admin UI; Inspector copy per effect in `components/copy/`. |
| Payload fields | `src/fields/visual.ts`, `visual-validate.ts`, `visual-refs.ts` | The visual slot every hero and media block carries, its server validation, and the media references publish checks follow. |

Current effects: `StreakField` and `LightLeak`, the two files in `src/features/immersive/ui`. sas-site's others (text load-ins, refraction, dispersion, floating cards, scroll gallery, backdrop) were not ported.

Two entries are public. `@/features/immersive` is the heavy one and exports only the Studio's `captureStill` and `StudioPreview`, which the plugin loads on demand. `@/features/immersive/visual` is the light one: Payload config, server resolvers and validation import it, and a slot reaches an effect's runtime through it, lazily. Nothing outside the feature imports `@/features/immersive/ui/…` except the Three-free tuning modules (the Studio copy files read them) and the shared `failure-boundary` and `overlay` helpers (the More work plate reads those).

## The single-source-of-truth contract

Every tunable number exists in exactly one place. Three mechanisms enforce this:

### 1. `*_DEFAULTS`: one exported defaults object per effect

`STREAK_FIELD_DEFAULTS` (`ui/streak-field-tuning.ts`) and `LIGHT_LEAK_DEFAULTS` (`ui/light-leak-tuning.ts`) sit beside their props types, `as const satisfies Partial<Props>`. The scene reads only a resolved tuning (`resolveStreakTuning`, `resolveLeakTuning`), never a restated default; the Studio's Inspector ranges, steps and defaults come from the effect's contract, which points at the same table. Control-flow props (`force`, `className`) are not part of the contract.

### 2. `presets.ts`: named shipped looks, delta-only

A preset holds only the props that differ from the component defaults, never a full restatement. Everything it does not set falls through, so there is nothing to keep in lockstep. `STREAK_LOOKS` (`visual/looks.ts`) maps each shipped look id to one of these presets.

### 3. The rule of two

- A tuning used in one place: inline props at the call site.
- The same tuning needed in a second place: promote it to a named preset in `presets.ts` and import it from both. Never copy a prop bag between files.

## Using an effect on a page

Pages do not pass props. An editor chooses the effect in a visual slot and a shipped look or a Studio look; the server resolves the slot once (`resolveVisual`) and the `Visual` adapter (`src/components/Visual`) renders it poster first. The workflow, the slot controls and the faces are in [studio-effects.md](studio-effects.md) and [streak-field-studio.md](streak-field-studio.md). Content (copy, media) always comes from the consumer; effects never own content.

Effects handle their own fallbacks (`prefers-reduced-motion`, no hardware WebGL2, a lost context: the poster or nothing). Consumers gate only on their own concerns.

### Contexts: the document budget and real loss

Every Canvas an effect owns mounts one `ContextGuard` (`src/lib/webgl/components/context-guard`) and holds a lease on the document GPU budget (`src/lib/webgl/gpu-budget.ts`, hook `useGpuLease`). Two things follow:

- **One budget for every canvas.** Streak Field and light leak slots, a bare `LightLeak` component and the More work plate (`src/sections/MoreWork/Plate.tsx`) are ranked together: `GPU_LIVE_CEILING` live contexts per document (3), one Streak Field among them (`STREAK_KIND_CEILING`), highest `GPU_PRIORITY` first (`hero` > `block` > `backdrop` > `overlay` > `idle`), arrival order among equals. An effect that is not admitted keeps its DOM layer (poster, media element, nothing) and mounts its canvas once a slot frees.
- **Real loss falls back, teardown does not.** The guard forwards `webglcontextlost` (and the WebGPU device-lost hook) to its owner only while the Canvas is alive; R3F's `forceContextLoss()` on unmount arrives after the guard's cleanup, so a suspension or route change is never a loss. On a real loss the effect drops its canvas and never retries for that mount: a slot restores its poster (`failed`, `context-lost`).

The registry mirrors itself onto `<html>` as `data-gpu-leases`, `data-gpu-admitted` and `data-gpu-contexts` (leases wanted, leases admitted, contexts that exist right now including parked ones), which is what devtools read. Adding a canvas-owning effect: hold a lease with a kind and a rank, mount the guard inside the Canvas, and make "not admitted" and "lost" render the same DOM fallback.

## Adding a new effect

Follow "Adding an effect" in [studio-effects.md](studio-effects.md#adding-an-effect): the Three-free tuning module, the contract under `studio/effects`, the capture and live scenes, the slot, the Inspector copy, the posters, the stories and the migration. That checklist is the whole procedure; nothing is registered anywhere else.

## What not to do

- Don't restate a component default anywhere: not in a preset, not in a consumer, not in the Studio.
- Don't build registries, config providers, HOCs or theme systems around effect tuning. Props and exported objects are the whole mechanism. The Studio's authoring contracts (`studio/effects`) are not an exception: a contract points at an effect's defaults and presets so the CMS can author it, and never holds a tuning of its own.
- Don't put content (copy, media, layouts) inside effect components or presets.
- Don't raise a placement ceiling (`visual/placement.ts`) to make a look work. Re-tune the look.
