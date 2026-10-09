import type { ScrollRevealVariant } from '@/shared/ui/scroll-reveal'

/**
 * The entrance each block plays, stated once so every renderer (Pages, Works,
 * Posts) animates the same CMS block identically. One system: the shared
 * `ScrollReveal` shell (`shared/ui/scroll-reveal`).
 *
 * - A variant: the block carries `data-reveal` markers, and the shell plays
 *   that reveal over them.
 * - `'frame'`: the block has no markers of its own and opens whole, as one
 *   media beat of the under-media reveal (a chart, a form, a carousel).
 * - `'self'`: the block mounts its own shell — renderers must never wrap it
 *   in a second entrance.
 *
 * A block that gains markers moves from `'frame'` to a variant here, or its
 * lines would open inside a frame that is still opening.
 */
export const blockRevealVariants = {
  // Cards carry their own markers.
  archive: 'underMedia',
  // Its own intro shell, gated later than the shared line (its veil).
  callout: 'self',
  caption: 'underMedia',
  carousel: 'frame',
  carouselSplit: 'frame',
  carouselTabs: 'frame',
  chart: 'frame',
  code: 'frame',
  content: 'intro',
  cta: 'frame',
  diagram: 'frame',
  faq: 'intro',
  featureHeadingOffset: 'intro',
  featureTabs: 'intro',
  featureImageStatement: 'underMedia',
  formBlock: 'frame',
  splitContentNarrow: 'underMedia',
  fullMedia: 'underMedia',
  imagePair: 'underMedia',
  insightList: 'intro',
  mediaBlock: 'frame',
  mediaContentSplit: 'underMedia',
  richText: 'intro',
  richTransition: 'intro',
  slider: 'frame',
  splitImageOffset: 'underMedia',
  tabs: 'frame',
  youtube: 'frame',
} as const satisfies Record<string, ScrollRevealVariant | 'frame' | 'self'>

export type RevealMappedBlockSlug = keyof typeof blockRevealVariants

export type BlockReveal = (typeof blockRevealVariants)[RevealMappedBlockSlug]

/** The entrance for a block slug; a block not listed opens whole. */
export const blockReveal = (blockType: string): BlockReveal =>
  blockType in blockRevealVariants
    ? blockRevealVariants[blockType as RevealMappedBlockSlug]
    : 'frame'
