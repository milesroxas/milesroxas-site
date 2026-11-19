import type { CtaLinkBlock as CtaLinkBlockData } from '@/payload-types'
import { resolveCtaTarget } from './resolve'
import { CtaLinkView } from './View'

type CtaLinkBlockProps = CtaLinkBlockData & { bare?: boolean }

/**
 * Resolves the block's target on the server (access rules, fallbacks, part
 * numbers) and hands the looks plain data. A target a visitor cannot open
 * hides the block.
 */
export async function CtaLinkBlock({ bare, theme, variant, ...block }: CtaLinkBlockProps) {
  const target = await resolveCtaTarget({ ...block, theme, variant } as CtaLinkBlockData)
  if (!target) return null
  return <CtaLinkView bare={bare} target={target} theme={theme} variant={variant} />
}
