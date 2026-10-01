import type React from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SliderBlock } from '@/blocks/Slider/Component'
import { SectionBand } from '@/blocks/section/SectionBand'
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

/**
 * This site's own blocks, each in the `block-wrapper` it has always had: the
 * wrapper and the block carry their own theme and spacing. Unchanged by the
 * composer port, so every document renders as it did. `content` renders here
 * inside a Section too, where it keeps the same wrapper.
 */
const renderLegacyBlock = (block: FlatBlock, blockKey: React.Key) => {
  switch (block.blockType) {
    case 'archive':
      return (
        <div key={blockKey} className="block-wrapper">
          <ArchiveBlock {...block} />
        </div>
      )

    case 'content': {
      const isFullWidth = block.containerWidth === 'fullWidth'
      return (
        <div key={blockKey} className={`block-wrapper ${isFullWidth ? 'w-full' : ''}`}>
          <ContentBlock {...block} />
        </div>
      )
    }

    case 'cta':
      return (
        <div key={blockKey} className="block-wrapper">
          <CallToActionBlock {...block} />
        </div>
      )

    case 'formBlock':
      return (
        <div key={blockKey} className="block-wrapper">
          <FormBlock {...(block as PayloadFormBlock)} />
        </div>
      )

    case 'mediaBlock':
      return (
        <div key={blockKey} className="block-wrapper">
          <MediaBlock {...block} />
        </div>
      )

    case 'slider':
      return (
        <div key={blockKey} className="block-wrapper">
          <SliderBlock {...(block as PayloadSliderBlock)} />
        </div>
      )

    case 'tabs':
      return (
        <div key={blockKey} className="block-wrapper">
          <TabsBlock {...block} />
        </div>
      )

    case 'callout':
      return (
        <div key={blockKey} className="block-wrapper">
          <CallOutBlock {...block} />
        </div>
      )

    default:
      return undefined
  }
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

export const RenderBlocks: React.FC<{ blocks: LayoutBlock[] | null | undefined }> = async ({
  blocks,
}) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  // Check if user has access to protected works (cookie persists across navigation)
  const hasAccess = await hasWorkAccess()

  // Process blocks to replace protected works with fallbacks
  const processedBlocks = await processLayoutBlocks(blocks, hasAccess)

  return (
    <AnimatedBlocksContainer>
      {processedBlocks.map((block, index) => {
        const blockKey = blockKeys.fromBlock(block, index)

        // The Section block owns the band; children render bare inside it
        // with their usual entrances. The band itself never animates: a
        // second entrance on the shell would double every child's motion.
        if (block.blockType === 'section') {
          return (
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
            </SectionBand>
          )
        }

        return renderFlatBlock(block, blockKey, false)
      })}
    </AnimatedBlocksContainer>
  )
}
