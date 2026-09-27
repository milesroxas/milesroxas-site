import type { ScrollRevealVariant } from '@/shared/ui/scroll-reveal'

/**
 * Which shared GSAP reveal each `data-reveal`-marked block plays, stated once
 * so every renderer (Pages, Works, Posts) animates the same CMS block
 * identically. Blocks absent from this map carry no markers and take the CSS
 * block reveal (`shared/ui/reveal-section`) from their renderer instead.
 *
 * `'self'` blocks mount their own `ScrollReveal` shell — renderers must never
 * wrap them in a second entrance.
 */
export const blockRevealVariants = {
  faq: 'intro',
  featureHeadingOffset: 'intro',
  featureTabs: 'intro',
  featureImageStatement: 'underMedia',
  splitContentNarrow: 'underMedia',
  fullMedia: 'underMedia',
  imagePair: 'underMedia',
  insightList: 'intro',
  mediaContentSplit: 'underMedia',
  richText: 'intro',
  richTransition: 'intro',
  splitImageOffset: 'underMedia',
} as const satisfies Record<string, ScrollRevealVariant | 'self'>

export type RevealMappedBlockSlug = keyof typeof blockRevealVariants
