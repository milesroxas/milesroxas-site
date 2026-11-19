/**
 * The tuned values for the three CTA link looks, settled on DialKit in the
 * /proto/cta picker (docs/cta-link.md). Stated once so the variants read as
 * one system; change a feel here, not at a call site.
 */

import type { VideoResource } from '@/components/Media/types'

/**
 * What Instrument paints in: a still, or a muted loop with a still (its
 * poster) to paint until the loop has frames.
 */
export type CtaMedia =
  | { kind: 'image'; src: string; width: number; height: number }
  | { kind: 'video'; resource: VideoResource; poster?: string }

/** Plain data handed from the server block to the client looks. */
export type CtaTarget = {
  kind: 'work' | 'post' | 'page' | 'external'
  /** Eyebrow after "next /": case study, post, page, or external. */
  label: string
  /** Part number in the metadata band: MR–16–W06, P–04, the page's path, or the link's host. */
  code: string
  title: string
  line?: string
  facts: { label: string; value: string }[]
  action: string
  href: string
  external: boolean
  media?: CtaMedia
}

/** The reticle every look shares: snaps to the pointer, corners scale with the lock. */
export const RETICLE = {
  lockMs: 0,
  follow: 0,
  armRatio: 0.15,
  armMin: 6,
  armMax: 200,
  cursor: 'reticle',
  radius: 1,
  rings: 2,
  spotCore: true,
} as const

/** The crosshair: dim, full length, clear of the pointer by `gap` px. */
export const CROSSHAIR = { opacity: 0.2, gap: 12 } as const

/** How long a click holds so its ripple and hit read before the page leaves, ms. */
export const EXIT_DELAY_MS = 650

export const FIELD_LOOK = {
  field: {
    tone: 0.06,
    cell: 14,
    threshold: 0.4,
    speed: 0.04,
    shape: 'plus',
    markSize: 0.5,
    reticle: 8,
  },
  inkMs: 350,
  inkEase: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const

export const INSTRUMENT_LOOK = {
  /** The block-wide aim layer: cursor, locks and ripples, no marks of its own. */
  aim: {
    tone: 0.04,
    threshold: 0.9,
    scan: false,
    glitch: 0,
    dpr: 1,
    reticle: 9,
    stroke: 1.5,
    cell: 14,
    shape: 'plus',
    markSize: 0.35,
  },
  panel: {
    restTone: 0.12,
    wakeTone: 0.26,
    cell: 12,
    speed: 0.04,
    shape: 'mixed',
  },
  /** How far the panel's lock box stands off its edge, px. */
  panelGap: 12,
  paint: {
    cell: 32,
    brush: 1.4,
    fadeIn: 140,
    hold: 0,
    fadeOut: 700,
    levels: 3,
    mosaic: true,
    flood: 1400,
    completeAt: 85,
    ring: 'site',
  },
} as const

export const STRIP_LOOK = {
  field: {
    tone: 0.1,
    cell: 12,
    speed: 0.04,
    shape: 'plus',
    markSize: 0.5,
    reticle: 8,
  },
  revealMs: 600,
  exitRatio: 0.6,
  revealEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const
