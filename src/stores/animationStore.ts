import { create } from 'zustand'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AnimationState {
  // State
  isHeroAnimationComplete: boolean
  animationInitialized: boolean

  // Actions
  setHeroAnimationComplete: (isComplete: boolean) => void
  setAnimationInitialized: (isInitialized: boolean) => void
  resetAnimations: () => void
}

// Create the store with persistence safety
export const useAnimationStore = create<AnimationState>((set) => ({
  // Initial state
  isHeroAnimationComplete: false,
  animationInitialized: false,

  // Actions
  setHeroAnimationComplete: (isComplete) => set({ isHeroAnimationComplete: isComplete }),
  setAnimationInitialized: (isInitialized) => set({ animationInitialized: isInitialized }),
  resetAnimations: () => set({ isHeroAnimationComplete: false, animationInitialized: false }),
}))

// Hook to automatically reset animation state when navigation occurs
export function useResetAnimationOnRouteChange() {
  const pathname = usePathname()
  const resetAnimations = useAnimationStore((state) => state.resetAnimations)
  const [prevPathname, setPrevPathname] = useState<string | null>(null)

  useEffect(() => {
    // Only reset on actual route changes, not initial load
    if (prevPathname !== null && prevPathname !== pathname) {
      // Reset animations when navigating between routes
      console.log('Route changed, resetting animations')
      resetAnimations()
    }

    // Update previous pathname for next comparison
    setPrevPathname(pathname)

    // Also reset on unmount to be safe
    return () => {
      resetAnimations()
    }
  }, [pathname, resetAnimations, prevPathname])
}

// Utility to force reset animation state (useful in error handling)
export function forceResetAnimations() {
  const store = useAnimationStore.getState()
  store.resetAnimations()
}

// Utility to ensure animations complete after a timeout (useful for recovery)
export function ensureAnimationsComplete(timeoutMs = 3000) {
  setTimeout(() => {
    const store = useAnimationStore.getState()
    if (!store.isHeroAnimationComplete) {
      console.log('Forcing animation completion after timeout')
      store.setHeroAnimationComplete(true)
    }
  }, timeoutMs)
}
