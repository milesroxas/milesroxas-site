import type { ReactNode } from 'react'
import type { BandTheme } from '@/blocks/shared/band-theme'
import { Section, STACK_OPENER, STACK_SPACING } from '@/blocks/shared/section'
import { cn } from '@/utilities/ui'
import { resolveSectionSpacing, type SectionBlockSpacing } from './shared'

/**
 * The band a Section block paints, shared by every renderer (Pages/Home,
 * work, lab) so the editor's choices resolve to surfaces and rhythm in one
 * place. Children are the section's nested blocks, each rendered `bare` by
 * its renderer: the band and its internal stack live here and nowhere else.
 *
 * `customize` off ignores any previously stored theme/spacing/stack:
 * unchecking the box must restore the defaults even though the hidden fields
 * keep their values.
 */
export const SectionBand = ({
  children,
  className,
  customize,
  spacing,
  stack,
  theme,
}: {
  children: ReactNode
  className?: string
  customize?: boolean | null
  spacing?: SectionBlockSpacing | null
  stack?: SectionBlockSpacing | null
  theme?: BandTheme | null
}) => {
  const stackStep = resolveSectionSpacing(customize, stack)
  return (
    <Section
      className={cn(
        STACK_SPACING[stackStep],
        // A section heading sits half a step above the section it titles.
        STACK_OPENER[stackStep],
        className,
      )}
      spacing={resolveSectionSpacing(customize, spacing)}
      theme={customize ? theme : null}
    >
      {children}
    </Section>
  )
}
