'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { type CtaTarget, EXIT_DELAY_MS } from './look'

/**
 * The whole block opens its target, after a pointer click's ripple and hit
 * have played. The title link stays the keyboard and screen-reader path:
 * Enter on it, and modified clicks (new tab, new window), go straight
 * through. Selecting text never navigates.
 */
export function useCommit(target: CtaTarget) {
  const router = useRouter()
  const busy = useRef(false)
  const [committed, setCommitted] = useState(false)

  useEffect(() => {
    // Back/forward cache: a restored page is clickable again.
    const reset = () => {
      busy.current = false
      setCommitted(false)
    }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0) return
    const onLink = (e.target as Element).closest('a')
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      if (!onLink) window.open(target.href, '_blank', 'noopener')
      return
    }
    if (e.detail === 0 && onLink) return
    if (window.getSelection()?.toString()) return
    e.preventDefault()
    if (busy.current) return
    busy.current = true
    setCommitted(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(
      () => (target.external ? window.location.assign(target.href) : router.push(target.href)),
      reduced ? 0 : EXIT_DELAY_MS,
    )
  }

  return { committed, onClick }
}
