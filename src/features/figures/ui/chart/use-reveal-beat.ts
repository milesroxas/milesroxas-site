'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Where the figure's entrance is, read from the shared reveal shell
 * (`shared/ui/scroll-reveal`), which marks the nearest `data-reveal` target
 * `data-reveal-state` as its beat starts (`playing`) and as it lands (`done`).
 *
 * - `waiting`: on the server, and inside a live shell until the beat starts.
 * - `playing`: the beat is under way, so marks entering now are seen.
 * - `landed`: the beat was over before this ran (a mid-page reload, a fast
 *   scroll past), so marks should simply be there.
 *
 * Outside a live shell (Storybook, the admin, reduced motion, where the shell
 * does not mark itself) there is no beat to wait on: `playing` at once.
 */
export type RevealBeat = 'landed' | 'playing' | 'waiting'

export function useRevealBeat(ref: RefObject<HTMLElement | null>): RevealBeat {
  const [beat, setBeat] = useState<RevealBeat>('waiting')
  useEffect(() => {
    const target = ref.current?.closest<HTMLElement>('[data-reveal]')
    if (!target?.closest('[data-reveal-shell]')) {
      setBeat('playing')
      return
    }
    const read = () => {
      const state = target.dataset.revealState
      if (state === 'playing') setBeat('playing')
      else if (state === 'done') setBeat((beat) => (beat === 'waiting' ? 'landed' : beat))
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(target, { attributeFilter: ['data-reveal-state'] })
    return () => observer.disconnect()
  }, [ref])
  return beat
}
