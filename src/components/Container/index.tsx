import type { ReactNode, Ref } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Page widths. Tokens live in `globals.css` (`--max-width-content-*`).
 *
 * - default: the site's `container`, the page column with its breakpoint
 *   max-widths and padding (sas-site's is a flat 96rem; this site keeps its own)
 * - full: edge to edge, no gutters — viewport bleed
 * - narrow: 40rem / 640px — single-column reading
 */
const containerWidthClasses = {
  default: 'container',
  narrow: 'container container-narrow',
  full: 'container-full',
} as const

export type ContainerWidth = keyof typeof containerWidthClasses

export const Container = ({
  children,
  width = 'default',
  className,
  ref,
}: {
  children: ReactNode
  width?: ContainerWidth | null
  className?: string
  ref?: Ref<HTMLDivElement>
}) => (
  <div className={cn(containerWidthClasses[width || 'default'], className)} ref={ref}>
    {children}
  </div>
)
