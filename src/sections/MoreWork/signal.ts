/**
 * A value the plate follows outside React, read on its own frame. The dial
 * sets it to the page's scroll speed, in rows per second, and the plate
 * bends with it.
 */
export type PlateSignal = {
  get: () => number
  subscribe: (onChange: () => void) => () => void
}

export function createPlateSignal(): PlateSignal & { set: (value: number) => void } {
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
