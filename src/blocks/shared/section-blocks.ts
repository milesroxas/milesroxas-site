import type { Block } from 'payload'
import { Carousel } from '@/blocks/Carousel/config'
import { Code } from '@/blocks/Code/config'
import { Content } from '@/blocks/Content/config'
import { Caption } from '@/blocks/caption/config'
import { Faq } from '@/blocks/faq/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FullMedia } from '@/blocks/full-media/config'
import { ImagePair } from '@/blocks/image-pair/config'
import { InsightList } from '@/blocks/insight-list/config'
import { MediaContentSplit } from '@/blocks/media-content-split/config'
import { RichTextBlock } from '@/blocks/rich-text/config'
import { RichTransition } from '@/blocks/rich-transition/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { SplitImageOffset } from '@/blocks/split-image-offset/config'
import { YouTube } from '@/blocks/youtube/config'

/**
 * The Section-nestable run, ported from sas-site (docs/composer-roadmap.md,
 * Phase 3) without its figures and story blocks. Stated once so every
 * composition surface offers the same blocks under the same group labels.
 * Each collection nests this run inside its own Section instance and spreads
 * it into its top-level drawer list.
 *
 * Ordered by `admin.group`: the blocks drawer renders groups in
 * first-appearance order.
 */
export const sectionNestableBlocks: Block[] = [
  // Section heading
  RichTransition,
  FeatureHeadingOffset,
  // Media and content
  FullMedia,
  MediaContentSplit,
  SplitContentNarrow,
  ImagePair,
  SplitImageOffset,
  // Media
  FeatureImageStatement,
  Caption,
  YouTube,
  // Text
  RichTextBlock,
  Code,
  // Interactive
  Faq,
  Carousel,
  FeatureTabs,
  // Lists
  InsightList,
]

/**
 * Everything a Section can nest: the run plus this site's multi-column
 * `content` block (Custom group, "Columns"). Content stays out of the run
 * itself because the run is spread into every top-level drawer list, and
 * Custom must close that list rather than land mid-order.
 */
export const sectionChildBlocks: Block[] = [
  ...sectionNestableBlocks,
  // Custom
  Content,
]
