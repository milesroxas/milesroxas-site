# useTransitionNavigation

A powerful React hook for creating smooth GSAP-powered page transitions in Next.js applications with Lenis smooth scrolling integration.

## Features

- 🔄 Built for Next.js 15.3+ and its new `onNavigate` feature
- ✨ Seamless GSAP animations for page transitions
- 🎯 Performance-optimized with GSAP contexts
- 📜 Lenis smooth scroll integration with scroll position management
- 🚦 Prevents duplicate transitions during animation
- 🔧 Highly customizable animations and behavior

## Installation

Make sure you have the required dependencies:

```bash
npm install gsap @studio-freight/react-lenis
```

## Basic Usage

```tsx
'use client'

import Link from 'next/link'
import { useTransitionNavigation } from '@/hooks/useTransitionNavigation'

export default function Layout({ children }) {
  const { isNavigating, handleNavigate, setContainerRef } = useTransitionNavigation()
  
  return (
    <div>
      <nav>
        <Link href="/" onNavigate={handleNavigate}>Home</Link>
        <Link href="/about" onNavigate={handleNavigate}>About</Link>
      </nav>
      
      <main ref={setContainerRef} className={isNavigating ? 'transitioning' : ''}>
        {children}
      </main>
    </div>
  )
}
```

## API Reference

### useTransitionNavigation

The main hook that handles page transitions.

```tsx
const { 
  isNavigating, 
  navigate, 
  handleNavigate, 
  setContainerRef 
} = useTransitionNavigation(config)
```

#### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `0.5` | Duration of transition animations in seconds |
| `exitAnimation` | `(element, done) => void` | Default fade out | Function to run when exiting a page |
| `enterAnimation` | `(element, done) => void` | Default fade in | Function to run when entering a page |
| `scrollTo` | `'top'` \| `'maintain'` \| `number` | `'top'` | Scroll behavior after navigation |
| `preventDuplicateTransitions` | `boolean` | `true` | Prevents multiple transitions from happening at once |

#### Return Values

| Value | Type | Description |
|-------|------|-------------|
| `isNavigating` | `boolean` | Whether a navigation is in progress |
| `navigate` | `(href: string) => void` | Function to programmatically navigate with transitions |
| `handleNavigate` | `(e: React.MouseEvent) => void` | Function to pass to Link's onNavigate prop |
| `setContainerRef` | `(node: HTMLElement) => void` | Function to set the container ref for animations |

## Custom Animations

You can provide custom GSAP animations for both exit and enter transitions:

```tsx
const { isNavigating, handleNavigate, setContainerRef } = useTransitionNavigation({
  duration: 0.8,
  exitAnimation: (element, done) => {
    gsap.to(element, {
      opacity: 0,
      y: -50,
      duration: 0.8,
      onComplete: done
    })
  },
  enterAnimation: (element, done) => {
    gsap.fromTo(element,
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        onComplete: done
      }
    )
  }
})
```

## Scroll Management

The hook provides three options for scroll management:

```tsx
// Always scroll to top after navigation (default)
useTransitionNavigation({ scrollTo: 'top' })

// Try to maintain previous scroll position when returning to a page
useTransitionNavigation({ scrollTo: 'maintain' })

// Scroll to a specific position (in pixels)
useTransitionNavigation({ scrollTo: 200 })
```

## Integration with Zustand

If you're using Zustand for state management (e.g., for React Three Fiber):

```tsx
const { setSceneState } = useStore()

const { isNavigating, handleNavigate, setContainerRef } = useTransitionNavigation({
  exitAnimation: (element, done) => {
    // Update Zustand store state
    setSceneState('transitioning-out')
    
    gsap.to(element, {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      onComplete: () => {
        done()
      }
    })
  },
  enterAnimation: (element, done) => {
    // Update Zustand store state
    setSceneState('transitioning-in')
    
    gsap.fromTo(element,
      { opacity: 0, scale: 0.95 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.6, 
        onComplete: () => {
          setSceneState('active')
          done()
        }
      }
    )
  }
})
```

## Programmatic Navigation

You can trigger transitions programmatically:

```tsx
const { navigate } = useTransitionNavigation()

function handleButtonClick() {
  navigate('/contact')
}

return <button onClick={handleButtonClick}>Contact Us</button>
```

## Optimizing Performance

To optimize performance, the hook uses GSAP contexts and properly manages animations:

- Uses `gsap.context()` for better memory management
- Applies `clearProps` to clean up styles after animations
- Properly disposes of animations on unmount
- Prevents duplicate transitions

## Requirements

- Next.js 15.3+ (for `onNavigate` support)
- GSAP
- @studio-freight/react-lenis

## Common Issues and Solutions

### Flickering During Transitions

If you experience flickering during transitions, try:

1. Add `will-change: opacity, transform` to your container element
2. Ensure your animations are running at the same duration
3. Add `backface-visibility: hidden` to the container

### Multiple Transitions Triggering

The hook prevents duplicate transitions by default, but if you're still experiencing issues:

1. Verify you're using the same `handleNavigate` for all navigation elements
2. Check for any programmatic navigation that might be happening at the same time

### Scroll Position Not Restoring

If scroll positions aren't being properly restored:

1. Make sure your Lenis provider is set up correctly
2. Verify the `scrollTo` option is set to `'maintain'`
3. Ensure the hook has enough time to save the scroll position before navigating

## Full Implementation

For a complete implementation, see the hook source code:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLenis } from '@studio-freight/react-lenis'
import gsap from 'gsap'

// Hook implementation...
```

---

Made with ❤️ for Next.js, GSAP, and Lenis