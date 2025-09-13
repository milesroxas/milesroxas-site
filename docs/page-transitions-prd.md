# Product Requirements Document (PRD)
## Modern Page Transitions & Animation System for Next.js 15

### Executive Summary

This PRD outlines the implementation of a unified, performant, and fully-typed animation and transition system that leverages Next.js 15 View Transitions API and GSAP's useGSAP hook. The goal is to eliminate technical debt, reduce complexity, and create a single source of truth for all page transitions and animations.

---

## Current State Analysis

### Technical Debt Identified

**🔴 Critical Issues:**
1. **Multiple Animation State Systems** - 3 separate Zustand stores managing overlapping concerns
2. **Inconsistent GSAP Usage** - Mix of useGSAP, direct gsap calls, and selector-based animations
3. **No View Transitions Integration** - Custom transition logic without leveraging native browser APIs
4. **Memory Leaks** - Missing cleanup for ScrollTriggers and timeouts
5. **Type Inconsistencies** - Complex event types and prop interfaces

**🟡 Performance Issues:**
- Multiple safety timeouts (3000ms, 2000ms) creating redundancy
- Console.log statements in production code
- No centralized animation cleanup strategy

---

## Solution Architecture

### Core Principles
1. **Single Source of Truth** - Unified state management for all transitions
2. **Type Safety First** - Full TypeScript integration with strict typing
3. **Performance Optimized** - Proper cleanup, memory management, and GPU acceleration
4. **Native API Integration** - Leverage Next.js 15 View Transitions where possible
5. **Feature Sliced Design** - Domain-driven organization

### Technology Stack
- **Next.js 15** - App Router with experimental View Transitions
- **GSAP + useGSAP Hook** - For complex animations and scroll triggers
- **Zustand** - Single animation state store
- **TypeScript** - Full type safety

---

## Implementation Plan

### Phase 1: Core Infrastructure


#### 1.1 Unified Animation Store
```typescript
// src/stores/transitionStore.ts
interface TransitionState {
  phase: 'idle' | 'preparing' | 'animating' | 'complete'
  isPageReady: boolean
  currentRoute: string
  previousRoute: string | null
}
```

#### 1.2 GSAP Configuration
```typescript
// src/lib/gsap/config.ts
// Centralized GSAP setup with all plugins
// Export configured gsap instance
```

#### 1.3 View Transitions Setup
```typescript
// Enable experimental View Transitions in next.config.js
// Wrap layout with ViewTransitions provider
```

### Phase 2: Animation Hooks


#### 2.1 Page Transition Hook
```typescript
// src/hooks/usePageTransition.ts
export const usePageTransition = (options?: TransitionOptions) => {
  // Unified hook combining View Transitions + GSAP
  // Returns transition controls and state
}
```

#### 2.2 Frame Animation Hook  
```typescript
// src/hooks/useFrameAnimation.ts
export const useFrameAnimation = () => {
  // Site frame collapse/restore animations
  // Proper cleanup and ref-based targeting
}
```

### Phase 3: Component Migration


#### 3.1 Enhanced TransitionLink
- Integrate with View Transitions API
- Remove custom transition logic
- Full TypeScript support

#### 3.2 Animation Components
- Migrate AnimatedBlocksContainer to useGSAP
- Update HomeHero to use unified state
- Implement proper cleanup patterns

### Phase 4: Cleanup & Optimization


#### 4.1 Remove Technical Debt
- Delete redundant stores (animationStore, usePageAnimationStore)
- Remove useExitFrameTransition utility
- Clean up console.log statements

#### 4.2 Performance Optimization
- Implement animation cleanup strategies
- Add proper error boundaries
- Optimize GPU acceleration

---

## File Structure

```
src/
├── lib/
│   └── gsap/
│       ├── config.ts              # Centralized GSAP setup
│       └── plugins.ts             # Plugin registration
├── stores/
│   └── transitionStore.ts         # Unified state management
├── hooks/
│   ├── usePageTransition.ts       # Main transition hook
│   ├── useFrameAnimation.ts       # Frame-specific animations
│   └── useScrollAnimation.ts      # Scroll-triggered animations
├── components/
│   └── Link/
│       └── TransitionLink.tsx     # Enhanced with View Transitions
└── providers/
    └── TransitionProvider.tsx     # Context for transition state
```

---

## Success Metrics

### Performance
- **Reduce bundle size** - Remove redundant animation code (~15-20KB)
- **Improve transition speed** - Sub-300ms page transitions
- **Eliminate memory leaks** - Proper cleanup of all animations

### Developer Experience  
- **Reduce complexity** - Single API for all transitions
- **Type safety** - 100% TypeScript coverage
- **Maintainability** - Centralized animation logic

### User Experience
- **Smooth transitions** - Native browser View Transitions where supported
- **Fallback support** - GSAP-powered transitions for older browsers
- **Accessibility** - Respect prefers-reduced-motion

---

## Implementation Guidelines

### Type Safety Requirements
```typescript
interface TransitionOptions {
  duration?: number
  ease?: string
  onStart?: () => void
  onComplete?: () => void
}
```

### Performance Standards
- All animations must use GPU acceleration (`will-change`, `transform3d`)
- ScrollTriggers must be properly killed on unmount
- No animations should block the main thread

### Code Quality
- No console.log statements in production builds
- All animations must have fallbacks for reduced motion
- Comprehensive error handling for animation failures

---

## Risk Mitigation

### Browser Support
- View Transitions API has limited support - implement GSAP fallbacks
- Test across all supported browsers

### Performance Concerns
- Monitor bundle size impact of GSAP plugins
- Implement lazy loading for complex animations

### Migration Safety
- Gradual migration approach with feature flags
- Comprehensive testing of existing functionality

---

This PRD provides a focused, technical approach to modernizing your animation system while eliminating technical debt and improving performance. The implementation will result in a lean, maintainable, and fully-typed transition system that leverages the latest Next.js and GSAP features.