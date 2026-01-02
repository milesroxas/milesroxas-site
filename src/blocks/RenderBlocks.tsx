import type React from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SliderBlock } from '@/blocks/Slider/Component'
import { TabsBlock } from '@/blocks/Tabs/Component'
import type {
  Page,
  FormBlock as PayloadFormBlock,
  SliderBlock as PayloadSliderBlock,
  Work,
} from '@/payload-types'
import { blockKeys } from '@/utilities/reactKeyDomains'
import { AnimatedBlocksContainer } from './AnimatedBlocksContainer'
import { CallOutBlock } from './CallOut/Component'

type LayoutBlock = Page['layout'][number] | Work['layout'][number]

export const RenderBlocks: React.FC<{ blocks: LayoutBlock[] }> = ({ blocks }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <AnimatedBlocksContainer>
      {blocks.map((block, index) => {
        const blockKey = blockKeys.fromBlock(block, index)

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
            return null
        }
      })}
    </AnimatedBlocksContainer>
  )
}
