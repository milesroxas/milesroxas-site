import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import type { CtaLinkBlock } from '@/payload-types'
import { CtaField } from './Field'
import { CtaInstrument } from './Instrument'
import type { CtaTarget } from './look'
import { CtaStrip } from './Strip'

export type CtaLinkViewProps = {
  target: CtaTarget
  variant?: CtaLinkBlock['variant'] | null
  theme?: CtaLinkBlock['theme']
  bare?: boolean
}

/**
 * A resolved CTA link in its chosen look. Field is its own full-bleed band
 * with its own padding; Instrument and Strip sit in the page column.
 */
export function CtaLinkView({ target, variant, theme, bare }: CtaLinkViewProps) {
  if (variant === 'field') {
    return (
      <Section bare={bare} spacing="none" theme={theme}>
        <CtaField target={target} />
      </Section>
    )
  }
  return (
    <Section bare={bare} theme={theme}>
      <Container>
        {variant === 'strip' ? <CtaStrip target={target} /> : <CtaInstrument target={target} />}
      </Container>
    </Section>
  )
}
