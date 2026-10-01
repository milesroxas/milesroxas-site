import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallOut } from '@/blocks/CallOut/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { SliderBlock } from '@/blocks/Slider/config'
import { sectionBlock } from '@/blocks/section/config'
import { sectionChildBlocks, sectionNestableBlocks } from '@/blocks/shared/section-blocks'
import { TabsBlock } from '@/blocks/Tabs/config'

export const PageSection = sectionBlock({
  blocks: sectionChildBlocks,
  interfaceName: 'PageSectionBlock',
})

export const WorkSection = sectionBlock({
  blocks: sectionChildBlocks,
  interfaceName: 'WorkSectionBlock',
})

export const PostSection = sectionBlock({
  blocks: sectionChildBlocks,
  interfaceName: 'PostSectionBlock',
})

/**
 * Layout blocks offered by Pages. Ordered by `admin.group`: the blocks drawer
 * renders groups in first-appearance order, so the Section and the run lead
 * and this site's own blocks join their groups (the legacy Media block lands
 * in the Media tab beside Caption). Columns (`content`) closes the list.
 */
export const pageLayoutBlocks: Block[] = [
  // Structure
  PageSection,
  // Section heading / Media and content / Media / Text / Interactive / Lists: the run
  ...sectionNestableBlocks,
  // Interactive (legacy, top-level only)
  SliderBlock,
  // Statements
  CallOut,
  // Lists (legacy, top-level only)
  Archive,
  // Forms & CTAs
  CallToAction,
  FormBlock,
  // Media (legacy)
  MediaBlock,
  // Custom
  Content,
]

/** Layout blocks offered by Works: the Pages list with the Tab slider, without the Callout. */
export const workLayoutBlocks: Block[] = [
  // Structure
  WorkSection,
  // Section heading / Media and content / Media / Text / Interactive / Lists: the run
  ...sectionNestableBlocks,
  // Interactive (legacy, top-level only)
  SliderBlock,
  TabsBlock,
  // Lists (legacy, top-level only)
  Archive,
  // Forms & CTAs
  CallToAction,
  FormBlock,
  // Media (legacy)
  MediaBlock,
  // Custom
  Content,
]

/**
 * Posts compose sections after the article body (docs/composer-roadmap.md,
 * D5): the Section and the run, nothing legacy.
 */
export const postLayoutBlocks: Block[] = [
  // Structure
  PostSection,
  // Section heading / Media and content / Media / Text / Interactive / Lists: the run
  ...sectionNestableBlocks,
]
