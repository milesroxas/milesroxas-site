import type React from 'react'
import type { RichTransitionBlock as RichTransitionBlockData } from '@/payload-types'
import { RichTransition } from './RichTransition'

/** `bare` skips the themed band for callers that supply their own shell. */
type RichTransitionBlockProps = Pick<
  RichTransitionBlockData,
  'blockType' | 'body' | 'eyebrow' | 'heading' | 'headingLevel' | 'layout' | 'textSize' | 'theme'
> & { bare?: boolean }

export const RichTransitionBlock: React.FC<RichTransitionBlockProps> = ({
  bare,
  body,
  eyebrow,
  heading,
  headingLevel,
  layout,
  textSize,
  theme,
}) => (
  <RichTransition
    bare={bare}
    body={body}
    eyebrow={eyebrow}
    heading={heading}
    headingLevel={headingLevel}
    layout={layout}
    textSize={textSize}
    theme={theme}
  />
)
