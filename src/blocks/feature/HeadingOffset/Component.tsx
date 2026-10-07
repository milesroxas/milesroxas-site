import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { typeScale } from '@/blocks/shared/typography'
import RichText from '@/components/RichText'
import type { FeatureHeadingOffsetBlock as FeatureHeadingOffsetBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

/**
 * `bare` skips the themed band for callers that supply their own themed shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 *
 * A section heading like the Standard block: half a step above the section it
 * titles (`data-section-heading`, `band-opener`; see `RichTransition`).
 */
type FeatureHeadingOffsetBlockProps = Pick<
  FeatureHeadingOffsetBlockData,
  'blockType' | 'body' | 'eyebrow' | 'heading' | 'textSize' | 'theme'
> & { bare?: boolean }

export const FeatureHeadingOffsetBlock: React.FC<FeatureHeadingOffsetBlockProps> = ({
  eyebrow,
  heading,
  body,
  textSize,
  bare,
  theme,
}) => {
  const type = typeScale(textSize)
  return (
    <Section bare={bare} className="band-opener" theme={theme}>
      <div className="container" data-section-heading>
        <BlockGrid>
          <div className="text-stack md:col-span-4">
            {eyebrow ? (
              <p className="text-sm tracking-widest uppercase" data-reveal>
                {eyebrow}
              </p>
            ) : null}
            <h2 className={type.title} data-reveal>
              {heading}
            </h2>
          </div>
          {body ? (
            <div className="md:col-span-3 md:col-start-6 md:pt-24" data-reveal>
              <RichText
                className={cn(type.lead, 'text-muted-foreground')}
                data={body}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          ) : null}
        </BlockGrid>
      </div>
    </Section>
  )
}
