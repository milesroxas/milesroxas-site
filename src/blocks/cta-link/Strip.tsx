'use client'

import { AimLayer } from './AimLayer'
import styles from './cta-link.module.css'
import { ctaMeta } from './Field'
import { type CtaTarget, RETICLE, STRIP_LOOK } from './look'
import { useCommit } from './useCommit'

/**
 * Strip: one quiet index row between rules. The field opens behind it only
 * on intent, from where the pointer came in, and closes faster than it
 * opened. It spends no moment and no break.
 */
export function CtaStrip({ target }: { target: CtaTarget }) {
  const { committed, onClick } = useCommit(target)

  const onEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`)
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the title link is the keyboard path
    <div
      className={`${styles.strip} group/cta bg-background text-foreground border-foreground/15 relative isolate border-y shadow-[0_0_0_24px_var(--background)]`}
      data-committed={committed || undefined}
      data-cursor-zone
      onClick={onClick}
      onPointerEnter={onEnter}
      style={
        {
          '--reveal-in': `${STRIP_LOOK.revealMs}ms`,
          '--reveal-out': `${STRIP_LOOK.revealMs * STRIP_LOOK.exitRatio}ms`,
          '--reveal-ease': STRIP_LOOK.revealEase,
        } as React.CSSProperties
      }
    >
      <AimLayer canvasClassName={styles.stripField} config={{ ...RETICLE, ...STRIP_LOOK.field }} />
      <div className="grid grid-cols-12 gap-x-[1.2vw] gap-y-4 py-9" data-reveal>
        <div className="col-span-12 flex gap-4 md:col-span-2 md:flex-col md:gap-1">
          <span className={ctaMeta} data-aim="text">
            {target.code}
          </span>
          <span className={ctaMeta} data-aim="text">
            {target.label}
          </span>
        </div>
        <div className="col-span-12 flex flex-col gap-3 md:col-span-8">
          <h2 className="text-[2.1rem] leading-[1.1] font-light tracking-[-0.02em] text-balance">
            <a
              className="group-data-[committed]/cta:text-accent transition-[color] duration-300 outline-none"
              href={target.href}
            >
              {target.title}
            </a>
          </h2>
          {target.line && (
            <p className="text-muted-foreground max-w-[60ch] text-pretty" data-aim="block">
              {target.line}
            </p>
          )}
        </div>
        <div className="col-span-12 flex md:col-span-2 md:justify-end">
          <span
            aria-hidden
            className="decoration-accent w-fit underline decoration-[3px] underline-offset-[6px] md:text-right"
            data-aim="act"
          >
            {target.action}
          </span>
        </div>
      </div>
      <span
        aria-hidden
        className="ring-foreground pointer-events-none absolute -inset-1 hidden ring-2 group-has-[a:focus-visible]/cta:block"
      />
    </div>
  )
}
