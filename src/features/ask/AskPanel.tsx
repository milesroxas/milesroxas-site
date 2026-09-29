'use client'

import { IconAlertCircle, IconArrowUpLeft, IconX } from '@tabler/icons-react'
import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { createRef, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AskGlyph } from '@/components/SiteChrome/glyphs'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { usePresence } from '@/hooks/use-presence'
import { useSheetDrag } from '@/hooks/use-sheet-drag'
import { cn } from '@/utilities/ui'
import { ASK_FOLLOW_UP_PLACEHOLDER, ASK_INTRO, ASK_PLACEHOLDER, ASK_RETRY, ASK_SCOPE } from './copy'
import type { AskHandoffTerms } from './handoff'
import { errorText, TranscriptItems } from './messages'
import { transcriptItemEnter } from './motion'
import { ASK_NOTICE_SHORT } from './retention'
import { AskSubmitButton, askComposerButton, askComposerIcon } from './SubmitButton'
import { useAskChat } from './useAskChat'
import { ASK_QUESTION_LENGTH } from './vocabulary'

type AskChat = ReturnType<typeof useAskChat>

export type AskPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Below `md` Ask is a bottom sheet; above, the panel that grows out of the dock's button. */
  sheet: boolean
  /** The last open or close came from the keyboard: it happens at once, with no morph to wait through. */
  instant: boolean
  /** The dock's Ask button: where the field grows from, and where focus returns. */
  triggerRef: RefObject<HTMLButtonElement | null>
  /** Mounted (open, or still playing its exit), so the dock can hand its button over. */
  onPresenceChange: (present: boolean) => void
  /** Site Info › Ask › Suggested questions. */
  suggestions: string[]
  terms: AskHandoffTerms
}

/**
 * Ask, opened from the dock. One conversation (`AskSession`) and one draft,
 * whichever surface shows it: the draft lives here, above both, so closing
 * Ask or turning a phone does not lose what was typed.
 *
 * Opening a page from an answer closes Ask; the dock then shows that page.
 */
export function AskPanel({
  open,
  onOpenChange,
  sheet,
  suggestions,
  terms,
  ...props
}: AskPanelProps) {
  const chat = useAskChat({})
  const pathname = usePathname()
  const lenis = useLenis()

  // A source link or the contact page navigates: Ask steps aside for it.
  const openedOn = useRef(pathname)
  useEffect(() => {
    if (open && pathname !== openedOn.current) onOpenChange(false)
    openedOn.current = pathname
  }, [open, pathname, onOpenChange])

  // Lenis writes the page's scroll; it rests while Ask holds the screen.
  useEffect(() => {
    if (!open || !lenis) return
    lenis.stop()
    return () => lenis.start()
  }, [open, lenis])

  const body = <AskBody chat={chat} sheet={sheet} suggestions={suggestions} terms={terms} />

  return sheet ? (
    <AskSheet chat={chat} onOpenChange={onOpenChange} open={open} {...props}>
      {body}
    </AskSheet>
  ) : (
    <AskDialog chat={chat} onOpenChange={onOpenChange} open={open} {...props}>
      {body}
    </AskDialog>
  )
}

type SurfaceProps = Pick<
  AskPanelProps,
  'open' | 'onOpenChange' | 'instant' | 'triggerRef' | 'onPresenceChange'
> & { chat: AskChat; children: React.ReactNode }

/**
 * iOS's sheet curve: an extremely steep start, so the field is already most
 * of the way open by the time the eye has found it.
 */
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)'
/** The site's settle curve (`--ease-out-quint`); WAAPI cannot read the token. */
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'
/**
 * The field's open clip reaches past its box, so its shadow and focus halo
 * are never cut while it grows; at rest the clip is dropped altogether.
 */
const FIELD_OPEN = 'inset(-48px -48px -48px -48px round 74px)'

/** The dock's button as a clip on the field: the shape the field grows out of and returns into. */
function seedClip(field: HTMLElement, trigger: HTMLElement | null) {
  if (!trigger) return FIELD_OPEN
  const f = field.getBoundingClientRect()
  const t = trigger.getBoundingClientRect()
  return `inset(${t.top - f.top}px ${f.right - t.right}px ${f.bottom - t.bottom}px ${t.left - f.left}px round ${t.height / 2}px)`
}

type MorphRefs = {
  scrim: RefObject<HTMLDivElement | null>
  surface: RefObject<HTMLDivElement | null>
  panel: RefObject<HTMLElement | null>
  field: RefObject<HTMLDivElement | null>
  close: RefObject<HTMLButtonElement | null>
}

/**
 * The morph between the dock's Ask button and the open panel, both ways, on
 * the Web Animations API: the field's clip opens out of the button's shape,
 * its contents sharpen in behind the edge, the close button follows, and the
 * panel rises out of the field's top edge on the settle curve. Closing plays
 * the same path back, faster, from wherever the opening had reached, so a
 * second press mid-flight reverses instead of restarting.
 *
 * Opened from the keyboard, or closed with Escape, it skips the morph: a
 * shortcut should never wait on an animation. Reduced motion is a 150ms
 * cross-fade of the surface and the scrim.
 */
function useAskMorph({
  open,
  mounted,
  instant,
  escaped,
  reducedMotion,
  triggerRef,
}: {
  open: boolean
  mounted: boolean
  /** The last open or close came from the keyboard: it plays no morph. */
  instant: boolean
  /** Set by Escape on the way out: the close plays no morph. */
  escaped: RefObject<boolean>
  reducedMotion: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
}): MorphRefs {
  const [refs] = useState<MorphRefs>(() => ({
    scrim: createRef(),
    surface: createRef(),
    panel: createRef(),
    field: createRef(),
    close: createRef(),
  }))
  const running = useRef<Animation[]>([])

  useLayoutEffect(() => {
    const { scrim, surface, panel, field, close } = {
      scrim: refs.scrim.current,
      surface: refs.surface.current,
      panel: refs.panel.current,
      field: refs.field.current,
      close: refs.close.current,
    }
    if (!mounted || !scrim || !surface || !panel || !field || !close) {
      // Unmounted: the next open starts from the button, not from a run on nodes that are gone.
      running.current = []
      return
    }
    const skip = instant || (!open && escaped.current)
    if (open) escaped.current = false

    // A reversal starts where the last run had reached, read before it is dropped.
    const interrupted = running.current.length > 0
    const from = {
      clip: interrupted ? getComputedStyle(field).clipPath : null,
      panel: interrupted ? Number(getComputedStyle(panel).opacity) : null,
    }
    for (const animation of running.current) animation.cancel()
    running.current = []
    if (skip) return

    const batch: Animation[] = []
    const play = (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
      batch.push(element.animate(keyframes, { fill: 'both', ...options }))
    const fieldContent = Array.from(field.children)

    if (reducedMotion) {
      const fade = open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }]
      play(surface, fade, { duration: 150, easing: 'ease' })
      play(scrim, fade, { duration: 150, easing: 'ease' })
    } else if (open) {
      play(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease' })
      play(
        field,
        [{ clipPath: from.clip ?? seedClip(field, triggerRef.current) }, { clipPath: FIELD_OPEN }],
        {
          duration: 380,
          easing: EASE_DRAWER,
        },
      )
      for (const element of fieldContent)
        play(
          element,
          [
            { opacity: 0, filter: 'blur(2px)' },
            { opacity: 1, filter: 'blur(0px)' },
          ],
          { duration: 200, delay: 100, easing: EASE_OUT },
        )
      play(
        close,
        [
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1 },
        ],
        { duration: 240, delay: 140, easing: EASE_OUT },
      )
      play(
        panel,
        [
          { opacity: from.panel ?? 0, scale: 0.96, translate: '0 12px' },
          { opacity: 1, scale: 1, translate: '0 0' },
        ],
        { duration: 340, delay: 60, easing: EASE_OUT },
      )
    } else {
      play(
        panel,
        [
          { opacity: from.panel ?? 1, scale: 1, translate: '0 0' },
          { opacity: 0, scale: 0.97, translate: '0 8px' },
        ],
        { duration: 180, easing: EASE_OUT },
      )
      play(close, [{ opacity: 1 }, { opacity: 0, scale: 0.8 }], { duration: 120, easing: EASE_OUT })
      for (const element of fieldContent)
        play(element, [{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: EASE_OUT })
      play(
        field,
        [{ clipPath: from.clip ?? FIELD_OPEN }, { clipPath: seedClip(field, triggerRef.current) }],
        {
          duration: 240,
          delay: 40,
          easing: EASE_DRAWER,
        },
      )
      play(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease' })
    }
    running.current = batch

    // Open and settled, nothing stays held: the panel owns its shadow and the
    // field its halo. A close holds its last frame until the surface unmounts.
    if (open)
      Promise.all(batch.map((animation) => animation.finished)).then(
        () => {
          if (running.current !== batch) return
          for (const animation of batch) animation.cancel()
          running.current = []
        },
        () => {},
      )
  }, [open, mounted, instant, escaped, reducedMotion, triggerRef, refs])

  return refs
}

/** Desktop: a modal dialog anchored to the dock, with the field where the Ask button was. */
function AskDialog({
  open,
  onOpenChange,
  instant,
  triggerRef,
  onPresenceChange,
  chat,
  children,
}: SurfaceProps) {
  const reducedMotion = usePrefersReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const escaped = useRef(false)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const { mounted } = usePresence(surfaceRef, open)
  const refs = useAskMorph({ open, mounted, instant, escaped, reducedMotion, triggerRef })

  useEffect(() => onPresenceChange(mounted), [mounted, onPresenceChange])

  // Focus goes back to the dock the moment Ask closes, not once the exit has played.
  const wasOpen = useRef(open)
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open, triggerRef])

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      {/* Rendered in place, not portaled: a portal mounts its children a
          commit late, and the morph has to measure them on the commit that
          opens Ask. The dialog is fixed and on its own layer either way. */}
      {mounted && (
        <>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-foreground/20"
            forceMount
            ref={refs.scrim}
          />
          <DialogPrimitive.Content
            className="ask-surface"
            data-chrome=""
            forceMount
            onCloseAutoFocus={(event) => event.preventDefault()}
            onEscapeKeyDown={() => {
              escaped.current = true
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              inputRef.current?.focus({ preventScroll: true })
            }}
            ref={(element) => {
              surfaceRef.current = element
              refs.surface.current = element
            }}
          >
            <section className="ask-panel" ref={refs.panel}>
              <header className="ask-panel-header">
                <DialogPrimitive.Title className="font-semibold text-base/5.5">
                  Ask
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-[0.8125rem]/[1.125rem] text-muted-foreground">
                  {ASK_SCOPE}
                </DialogPrimitive.Description>
              </header>
              {children}
            </section>
            <div className="flex items-center gap-2.5">
              <AskField
                chat={chat}
                className="flex-1"
                fieldClassName="ask-field-shadow"
                fieldRef={refs.field}
                inputRef={inputRef}
              />
              <DialogPrimitive.Close className="ask-close chrome-focus pressable" ref={refs.close}>
                <IconX aria-hidden className="size-4" stroke={1.75} />
                <span className="sr-only">Close Ask</span>
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </>
      )}
    </DialogPrimitive.Root>
  )
}

/**
 * Phone: a floating sheet in thumb reach, the field at its foot. Tap the
 * scrim, press close, or drag it down by the handle.
 */
function AskSheet({
  open,
  onOpenChange,
  triggerRef,
  onPresenceChange,
  chat,
  children,
}: SurfaceProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // A drag has already played the exit; the sheet must not play it again.
  const [dragged, setDragged] = useState(false)
  const dragHandlers = useSheetDrag(sheetRef, () => {
    setDragged(true)
    onOpenChange(false)
  })

  // The dock's button stays where it is under the sheet's scrim.
  useEffect(() => onPresenceChange(false), [onPresenceChange])

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn(
          'ask-sheet gap-0 rounded-[2.375rem] border-t-0 bg-popover p-0 text-foreground shadow-[0_0_0_0.5px_rgb(0_0_0/0.06),0_-8px_40px_rgb(12_12_14/0.16)]',
          'data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-[max(0.5rem,env(safe-area-inset-bottom))]',
          'duration-300 ease-(--ease-out-quint) data-closed:duration-200',
          'data-[side=bottom]:data-open:slide-in-from-bottom-full data-[side=bottom]:data-closed:slide-out-to-bottom-full',
          'motion-reduce:data-[side=bottom]:data-open:slide-in-from-bottom-0 motion-reduce:data-[side=bottom]:data-closed:slide-out-to-bottom-0',
          dragged && 'data-closed:animate-none',
        )}
        onCloseAutoFocus={(event) => {
          setDragged(false)
          event.preventDefault()
          triggerRef.current?.focus({ preventScroll: true })
        }}
        // A phone gets no raised keyboard it did not ask for: the sheet
        // takes focus, and the field waits for a tap.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          sheetRef.current?.focus({ preventScroll: true })
        }}
        overlayClassName="bg-foreground/22 supports-backdrop-filter:backdrop-blur-none"
        data-chrome=""
        ref={sheetRef}
        showCloseButton={false}
        side="bottom"
      >
        <div
          aria-hidden
          // The grabber is small; its hit area also covers the title row under it.
          className="relative flex h-2.75 shrink-0 touch-none items-end justify-center before:absolute before:inset-x-0 before:top-0 before:h-14"
          {...dragHandlers}
        >
          <span className="h-1.25 w-9 rounded-full bg-foreground/25" />
        </div>
        <div className="flex h-11 shrink-0 items-center justify-between pr-3.5 pl-5.5">
          <SheetTitle className="flex items-center gap-2 font-semibold text-[1.0625rem]/5.5">
            <AskGlyph className="size-4.5 text-brand" />
            Ask
          </SheetTitle>
          <SheetDescription className="sr-only">{ASK_SCOPE}</SheetDescription>
          <button
            className="pressable relative flex size-7.5 items-center justify-center rounded-full bg-foreground/8 text-foreground/75 after:absolute after:size-11"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <IconX aria-hidden className="size-3" stroke={2.25} />
            <span className="sr-only">Close Ask</span>
          </button>
        </div>
        {children}
        <div className="flex shrink-0 flex-col gap-2 px-3 pt-2.5 pb-6.5">
          <AskField chat={chat} inputRef={inputRef} />
          <p className="text-center text-muted-foreground text-xs/4">{ASK_NOTICE_SHORT}</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * The one-line field: Enter sends, the disc sends or stops. The desktop
 * field leads with Ask's mark; on a phone the sheet's title already carries
 * it. The placeholder follows the conversation: an invitation before the
 * first question, a follow-up after.
 */
function AskField({
  chat,
  className,
  fieldClassName,
  fieldRef,
  inputRef,
}: {
  chat: AskChat
  className?: string
  fieldClassName?: string
  fieldRef?: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const { question, setQuestion, submit, busy, canSend, stop, messages } = chat
  return (
    <form className={cn('min-w-0', className)} onSubmit={submit}>
      <InputGroup className={fieldClassName} ref={fieldRef} variant="pill">
        <InputGroupAddon className="p-0 max-md:hidden">
          <AskGlyph className="size-4.5 text-brand" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Your question"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={ASK_QUESTION_LENGTH.max}
          name="question"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={messages.length > 0 ? ASK_FOLLOW_UP_PLACEHOLDER : ASK_PLACEHOLDER}
          ref={inputRef}
          value={question}
        />
        <AskSubmitButton
          busy={busy}
          canSend={canSend}
          className={askComposerButton}
          iconClassName={askComposerIcon}
          onStop={stop}
        />
      </InputGroup>
    </form>
  )
}

/**
 * What the panel holds: the suggested questions before anything is asked,
 * then the transcript. A failed question names the problem and the way on,
 * with the question already back in the field.
 */
function AskBody({
  chat,
  sheet,
  suggestions,
  terms,
}: {
  chat: AskChat
  sheet: boolean
  suggestions: string[]
  terms: AskHandoffTerms
}) {
  const { messages, status, error, sent, markSent, feedback, sendQuestion, question } = chat
  const failure = error ? (
    <div
      className={cn(
        'mx-5.5 mb-5 flex items-start gap-2.5 rounded-[0.875rem] bg-destructive/6 px-3.5 py-3 md:mx-6',
        transcriptItemEnter,
      )}
      role="alert"
    >
      <IconAlertCircle aria-hidden className="mt-px size-4.5 shrink-0 text-destructive" />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-destructive text-sm/5">{errorText(error)}</p>
        {question && (
          <p className="text-[0.8125rem]/[1.125rem] text-muted-foreground">{ASK_RETRY}</p>
        )}
      </div>
    </div>
  ) : null

  if (messages.length === 0) {
    const intro = sheet ? (
      <p className="font-light text-[1.375rem]/7.5 tracking-[-0.01em]">{ASK_INTRO}</p>
    ) : null
    // A failed first question stands alone: the error, and the question back in the field.
    const list =
      !failure && suggestions.length > 0 ? (
        <ul aria-label="Suggested questions" className="flex flex-col gap-2 max-md:pt-1.5">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                className="ask-suggestion chrome-focus pressable pressable-subtle"
                onClick={() => sendQuestion(suggestion)}
                type="button"
              >
                <span className="min-w-0 flex-1">{suggestion}</span>
                <IconArrowUpLeft
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                  stroke={1.75}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null
    return (
      <>
        {(intro || list) && (
          <div className="flex flex-col gap-3.5 px-5.5 pt-1.5 pb-2 md:px-5 md:pt-4.5 md:pb-5">
            {intro}
            {list}
          </div>
        )}
        {failure && <div className={cn(!list && 'md:pt-4.5')}>{failure}</div>}
      </>
    )
  }

  return (
    <>
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport className="ask-transcript" data-lenis-prevent>
            <MessageScrollerContent className="gap-4.5 px-5.5 pt-4.5 pb-5 md:px-6">
              <TranscriptItems
                feedback={feedback}
                messages={messages}
                notice={!sheet}
                onSent={markSent}
                sent={sent}
                status={status}
                terms={terms}
              />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      {failure}
    </>
  )
}
