import { RichText } from '@payloadcms/richtext-lexical/react'
import type { CallOutBlock as CallOutBlockProps } from '@/payload-types'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

// Past the shared 0.25 gate: the bottom veil hides the copy's first stretch
// above the fold, and the entrance has to play where it can be seen.
const ENTER_OFFSET = 0.4

export const CallOutBlock: React.FC<CallOutBlockProps> = ({ richText }) => (
  // Type on the page, not a painted band: a `data-theme` pin would make the
  // dock swap material while it floats over this scroll. The veil fades the
  // words out through the dock's band so they don't show through the glass;
  // the bottom padding matches it so copy at rest never sits underneath.
  <ScrollReveal as="div" className="relative" enterOffset={ENTER_OFFSET} variant="intro">
    <div className="container flex min-h-[50dvh] items-center justify-center pt-16 pb-36">
      <div
        className="w-full max-w-[46ch] text-balance text-center font-light text-heading-2/snug"
        data-reveal="lines"
      >
        {richText && <RichText className="mb-0" data={richText} />}
      </div>
    </div>
    <div
      aria-hidden
      className="pointer-events-none sticky bottom-0 z-10 -mt-36 h-36 bg-gradient-to-t from-background from-65% to-transparent"
    />
  </ScrollReveal>
)
