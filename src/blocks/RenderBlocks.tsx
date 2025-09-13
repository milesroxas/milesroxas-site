import React from 'react'
import type { Page, Work } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SliderBlock } from '@/blocks/Slider/Component'
import { TabsBlock } from '@/blocks/Tabs/Component'
import { AnimatedBlocksContainer } from './AnimatedBlocksContainer'
import { CallOutBlock } from './CallOut/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  slider: SliderBlock,
  tabs: TabsBlock,
  callout: CallOutBlock,
}

type Block = Page['layout'][0] | Work['layout'][0]

export const RenderBlocks: React.FC<{
  blocks: Block[]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <AnimatedBlocksContainer>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // Make a deep copy of the block to avoid reference issues
              const blockProps = { ...block }

              // Check if this block should be full-width
              const isFullWidth =
                blockType === 'content' &&
                'containerWidth' in blockProps &&
                blockProps.containerWidth === 'fullWidth'

              // Add disableInnerContainer prop for MediaBlock
              const additionalProps =
                blockType === 'mediaBlock' ? { disableInnerContainer: false } : {}

              return (
                <div key={index} className={`block-wrapper ${isFullWidth ? 'w-full' : ''}`}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...blockProps} {...additionalProps} />
                </div>
              )
            }
          }
          return null
        })}
      </AnimatedBlocksContainer>
    )
  }

  return null
}
