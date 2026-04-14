# SiteFrame System

The SiteFrame system provides the white frame overlay and cross-page media transition behavior used
across frontend routes.

## Core Files

- `src/SiteFrame/Component.tsx`
  - Thin wrapper that renders `SiteFrameClient`.
- `src/SiteFrame/SiteFrameClient.tsx`
  - Renders frame bars and wraps page children.
  - Uses `useSiteFrameStore` for visibility/transition state.
  - Fades frame in with GSAP when visible.
- `src/SiteFrame/BottomSection/Component.tsx`
  - Bottom frame content.
- `src/SiteFrame/FrameRestorer.tsx`
  - Calls `restoreFrame()` from `usePageAnimationStore` on mount.

## Stores

- `src/stores/siteframeStore.ts`
  - `isSiteFrameVisible`
  - `isTransitioning`
  - `transitionPhase`: `'initial' | 'clone-animating' | 'frame-ready' | 'complete'`
- `src/templates/shared/usePageAnimationStore.ts`
  - `collapseFrame(onComplete?)`
  - `restoreFrame(onComplete?)`
  - Frame restore animates top horizontal, then vertical bars, then bottom horizontal.

## Transition Flow

### Transition Start (Card Components)

- `src/components/Card/Works/Component.tsx`
- `src/components/Card/Posts/Component.tsx`

Both components:

1. Prevent default link navigation.
2. Clone the clicked media element.
3. Store the clone in `window.__PAGE_TRANSITION_CLONE`.
4. Animate the clone to fullscreen with GSAP Flip.
5. Navigate with `router.push(...)`.
6. Hide the frame via `setIsSiteFrameVisible(false)`.

### Transition Receive (Hero Components)

- `src/heros/HighImpact/index.tsx`
  - Reads `window.__PAGE_TRANSITION_CLONE`.
  - Animates clone into hero media bounds.
  - Sets frame visible again when timeline progress passes ~70%.
  - Finishes by removing clone and setting `transitionPhase` to `complete`.

- `src/heros/PostHero/index.tsx`
  - Waits for mount/render, then reads clone.
  - Calls `restoreFrame()` first.
  - Animates clone into hero media, fades out, removes clone, and sets `transitionPhase` to
    `complete`.

## App Integration

`src/app/(frontend)/layout.tsx` includes:

- `<SiteFrame>{children}</SiteFrame>`
- `<FrameRestorer />`

This ensures frame UI is always mounted around frontend route content.

## Current Behavior Notes

- `PostCard` sets `transitionPhase('clone-animating')` during animation start.
- `WorkCard` currently sets `transitionPhase('initial')` but does not set
  `'clone-animating'` in its active GSAP callbacks.
- `FrameRestorer` imports `usePathname()`, but the effect currently runs on mount via
  `restoreFrame()` dependency.