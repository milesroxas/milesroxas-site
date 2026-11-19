'use client'

import { useRef, useState } from 'react'
import { pixelFont } from '@/heros/InstrumentHero/pixelFont'
import { AimLayer } from './AimLayer'
import { ctaMeta } from './Field'
import { type CtaTarget, INSTRUMENT_LOOK, RETICLE } from './look'
import { PixelReveal } from './PixelReveal'
import { useCommit } from './useCommit'

const readout =
  'text-fluoro font-[family-name:var(--font-geist-pixel-square)] text-[22px] leading-none tabular-nums'

/**
 * Instrument: a spec sheet beside an ink panel running the field. Pointing
 * wakes the panel and paints the preview picture in through large cells; the
 * yellow readout counts how much of it shows. The reticle locks on every part
 * of the sheet as a whole (`data-aim="block"`), and turns orange over the
 * panel. A target with no picture keeps the panel as field and coordinates.
 */
export function CtaInstrument({ target }: { target: CtaTarget }) {
  const { committed, onClick } = useCommit(target)
  const [awake, setAwake] = useState(false)
  const [overPanel, setOverPanel] = useState(false)
  const [keyboard, setKeyboard] = useState(false)
  const revealRef = useRef<HTMLSpanElement>(null)
  const { aim, panel, paint, panelGap } = INSTRUMENT_LOOK
  const image = target.image

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the title link is the keyboard path
    <div
      className="group/cta bg-background border-foreground relative isolate grid gap-8 border-t pt-3 shadow-[0_0_0_24px_var(--background)] md:grid-cols-12 md:gap-x-[1.2vw]"
      data-committed={committed || undefined}
      data-cursor-zone
      onBlur={() => {
        setAwake(false)
        setKeyboard(false)
      }}
      onClick={onClick}
      onFocus={(e) => {
        setAwake(true)
        setKeyboard(e.target.matches(':focus-visible'))
      }}
      onPointerEnter={() => setAwake(true)}
      onPointerLeave={() => setAwake(false)}
    >
      {/* The aim layer: block-wide reticle, locks and ripples, with no marks of its own.
          The 24px page-colour spread above gives its inverting lines a ground past the edge. */}
      <AimLayer
        config={{ ...RETICLE, ...aim }}
        readouts={false}
        tone={overPanel ? 'spot' : 'invert'}
      />
      <div className="flex flex-col gap-8 md:col-span-6">
        <div className="flex justify-between gap-4" data-reveal>
          <span className={ctaMeta} data-aim="text">
            next / {target.label}
          </span>
          <span className={ctaMeta} data-aim="text">
            {target.code}
          </span>
        </div>
        <h2
          className="max-w-[22ch] text-[2.1rem] leading-[1.1] font-light tracking-[-0.02em] text-balance"
          data-reveal
        >
          <a
            className="group-data-[committed]/cta:text-accent transition-[color] duration-300 outline-none"
            href={target.href}
          >
            {target.title}
          </a>
        </h2>
        {target.line && (
          <p className="max-w-[44ch] text-pretty" data-aim="block" data-reveal>
            {target.line}
          </p>
        )}
        {target.facts.length > 0 && (
          <dl className="border-foreground/15 grid grid-cols-3 gap-x-4 border-t pt-3" data-reveal>
            {target.facts.map((fact) => (
              <div className="flex min-w-0 flex-col gap-1" data-aim="block" key={fact.label}>
                <dt className={ctaMeta}>{fact.label}</dt>
                <dd className="truncate text-sm">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <span
          aria-hidden
          className="decoration-accent mt-auto w-fit underline decoration-[3px] underline-offset-[6px]"
          data-aim="act"
          data-reveal
        >
          {target.action}
        </span>
      </div>
      <div
        className="relative aspect-[4/3] md:col-span-5 md:col-start-8"
        onPointerEnter={() => setOverPanel(true)}
        onPointerLeave={() => setOverPanel(false)}
      >
        <div
          className={`${pixelFont.variable} bg-background text-foreground ring-foreground/15 absolute inset-0 isolate overflow-clip ring-1`}
          data-theme="dark"
        >
          {/* No lock here: a lock blanks the field inside its box, and this box is the panel. */}
          <AimLayer
            config={{
              ...RETICLE,
              tone: awake || committed ? panel.wakeTone : panel.restTone,
              cell: panel.cell,
              speed: panel.speed,
              shape: panel.shape,
              aimLock: false,
              crosshair: false,
            }}
            reticle={false}
          />
          {image && (
            <PixelReveal
              fill={committed || keyboard}
              image={image}
              params={paint}
              readout={revealRef}
            />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-3.5 top-3 z-20 flex items-start justify-between"
          >
            <span className={ctaMeta}>{image ? 'reveal' : 'x / y'}</span>
            {image ? (
              <span className={readout} ref={revealRef}>
                000/100
              </span>
            ) : (
              <span className={readout} data-aim-out="cell">
                000·000
              </span>
            )}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-3.5 bottom-3 z-20 flex justify-between"
          >
            <span className={ctaMeta}>
              {committed ? 'fire / open' : awake ? 'lock / open' : 'standby'}
            </span>
            {image ? (
              <span className={ctaMeta}>
                x / y <span data-aim-out="cell">000·000</span>
              </span>
            ) : (
              <span className={ctaMeta}>{target.code}</span>
            )}
          </div>
        </div>
        {/* The panel's lock target stands off its edge, so the corners clear it. */}
        <div aria-hidden className="absolute" data-aim="media" style={{ inset: -panelGap }} />
      </div>
      <span
        aria-hidden
        className="ring-foreground pointer-events-none absolute -inset-2 hidden ring-2 group-has-[a:focus-visible]/cta:block"
      />
    </div>
  )
}
