export type Rng = {
  next: () => number
  range: (min: number, max: number) => number
  int: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T
  chance: (p: number) => boolean
  shuffle: <T>(items: readonly T[]) => T[]
}

/** mulberry32: every random value in a render comes from the config's seed. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => Math.floor(min + next() * (max - min + 1))
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int,
    pick: (items) => items[Math.floor(next() * items.length)] as (typeof items)[number],
    chance: (p) => next() < p,
    shuffle: (items) => {
      const out = [...items]
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i)
        ;[out[i], out[j]] = [out[j] as (typeof out)[number], out[i] as (typeof out)[number]]
      }
      return out
    },
  }
}
