import { IconCircleCheck } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

type Props = {
  title: string
  lead?: ReactNode
  /** Under the content, past a hairline: the way to the neighbouring form. */
  footer?: ReactNode
  /** On the eyebrow's line: the way to the neighbouring page (Account, Library). */
  aside?: ReactNode
  /** Wide pages (the library) take the full measure; forms keep a short one. */
  wide?: boolean
  children?: ReactNode
}

/** The members area's page: a mono eyebrow, the title, a lead, then the form or the list. */
export function MembersShell({ title, lead, footer, aside, wide, children }: Props) {
  return (
    <div className="px-gutter pt-[calc(var(--chrome-top)+--spacing(12))] pb-[calc(var(--dock-clearance)+--spacing(16))] md:pt-[calc(var(--chrome-top)+--spacing(24))]">
      <div className={cn('w-full', wide ? 'max-w-none' : 'max-w-md md:ml-[calc(100%/12)]')}>
        <header>
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-muted-foreground text-xs/none font-mono tracking-widest uppercase">
              Members
            </p>
            {aside && <div className="shrink-0 text-sm">{aside}</div>}
          </div>
          <h1 className="text-heading-1 mt-4 text-balance">{title}</h1>
          {lead && (
            <div className="text-muted-foreground mt-3 max-w-[42ch] text-base text-pretty [overflow-wrap:anywhere] md:text-lg">
              {lead}
            </div>
          )}
        </header>
        {children && <div className="mt-10 md:mt-12">{children}</div>}
        {footer && (
          <div className="border-border text-muted-foreground mt-12 border-t pt-6 text-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/** A one-line note above a form: what just happened ("Email confirmed"). */
export function MembersNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 flex items-center gap-2 text-sm/5" role="status">
      <IconCircleCheck aria-hidden className="text-primary size-4 shrink-0" stroke={1.75} />
      {children}
    </p>
  )
}

/** The inline link the shells' footers use. */
export const memberLink = 'text-foreground underline underline-offset-4 hover:underline-offset-2'
