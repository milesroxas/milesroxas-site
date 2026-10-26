'use client'

import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

/** The live media query, for effects that run before the hook's hydrated value lands. */
export function readPrefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getServerSnapshot(): boolean {
  return false
}

/** Reactive `prefers-reduced-motion: reduce` state. SSR-safe (returns `false` on the server). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readPrefersReducedMotion, getServerSnapshot)
}
