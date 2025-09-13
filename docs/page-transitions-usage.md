# Page Transitions — Usage

This project now includes a unified, type‑safe transition and animation system aligned with the PRD.

Key pieces:

- Store: `src/stores/transitionStore.ts`
- Provider: `src/providers/TransitionProvider.tsx` (wired in `src/providers/index.tsx` and used in `src/app/(frontend)/layout.tsx`)
- Hooks: `src/hooks/usePageTransition.ts`, `src/hooks/useFrameAnimation.ts`, `src/hooks/useScrollAnimation.ts`
- GSAP setup: `src/lib/gsap/config.ts`, `src/lib/gsap/plugins.ts`
- Link: `src/components/Link/TransitionLink.tsx`

## How to use

- Prefer `TransitionLink` for navigation to get native View Transitions when supported.

```tsx
import { TransitionLink } from '@/components/Link'

<TransitionLink href="/works">Works</TransitionLink>
```

- Imperative navigation inside components:

```tsx
import { usePageTransition } from '@/hooks/usePageTransition'

const { navigate } = usePageTransition({
  onStart: () => {/* optional */},
  onComplete: () => {/* optional */},
})

// ...
navigate('/posts')
```

- Site frame animations:

```tsx
import { useFrameAnimation } from '@/hooks/useFrameAnimation'

const { collapseFrame, restoreFrame } = useFrameAnimation()
```

## Notes

- View Transitions are enabled via `experimental.viewTransition` in `next.config.js`.
- Reduced motion is respected; navigation falls back to instant route changes.
- GSAP plugins are centralized; import `gsap` from `src/lib/gsap/config` in new code.

