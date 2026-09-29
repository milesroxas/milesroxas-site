'use client'

import { IconArrowUp, IconPlayerStopFilled } from '@tabler/icons-react'
import { InputGroupButton } from '@/components/ui/input-group'
import { cn } from '@/utilities/ui'

type AskSubmitButtonProps = Omit<
  React.ComponentProps<typeof InputGroupButton>,
  'type' | 'variant' | 'size' | 'disabled' | 'onClick' | 'children'
> & {
  /** A reply is in flight: the button becomes Stop. */
  busy: boolean
  /** Idle send is allowed (question long enough). */
  canSend: boolean
  /** Aborts the in-flight reply. */
  onStop: () => void
  /** Glyph sizing override, e.g. the menu pill's touch scale. */
  iconClassName?: string
}

/**
 * The button in the one-line Ask field (`InputGroup variant="pill"`): a 34px
 * disc on a phone with its reach grown to 46px, 40px from `md`. With nothing
 * to send it rests as a quiet disc with a faint arrow rather than a dimmed
 * black one, so the field reads as waiting, not broken.
 */
export const askComposerButton =
  'relative size-8.5 after:absolute after:-inset-1.5 disabled:bg-foreground/8 disabled:text-foreground/35 disabled:opacity-100 md:size-10 md:after:hidden'
export const askComposerIcon = 'size-4'

/**
 * The composer's one button across every Ask surface. Idle it submits the
 * form; while a reply is in flight it is an enabled Stop, never a dimmed
 * disabled arrow (a half-opacity button reads as broken, not busy). The two
 * glyphs stack in one cell and crossfade with a light scale, so the state
 * change is a morph rather than a swap. Same-size glyphs keep the disc still.
 */
export function AskSubmitButton({
  busy,
  canSend,
  onStop,
  className,
  iconClassName,
  ...props
}: AskSubmitButtonProps) {
  return (
    <InputGroupButton
      type={busy ? 'button' : 'submit'}
      variant="default"
      size="icon-sm"
      disabled={!busy && !canSend}
      aria-busy={busy || undefined}
      onClick={busy ? onStop : undefined}
      className={className}
      {...props}
    >
      <span className="grid *:[grid-area:1/1]">
        <IconArrowUp
          aria-hidden
          className={cn(
            'motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:ease-out',
            busy && 'scale-50 opacity-0',
            iconClassName,
          )}
        />
        <IconPlayerStopFilled
          aria-hidden
          className={cn(
            'motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:ease-out',
            !busy && 'scale-50 opacity-0',
            iconClassName,
          )}
        />
      </span>
      <span className="sr-only">{busy ? 'Stop' : 'Ask'}</span>
    </InputGroupButton>
  )
}
