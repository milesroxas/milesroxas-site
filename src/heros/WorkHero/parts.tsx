import type * as React from 'react'
import { cn } from '@/utilities/ui'

/**
 * The opening's load-in, in ms after the hero mounts. The title leads and
 * gets the most motion (each word rises out of its own line); the facts and
 * capabilities follow as quieter blur-ins, and the media wipes open between
 * them (`WorkHeroMedia`, 360ms). Words and list items step 40-70ms apart.
 */
const BEAT = {
  rule: 0,
  eyebrow: 80,
  title: 160,
  word: 40,
  facts: 400,
  fact: 80,
  capabilities: 620,
  capability: 70,
} as const

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as React.CSSProperties

/** Small copy: fades up out of a light blur. */
const enterIn = 'motion-safe:animate-hero-in motion-reduce:animate-hero-fade'

/** A hairline that draws from its left end. */
function Rule({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn(
        'block h-px shrink-0 origin-left bg-foreground motion-safe:animate-hero-draw motion-reduce:animate-hero-fade',
        className,
      )}
      data-slot="work-hero-rule"
      {...props}
    />
  )
}

function WorkHeroRoot({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn(
        'grid grid-rows-[auto_1fr_auto] gap-y-10 bg-background px-gutter pt-[calc(var(--chrome-top)+--spacing(6))] pb-[calc(var(--dock-clearance)+--spacing(8))] text-foreground md:gap-y-8 md:pt-[calc(var(--chrome-top)+--spacing(2))] md:has-data-[slot=work-hero-media]:min-h-svh',
        className,
      )}
      data-slot="work-hero"
      {...props}
    />
  )
}

/** The title lockup and the facts: stacked on a phone, opposite ends from md. */
function WorkHeroHead({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid gap-8 md:grid-cols-[minmax(0,36.25rem)_1fr] md:items-center md:gap-12',
        className,
      )}
      data-slot="work-hero-head"
      {...props}
    />
  )
}

function WorkHeroLockup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col items-start gap-6 md:gap-8', className)}
      data-slot="work-hero-lockup"
      {...props}
    />
  )
}

function WorkHeroEyebrow({ children, className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'flex items-center gap-4.5 font-medium font-mono text-sm/none md:text-base/none',
        className,
      )}
      data-slot="work-hero-eyebrow"
      {...props}
    >
      <Rule className="w-6" style={enterAt(BEAT.rule)} />
      <span className={cn('text-trim', enterIn)} style={enterAt(BEAT.eyebrow)}>
        {children}
      </span>
    </p>
  )
}

/**
 * The title, word by word: each word rises out of a clip the height of its
 * line. The clip's padding gives descenders room; the margin cancels it.
 */
function WorkHeroTitle({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'h1'>, 'children'> & { children: string }) {
  const words = children.split(/\s+/).filter(Boolean)
  return (
    <h1
      className={cn('text-pretty text-title motion-reduce:animate-hero-fade', className)}
      data-slot="work-hero-title"
      {...props}
    >
      {words.map((word, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a title can repeat a word; position is its identity
        <span key={i}>
          <span className="-my-[0.15em] inline-block overflow-clip py-[0.15em] align-top">
            <span
              className="inline-block motion-safe:animate-hero-rise"
              style={enterAt(BEAT.title + i * BEAT.word)}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </h1>
  )
}

function WorkHeroFacts({ className, ...props }: React.ComponentProps<'dl'>) {
  return (
    <dl
      className={cn(
        'flex flex-wrap gap-x-10 gap-y-6 md:flex-col md:items-end md:gap-6 md:text-right',
        className,
      )}
      data-slot="work-hero-facts"
      {...props}
    />
  )
}

function WorkHeroFact({
  index,
  label,
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & { index: number; label: string }) {
  return (
    <div
      className={cn('flex flex-col gap-2 md:items-end', enterIn, className)}
      data-slot="work-hero-fact"
      style={enterAt(BEAT.facts + index * BEAT.fact)}
      {...props}
    >
      <dt className="font-medium font-mono text-trim text-xs/none">{label}</dt>
      <dd className="text-base">{children}</dd>
    </div>
  )
}

/** The middle row: centers the media in whatever height the opening has left. */
function WorkHeroStage({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      data-slot="work-hero-stage"
      {...props}
    />
  )
}

function WorkHeroCapabilities({
  items,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & { items: string[] }) {
  return (
    <div
      className={cn('flex flex-col gap-4 md:pt-8', className)}
      data-slot="work-hero-capabilities"
      {...props}
    >
      <p
        className={cn('font-medium font-mono text-trim text-xs/none', enterIn)}
        style={enterAt(BEAT.capabilities)}
      >
        Capabilities
      </p>
      <ul className="flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
        {items.map((item, i) => {
          const at = enterAt(BEAT.capabilities + (i + 1) * BEAT.capability)
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: capabilities are plain strings and may repeat
            <li className="flex items-center gap-2" key={i}>
              {i > 0 && <Rule className="w-10 max-md:hidden" style={at} />}
              <span className={cn('text-lg/none md:text-xl/none', enterIn)} style={at}>
                {item}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export {
  WorkHeroCapabilities,
  WorkHeroEyebrow,
  WorkHeroFact,
  WorkHeroFacts,
  WorkHeroHead,
  WorkHeroLockup,
  WorkHeroRoot,
  WorkHeroStage,
  WorkHeroTitle,
}
