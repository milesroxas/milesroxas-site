/**
 * A position along the index the plate follows instead of a row: 2.4 is 40%
 * of the way from the third row's picture to the fourth's. The dial drives
 * it from scroll, so the dissolve tracks the page 1:1 and reverses with it.
 */
export type PlateScrub = {
  get: () => number
  subscribe: (onChange: () => void) => () => void
}

export function createPlateScrub(): PlateScrub & { set: (value: number) => void } {
  let value = 0
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return
      value = next
      for (const listener of listeners) listener()
    },
    subscribe: (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
  }
}
