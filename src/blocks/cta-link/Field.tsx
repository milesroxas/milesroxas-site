'use client'

import { AimLayer } from './AimLayer'
import { type CtaTarget, FIELD_LOOK, RETICLE } from './look'
import { useCommit } from './useCommit'

export const ctaMeta =
  'font-mono text-[11px] leading-snug tracking-[0.06em] whitespace-nowrap text-muted-foreground uppercase tabular-nums'

/**
 * Field: a full-bleed band with the aim field as its ground and the target's
 * title as display type. Pointing at it inks the title orange; the whole band
 * opens the target. It spends the page's one full-bleed break.
 */
export function CtaField({ target }: { target: CtaTarget }) {
  const { committed, onClick } = useCommit(target)

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the title link is the keyboard path
    <div
      className="group/cta bg-background text-foreground relative isolate overflow-clip"
      data-committed={committed || undefined}
      data-cursor-zone
      onClick={onClick}
      style={
        {
          '--ink-ms': `${FIELD_LOOK.inkMs}ms`,
          '--ink-ease': FIELD_LOOK.inkEase,
        } as React.CSSProperties
      }
    >
      <AimLayer config={{ ...RETICLE, ...FIELD_LOOK.field }} />
      <div className="container flex flex-col gap-10 py-[11vh] md:gap-14">
        <div
          className="border-foreground/15 flex justify-between gap-4 border-b pb-2.5"
          data-reveal
        >
          <span className={ctaMeta} data-aim="text">
            next / {target.label}
          </span>
          <span className={ctaMeta} data-aim="text">
            {target.code}
          </span>
        </div>
        <h2
          className="max-w-[16ch] text-[clamp(2.75rem,7vw,8rem)] leading-[0.98] font-light tracking-[-0.035em] text-balance lowercase md:max-w-[20ch]"
          data-reveal
        >
          <a
            className="focus-visible:text-accent group-hover/cta:text-accent group-data-[committed]/cta:text-accent transition-[color] duration-[var(--ink-ms)] ease-[var(--ink-ease)] outline-none"
            href={target.href}
          >
            {target.title}
          </a>
        </h2>
        <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-x-[1.2vw]" data-reveal>
          {target.line && (
            <p className="max-w-[44ch] text-lg text-pretty md:col-span-5" data-aim="block">
              {target.line}
            </p>
          )}
          <span
            aria-hidden
            className="decoration-accent w-fit text-lg underline decoration-[3px] underline-offset-[6px] md:col-span-4 md:col-start-9 md:justify-self-end"
            data-aim="act"
          >
            {target.action}
          </span>
        </div>
        <div
          aria-hidden
          className="border-foreground/15 flex justify-between gap-4 border-t pt-2.5"
        >
          <span className={ctaMeta} data-aim="text">
            aim / <span data-aim-out="target">idle</span>
          </span>
          <span className={`${ctaMeta} hidden md:inline`} data-aim="text" data-aim-out="cell" />
        </div>
      </div>
      <span
        aria-hidden
        className="ring-foreground pointer-events-none absolute inset-2 hidden ring-2 group-has-[a:focus-visible]/cta:block"
      />
    </div>
  )
}
