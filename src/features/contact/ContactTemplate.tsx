'use client'

import { IconAlertCircle } from '@tabler/icons-react'
import type React from 'react'
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { postInquiry } from '@/blocks/shared/form/post-inquiry'
import { Container } from '@/components/Container'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldMeta,
  FieldPanel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  type AskHandoffIds,
  askInquiryFields,
  clearAskHandoff,
  readAskHandoff,
} from '@/features/ask/handoff'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useLenis } from '@/hooks/useLenis'
import { type ContactPageCopy, fillContactTokens } from '@/shared/content/contact'
import { INQUIRY_EMAIL_INVALID, INQUIRY_MESSAGE_MAX_LENGTH } from '@/shared/content/inquiry'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'

export type ContactTemplateProps = {
  copy: ContactPageCopy
  /** Site Info's contact address, offered beside the form for anyone who would rather write directly. */
  email: string | null
  /** Site Info's reply promise, completing "Miles replies ___". */
  responseTime: string
}

type Values = { name: string; email: string; message: string }
type FieldName = keyof Values
type Errors = Partial<Record<FieldName, string>>

type Receipt = { reference: string | null; name: string; email: string; message: string }

const FORM = 0
const SENT = 1

/** Fields in reading order: the first one with a problem takes focus. */
const FIELD_ORDER: FieldName[] = ['name', 'email', 'message']

/** The counter appears once a message is this close to the limit, not before. */
const COUNTER_FROM = INQUIRY_MESSAGE_MAX_LENGTH - 200

const NETWORK_ERROR =
  'Couldn’t reach the site. Check your connection and send again; your message is still here.'

const validate = (values: Values): Errors => {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = 'Enter your name.'
  if (!isValidEmailAddress(normalizeEmailAddress(values.email)))
    errors.email = INQUIRY_EMAIL_INVALID
  if (!values.message.trim()) errors.message = 'Add a message for Miles.'
  return errors
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

/** Lenis's `scrollTo` shape, for when smooth scrolling is off (touch, or not mounted yet). */
const scrollIntoViewNatively = (element: HTMLElement, { immediate }: { immediate?: boolean }) =>
  element.scrollIntoView({ block: 'center', behavior: immediate ? 'auto' : 'smooth' })

/**
 * The contact page: a three-field note to Miles that becomes its own receipt.
 *
 * Ported from sas-site's general contact template with its load cut down:
 * no eyebrow, no facts list, no "what happens next" steps. The one promise
 * that matters (when Miles replies) sits beside the send button, where the
 * decision is made, and the direct address sits under the lead for anyone
 * who would rather not use a form.
 *
 * Sent, both columns swap in place on the shared panel choreography
 * (`useRevealSwap`, height morphing so the footer glides rather than jumps):
 * the heading thanks the sender by name and says where the reply goes, and
 * the message is read back in their own words. Reduced motion swaps directly.
 *
 * Arriving from Ask's "Contact page" link, the visitor's questions open the
 * message (theirs to edit) and the inquiry carries the chat, as on sas-site.
 */
export function ContactTemplate({ copy, email, responseTime }: ContactTemplateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sentHeadingRef = useRef<HTMLHeadingElement>(null)
  const [panel, setPanel] = useState(FORM)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const lenis = useLenis()

  const swapTo = useRevealSwap({
    rootRef,
    active: panel,
    onSwap: setPanel,
    // The receipt's heading takes focus so a screen reader starts there, and
    // comes into view when the send button left it above the fold (a phone).
    onSettled: () =>
      requestAnimationFrame(() => {
        const heading = sentHeadingRef.current
        heading?.focus({ preventScroll: true })
        if (heading && heading.getBoundingClientRect().top < 0) {
          const scroller = lenis ?? { scrollTo: scrollIntoViewNatively }
          scroller.scrollTo(heading, { offset: -120, immediate: reducedMotion })
        }
      }),
    morphHeight: true,
    scaleMedia: false,
  })

  return (
    <div className="pt-28 pb-40 md:pt-40">
      <Container>
        {/* Clips for the height morph; the padding pair gives focus rings room inside the clip. */}
        <div
          className="-m-2 grid gap-14 overflow-hidden p-2 lg:grid-cols-12 lg:gap-x-8"
          ref={rootRef}
        >
          {panel === SENT && receipt ? (
            <Sent
              copy={copy}
              headingRef={sentHeadingRef}
              receipt={receipt}
              responseTime={responseTime}
            />
          ) : (
            <Compose
              copy={copy}
              email={email}
              onSent={(sent) => {
                setReceipt(sent)
                swapTo(SENT)
              }}
              responseTime={responseTime}
            />
          )}
        </div>
      </Container>
    </div>
  )
}

function Intro({ copy, email }: { copy: ContactPageCopy; email: string | null }) {
  return (
    <div className="flex flex-col items-start gap-6 lg:col-span-5" data-swap="text">
      <h1 className="max-w-[16ch] text-balance text-heading-1">{copy.heading}</h1>
      {copy.lead ? (
        <p className="max-w-[34ch] text-pretty text-lead text-muted-foreground">{copy.lead}</p>
      ) : null}
      {email ? (
        <p className="mt-2 text-base/relaxed text-muted-foreground">
          Prefer email?{' '}
          <a
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground"
            href={`mailto:${email}`}
          >
            {email}
          </a>
        </p>
      ) : null}
    </div>
  )
}

/** The control's link to its problem, when it has one. */
const problemProps = (error: string | undefined, id: string) => ({
  'aria-describedby': error ? `${id}-error` : undefined,
  'aria-invalid': error ? true : undefined,
})

/** The message counter, once the message is close enough to the limit to need one. */
const messageCounter = (count: number) =>
  count >= COUNTER_FROM ? (
    <span aria-live="polite">
      {count.toLocaleString()} / {INQUIRY_MESSAGE_MAX_LENGTH.toLocaleString()}
    </span>
  ) : null

/** The three values and their checks: quiet until the first send, then every edit re-checks. */
function useCheckedValues() {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const controls = { name: nameRef, email: emailRef, message: messageRef }

  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  /** After the first send, every edit re-checks; before it, nothing nags. */
  const [attempted, setAttempted] = useState(false)

  const edit = (field: FieldName, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    // Once a send was tried, the whole form re-checks; before that, only a
    // field already flagged (an address checked on blur) clears as it is fixed.
    if (attempted) setErrors(validate(next))
    else if (errors[field]) setErrors((current) => ({ ...current, [field]: validate(next)[field] }))
  }

  // Checked on leaving the field only once something is typed: an empty field
  // is not a mistake until the visitor tries to send.
  const checkEmail = () => {
    if (values.email.trim() && !isValidEmailAddress(normalizeEmailAddress(values.email)))
      setErrors((current) => ({ ...current, email: INQUIRY_EMAIL_INVALID }))
  }

  /** Flags every problem and focuses the first; true when there is none. */
  const checkAll = () => {
    setAttempted(true)
    const found = validate(values)
    setErrors(found)
    const first = FIELD_ORDER.find((field) => found[field])
    if (first) controls[first].current?.focus()
    return !first
  }

  return { checkAll, checkEmail, controls, edit, errors, setValues, values }
}

/**
 * From Ask: the questions open the message. Read once the browser is here,
 * so the page itself stays static.
 */
function useAskPrefill(setValues: Dispatch<SetStateAction<Values>>) {
  const askRef = useRef<AskHandoffIds | null>(null)
  const [fromAsk, setFromAsk] = useState(false)

  useEffect(() => {
    const prefill = readAskHandoff()
    if (!prefill) return
    askRef.current = prefill.ids
    setValues((current) =>
      current.message.trim()
        ? current
        : { ...current, message: prefill.message.slice(0, INQUIRY_MESSAGE_MAX_LENGTH) },
    )
    setFromAsk(true)
  }, [setValues])

  return { askRef, fromAsk }
}

/** The compose form's state: its values, when they are checked, and the send. */
function useCompose(onSent: (receipt: Receipt) => void) {
  const { checkAll, edit, setValues, ...fields } = useCheckedValues()
  const { askRef, fromAsk } = useAskPrefill(setValues)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const update = (field: FieldName) => (value: string) => {
    edit(field, value)
    setFailure(null)
  }

  async function send(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (sending || !checkAll()) return

    setSending(true)
    setFailure(null)
    const { values } = fields
    const sent = {
      name: values.name.trim(),
      email: normalizeEmailAddress(values.email),
      message: values.message.trim(),
    }
    try {
      const { reference } = await postInquiry({
        type: 'general',
        ...sent,
        role: honeypotRef.current?.value || undefined,
        ...askInquiryFields(askRef.current),
      })
      if (askRef.current) clearAskHandoff()
      onSent({ ...sent, reference })
    } catch (err) {
      // A thrown TypeError is fetch failing to reach the server; anything
      // else carries the intake's own words.
      setFailure(err instanceof Error && !(err instanceof TypeError) ? err.message : NETWORK_ERROR)
      setSending(false)
    }
  }

  // ⌘/Ctrl + Enter sends from inside the message, as in a mail client.
  const sendOnModEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void send()
    }
  }

  return { ...fields, failure, fromAsk, honeypotRef, send, sendOnModEnter, sending, update }
}

type ComposeForm = ReturnType<typeof useCompose>

function Compose({
  copy,
  email,
  onSent,
  responseTime,
}: {
  copy: ContactPageCopy
  email: string | null
  onSent: (receipt: Receipt) => void
  responseTime: string
}) {
  const ids = {
    name: useId(),
    email: useId(),
    message: useId(),
    status: useId(),
  }
  const form = useCompose(onSent)

  return (
    <>
      <Intro copy={copy} email={email} />

      <form
        aria-describedby={form.failure ? ids.status : undefined}
        className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7"
        noValidate
        onSubmit={form.send}
      >
        <NameField form={form} id={ids.name} />
        <EmailField form={form} id={ids.email} />
        <MessageField form={form} id={ids.message} placeholder={copy.messagePlaceholder} />

        <SendRow
          copy={copy}
          failure={form.failure}
          responseTime={responseTime}
          sending={form.sending}
          statusId={ids.status}
        />

        {/* Honeypot. Off-screen rather than display:none, because bots that skip
            hidden fields still fill this one in; the intake drops what it catches. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <input autoComplete="off" name="role" ref={form.honeypotRef} tabIndex={-1} />
        </div>
      </form>
    </>
  )
}

function NameField({ form, id }: { form: ComposeForm; id: string }) {
  return (
    <ContactField error={form.errors.name} htmlFor={id} label="Name">
      <Input
        {...problemProps(form.errors.name, id)}
        autoComplete="name"
        className="text-foreground"
        id={id}
        maxLength={200}
        name="name"
        onChange={(event) => form.update('name')(event.target.value)}
        // A blank placeholder, so the rule darkens once there is a value.
        placeholder=" "
        ref={form.controls.name}
        value={form.values.name}
        variant="line"
      />
    </ContactField>
  )
}

function EmailField({ form, id }: { form: ComposeForm; id: string }) {
  return (
    <ContactField error={form.errors.email} htmlFor={id} label="Email">
      <Input
        {...problemProps(form.errors.email, id)}
        autoComplete="email"
        className="text-foreground"
        id={id}
        inputMode="email"
        name="email"
        onBlur={form.checkEmail}
        onChange={(event) => form.update('email')(event.target.value)}
        placeholder="you@company.com"
        ref={form.controls.email}
        spellCheck={false}
        type="email"
        value={form.values.email}
        variant="line"
      />
    </ContactField>
  )
}

function MessageField({
  form,
  id,
  placeholder,
}: {
  form: ComposeForm
  id: string
  placeholder: string
}) {
  return (
    <ContactField
      error={form.errors.message}
      htmlFor={id}
      label="Message"
      meta={messageCounter(form.values.message.length)}
      note={form.fromAsk ? 'Your questions from Ask are included. Edit anything.' : null}
    >
      <FieldPanel>
        <Textarea
          {...problemProps(form.errors.message, id)}
          className="text-foreground"
          id={id}
          maxLength={INQUIRY_MESSAGE_MAX_LENGTH}
          name="message"
          onChange={(event) => form.update('message')(event.target.value)}
          onKeyDown={form.sendOnModEnter}
          placeholder={placeholder}
          ref={form.controls.message}
          value={form.values.message}
          variant="bare"
        />
      </FieldPanel>
    </ContactField>
  )
}

/** The send button with its reply promise, and the send's failure when there is one. */
function SendRow({
  copy,
  failure,
  responseTime,
  sending,
  statusId,
}: {
  copy: ContactPageCopy
  failure: string | null
  responseTime: string
  sending: boolean
  statusId: string
}) {
  return (
    <div className="flex flex-col gap-5">
      {failure ? (
        <FieldError className={ENTER_NOTE} id={statusId}>
          <IconAlertCircle aria-hidden />
          {failure}
        </FieldError>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button aria-disabled={sending || undefined} size="xl" type="submit">
          {sending ? <Spinner /> : null}
          {sending ? 'Sending…' : copy.submitLabel}
        </Button>
        <p className="text-muted-foreground text-sm/5">
          {fillContactTokens(copy.submitNote, { responseTime })}
        </p>
      </div>
    </div>
  )
}

/** A status line that eases in when it appears (one short beat, not on every keystroke). */
const ENTER_NOTE =
  'motion-safe:transition-[opacity,translate] motion-safe:duration-150 motion-safe:ease-out-quint motion-safe:starting:-translate-y-1 motion-safe:starting:opacity-0'

/**
 * One field: the mono label (and a trailing meta, the counter) on a row, the
 * control, then either its problem or a note. The problem replaces the note
 * rather than stacking under it.
 */
function ContactField({
  children,
  error,
  htmlFor,
  label,
  meta,
  note,
}: {
  children: React.ReactNode
  error?: string
  htmlFor: string
  label: string
  meta?: React.ReactNode
  note?: string | null
}) {
  return (
    <Field className="gap-3" data-invalid={error ? true : undefined}>
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel htmlFor={htmlFor} variant="mono">
          {label}
        </FieldLabel>
        {meta ? <FieldMeta>{meta}</FieldMeta> : null}
      </div>
      {children}
      {error ? (
        <FieldError className={ENTER_NOTE} id={`${htmlFor}-error`}>
          <IconAlertCircle aria-hidden />
          {error}
        </FieldError>
      ) : note ? (
        <FieldDescription>{note}</FieldDescription>
      ) : null}
    </Field>
  )
}

function Sent({
  copy,
  headingRef,
  receipt,
  responseTime,
}: {
  copy: ContactPageCopy
  headingRef: RefObject<HTMLHeadingElement | null>
  receipt: Receipt
  responseTime: string
}) {
  const tokens = { name: firstName(receipt.name), email: receipt.email, responseTime }

  return (
    <>
      <div className="flex flex-col items-start gap-6 lg:col-span-5" data-swap="text">
        <SentMark />
        <h1
          className="max-w-[16ch] text-balance text-heading-1 outline-none"
          ref={headingRef}
          tabIndex={-1}
        >
          {fillContactTokens(copy.sentHeading, tokens)}
        </h1>
        <p className="max-w-[34ch] text-pretty text-lead text-muted-foreground">
          {fillContactTokens(copy.sentBody, tokens)}
        </p>
      </div>

      <section
        aria-label="Your message"
        className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7"
        data-swap="text"
      >
        <div className="flex items-baseline justify-between gap-6 border-b border-b-foreground pb-3">
          <p className="font-mono text-muted-foreground text-xs/4 uppercase tracking-widest">
            Your message
          </p>
          {receipt.reference ? (
            <p className="font-mono text-muted-foreground text-xs/4 uppercase tabular-nums tracking-widest">
              Ref <span className="text-foreground">{receipt.reference}</span>
            </p>
          ) : null}
        </div>
        <p className="max-w-[60ch] whitespace-pre-line text-base/relaxed text-foreground md:text-lg/relaxed">
          {receipt.message}
        </p>
      </section>
    </>
  )
}

/** The sent mark: a ring and a check that draw themselves once, after the swap lands. */
function SentMark() {
  return (
    <svg
      aria-hidden="true"
      className="contact-sent-mark size-10 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 40 40"
    >
      <circle cx="20" cy="20" pathLength={1} r="18.25" />
      <path d="M13 20.5l4.75 4.75L27 16" pathLength={1} />
    </svg>
  )
}
