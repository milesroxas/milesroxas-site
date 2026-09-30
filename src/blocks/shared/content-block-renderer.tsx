import type React from 'react'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { CodeSectionBlock } from '@/blocks/Code/Section'
import { CaptionBlock } from '@/blocks/caption/Component'
import { FaqBlock } from '@/blocks/faq/Component'
import { FeatureHeadingOffsetBlock } from '@/blocks/feature/HeadingOffset/Component'
import { FeatureImageStatementBlock } from '@/blocks/feature/ImageStatement/Component'
import { FeatureTabsBlock } from '@/blocks/feature/Tabs/Component'
import { ChartBlock } from '@/blocks/figures/chart/Component'
import { DiagramBlock } from '@/blocks/figures/diagram/Component'
import { FullMediaBlock } from '@/blocks/full-media/Component'
import { ImagePairBlock } from '@/blocks/image-pair/Component'
import { InsightListBlock } from '@/blocks/insight-list/Component'
import { MediaContentSplitBlock } from '@/blocks/media-content-split/Component'
import { RichTextBlock } from '@/blocks/rich-text/Component'
import { RichTransitionBlock } from '@/blocks/rich-transition/Component'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import { SplitImageOffsetBlock } from '@/blocks/split-image-offset/Component'
import { YouTubeBlock } from '@/blocks/youtube/Component'
import { RevealSection } from '@/shared/ui/reveal-section'
import { ScrollReveal, type ScrollRevealVariant } from '@/shared/ui/scroll-reveal'
import { blockRevealVariants, type RevealMappedBlockSlug } from './reveal-variants'

/**
 * A slug-keyed component map. Each component takes its own block's props, so
 * the map is only ever indexed by slug and spread into, never called with a
 * statically known prop type.
 */
export type ContentBlockComponents = Record<string, React.ComponentType<never>>

/**
 * Components for the Section-nestable run, keyed by block slug: the render
 * mirror of `sectionNestableBlocks` in `section-blocks.ts`. Every collection
 * that offers the run renders it through this map, so the same CMS block
 * paints and moves identically wherever an editor places it. This site's
 * `content` block (Columns) is not here: `RenderBlocks` renders it through
 * the legacy wrapper, which carries its own theme and spacing.
 */
export const sectionChildComponents = {
  caption: CaptionBlock,
  carousel: CarouselBlock,
  chart: ChartBlock,
  code: CodeSectionBlock,
  diagram: DiagramBlock,
  faq: FaqBlock,
  featureHeadingOffset: FeatureHeadingOffsetBlock,
  featureImageStatement: FeatureImageStatementBlock,
  featureTabs: FeatureTabsBlock,
  fullMedia: FullMediaBlock,
  imagePair: ImagePairBlock,
  insightList: InsightListBlock,
  mediaContentSplit: MediaContentSplitBlock,
  richText: RichTextBlock,
  richTransition: RichTransitionBlock,
  splitContentNarrow: SplitContentNarrowBlock,
  splitImageOffset: SplitImageOffsetBlock,
  youtube: YouTubeBlock,
}

/** GSAP variant for marker-carrying blocks (`'self'` = block owns its shell). */
const gsapReveal = (blockType: string): ScrollRevealVariant | 'self' | undefined =>
  blockType in blockRevealVariants
    ? blockRevealVariants[blockType as RevealMappedBlockSlug]
    : undefined

/**
 * One flat content block with its entrance. `bare` is set for blocks nested
 * inside a Section block: the block skips its own band (the Section painted
 * it) but keeps the same reveal wrapper it has at the top level, so a block
 * moves identically inside and outside a Section.
 */
export const renderContentBlock = (
  block: { blockType?: string | null },
  key: React.Key,
  bare: boolean,
  components: ContentBlockComponents,
) => {
  const { blockType } = block

  if (!blockType) return null
  const Block = components[blockType]
  if (!Block) return null

  const reveal = gsapReveal(blockType)

  // Blocks with their own GSAP shell — never add a second entrance.
  if (reveal === 'self') {
    return (
      // @ts-expect-error there may be some mismatch between the expected types here
      <Block key={key} {...block} disableInnerContainer />
    )
  }

  // Blocks carrying `data-reveal` markers play the shared GSAP
  // reveal here too, so the same CMS block moves identically on
  // Pages/Home and work pages. Spacing is the block's own band —
  // the wrapper never adds margin.
  if (reveal) {
    return (
      <ScrollReveal as="div" key={key} variant={reveal}>
        {/* @ts-expect-error there may be some mismatch between the expected types here */}
        <Block {...block} bare={bare || undefined} disableInnerContainer />
      </ScrollReveal>
    )
  }

  return (
    <RevealSection key={key}>
      {/* @ts-expect-error there may be some mismatch between the expected types here */}
      <Block {...block} bare={bare || undefined} disableInnerContainer />
    </RevealSection>
  )
}
