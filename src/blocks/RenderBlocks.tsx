import type React from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SliderBlock } from '@/blocks/Slider/Component'
import { SectionBand } from '@/blocks/section/SectionBand'
import { bandEdges } from '@/blocks/shared/band-edges'
import type { BandTheme } from '@/blocks/shared/band-theme'
import { TabsBlock } from '@/blocks/Tabs/Component'
import type {
  Page,
  PageSectionBlock,
  FormBlock as PayloadFormBlock,
  SliderBlock as PayloadSliderBlock,
  Post,
  Work,
} from '@/payload-types'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'
import { processLayoutBlocks } from '@/utilities/processLayoutBlocks'
import { blockKeys } from '@/utilities/reactKeyDomains'
import { AnimatedBlocksContainer } from './AnimatedBlocksContainer'
import { CallOutBlock } from './CallOut/Component'
import { renderContentBlock, sectionChildComponents } from './shared/content-block-renderer'

type LayoutBlock =
  | Page['layout'][number]
  | Work['layout'][number]
  | NonNullable<Post['layout']>[number]

/** A block a Section can nest: the run, or this site's Columns block. */
type SectionChildBlock = NonNullable<PageSectionBlock['blocks']>[number]

type FlatBlock = Exclude<LayoutBlock, { blockType: 'section' }> | SectionChildBlock

const legacyBlockBody = (block: FlatBlock) => {
  switch (block.blockType) {
    case 'archive':
      return <ArchiveBlock {...block} />
    case 'content':
      return <ContentBlock {...block} />
    case 'cta':
      return <CallToActionBlock {...block} />
    case 'formBlock':
      return <FormBlock {...(block as PayloadFormBlock)} />
    case 'mediaBlock':
      return <MediaBlock {...block} />
    case 'slider':
      return <SliderBlock {...(block as PayloadSliderBlock)} />
    case 'tabs':
      return <TabsBlock {...block} />
    case 'callout':
      return <CallOutBlock {...block} />
    default:
      return undefined
  }
}

const legacyWrapperClassName = (block: FlatBlock) => {
  if (block.blockType !== 'content') return 'block-wrapper'
  const isFullWidth = block.containerWidth === 'fullWidth'
  return `block-wrapper ${isFullWidth ? 'w-full' : ''}`
}

/**
 * This site's own blocks, each in the `block-wrapper` it has always had: the
 * wrapper and the block carry their own theme and spacing. Unchanged by the
 * composer port, so every document renders as it did. `content` renders here
 * inside a Section too, where it keeps the same wrapper.
 */
const renderLegacyBlock = (block: FlatBlock, blockKey: React.Key) => {
  const body = legacyBlockBody(block)
  if (body === undefined) return undefined
  return (
    <div key={blockKey} className={legacyWrapperClassName(block)}>
      {body}
    </div>
  )
}

/**
 * One flat block: a legacy block in its wrapper, or a run block with the
 * entrance `reveal-variants.ts` assigns it (`bare` inside a Section, whose
 * band it sits on).
 */
const renderFlatBlock = (block: FlatBlock, blockKey: React.Key, bare: boolean) => {
  const legacy = renderLegacyBlock(block, blockKey)
  if (legacy !== undefined) return legacy
  return renderContentBlock(block, blockKey, bare, sectionChildComponents)
}

/**
 * The surface a top-level block paints: a Section's only when customized
 * (`SectionBand`), a legacy or run block's from its own `theme`.
 */
const blockSurface = (block: LayoutBlock): BandTheme | null | undefined => {
  if (block.blockType === 'section') return block.customize ? block.theme : null
  return 'theme' in block ? block.theme : null
}

/**
 * Marks a band where the surface changes (`bandEdges`) on a `display:
 * contents` wrapper, so the band's own markup and layout stay untouched.
 */
const withBandEdge = (node: React.ReactNode, edge: string | undefined, blockKey: React.Key) =>
  edge ? (
    <div className="contents" data-band-edge={edge} key={blockKey}>
      {node}
    </div>
  ) : (
    node
  )

export const RenderBlocks: React.FC<{ blocks: LayoutBlock[] | null | undefined }> = async ({
  blocks,
}) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  // Check if user has access to protected works (cookie persists across navigation)
  const hasAccess = await hasWorkAccess()

  // Process blocks to replace protected works with fallbacks
  const processedBlocks = await processLayoutBlocks(blocks, hasAccess)
  const edges = bandEdges(processedBlocks.map(blockSurface))

  return (
    <AnimatedBlocksContainer>
      {processedBlocks.map((block, index) => {
        const blockKey = blockKeys.fromBlock(block, index)

        // The Section block owns the band; children render bare inside it
        // with their usual entrances. The band itself never animates: a
        // second entrance on the shell would double every child's motion.
        if (block.blockType === 'section') {
          return withBandEdge(
            <SectionBand
              customize={block.customize}
              key={blockKey}
              spacing={block.spacing}
              stack={block.stack}
              theme={block.theme}
            >
              {(block.blocks ?? []).map((child, childIndex) =>
                renderFlatBlock(child, blockKeys.fromBlock(child, childIndex), true),
              )}
            </SectionBand>,
            edges[index],
            blockKey,
          )
        }

        // Legacy blocks carry their own spacing and are animated as direct
        // children of the container, so they are never wrapped.
        const legacy = renderLegacyBlock(block, blockKey)
        if (legacy !== undefined) return legacy
        return withBandEdge(
          renderContentBlock(block, blockKey, false, sectionChildComponents),
          edges[index],
          blockKey,
        )
      })}
    </AnimatedBlocksContainer>
  )
}
