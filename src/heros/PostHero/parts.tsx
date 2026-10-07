import type * as React from 'react'

/**
 * The opening's load-in, in ms after the hero mounts. The title rises word by
 * word on the case study's own beat (`WorkHeroTitle`, from 160ms); the rule
 * under it draws, the byline follows as quiet blur-ins, then
 * the featured image wipes open and its caption fades up last.
 */
export const BEAT = {
  rule: 380,
  byline: 460,
  bylineItem: 80,
  media: 600,
  caption: 1150,
} as const

export const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as React.CSSProperties

/** Small copy: fades up out of a light blur. */
export const enterIn = 'motion-safe:animate-hero-in motion-reduce:animate-hero-fade'
