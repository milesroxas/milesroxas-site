import Link from 'next/link'
import type React from 'react'
import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import { Button } from '@/components/ui/button'
import type { RichTextActionsBlock as RichTextActionsBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type RichTextActionsProps = Pick<RichTextActionsBlockData, 'links'> & {
  className?: string
}

/**
 * Button metrics per appearance. The primary chip is the `action` size; the
 * secondary action takes the same chip in the outline treatment. sas-site's
 * `text` appearance is not offered here (composer roadmap D8), so both sit in
 * the one chip size and the row's 24px gap is the Paper pair's.
 */
const ACTION_VARIANT = { default: 'default', outline: 'outline' } as const

type Appearance = keyof typeof ACTION_VARIANT

const appearanceOf = (value: unknown): Appearance => (value === 'outline' ? 'outline' : 'default')

/**
 * The row: each link a button in its own appearance, wrapping when the
 * column is too narrow for both. `not-prose` keeps Tailwind Typography's
 * list styling off the row when a prose-mode editor renders the block.
 *
 * sas-site renders these through its CMSLink; this site's CMSLink wears the
 * legacy button, so the row resolves the href and sets the ported button
 * directly.
 */
export const RichTextActions: React.FC<RichTextActionsProps> = ({ className, links }) => {
  const rows = links ?? []
  if (rows.length === 0) return null

  return (
    <ul className={cn('not-prose flex flex-wrap items-center gap-6', className)}>
      {rows.map(({ id, link }, index) => {
        const href = resolveCmsLinkHref(link)
        if (!href) return null
        const appearance = appearanceOf(link.appearance)
        const newTabProps = link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
        return (
          <li key={id ?? index}>
            <Button asChild size="action" variant={ACTION_VARIANT[appearance]}>
              <Link href={href} {...newTabProps}>
                {link.label}
              </Link>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
