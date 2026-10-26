'use client'

import {
  IconAlertCircle,
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconDownload,
  IconFileCv,
} from '@tabler/icons-react'
import type React from 'react'
import {
  type CSSProperties,
  type Dispatch,
  type Ref,
  type RefObject,
  type SetStateAction,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
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
import { shake } from '@/features/contact/shake'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useLenis } from '@/hooks/useLenis'
import { type ContactPageCopy, fillContactTokens } from '@/shared/content/contact'
import { INQUIRY_EMAIL_INVALID, INQUIRY_MESSAGE_MAX_LENGTH } from '@/shared/content/inquiry'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import { keyed } from '@/utilities/reactKeys'
import { Recommended } from './Recommended'
import type { ContactRecommendation } from './recommendations'

/** Site Info's profile links, listed under the intro. */
export type ContactProfile = { label: string; url: string }

/** The Contact page global's CV file: the card shows only when there is one. */
export type ContactCv = { url: string; filesize: number | null }

export type ContactTemplateProps = {
  copy: ContactPageCopy
  cv: ContactCv | null
  /** Site Info's contact address, offered beside the form for anyone who would rather write directly. */
  email: string | null
  profiles: ContactProfile[]
  /** Works and posts to open while the reply is on its way, shown under the receipt. */
  recommendations: ContactRecommendation[]
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

/**
 * The page's load-in, in ms after it mounts (held while the curtain covers it):
 * the heading rises word by word, the copy and the form's fields fade up in
 * reading order, and the links and CV follow once the form has landed.
 */
const BEAT = {
  title: 80,
  word: 40,
  lead: 360,
  email: 440,
  field: 300,
  fieldStep: 90,
  elsewhere: 680,
  elsewhereStep: 70,
} as const

/**
 * The send, sealed, in ms after the intake answers: the button's spinner
 * becomes a ring and check drawn in place, and the field rules ink in top to
 * bottom (`lineStep` apart) as if the note were signed. At `pulse`, once the
 * check is drawn, the button's plate and label dissolve and the mark swells,
 * then shrinks away (CSS, `.contact-send`); the compose page fades out from
 * `exit`, so the mark and the page leave on the same breath.
 */
const SEAL = { lineStep: 90, pulse: 600, exit: 900 } as const

/** The seal's stroke in the mark's 40-unit box: 1.5px at the button's 16px, the receipt mark's weight. */
const SEAL_STROKE = 3.75

/**
 * The receipt's arrival, in ms after it mounts. The mark fades up over the
 * heading and draws itself again (CSS, `.contact-sent-mark`, from 120ms), the
 * heading rising under it; the message is read back behind a top-down mask
 * while its rule draws; the suggestions open last. A receipt that mounts
 * above the fold (a phone) waits `offscreenHold` while the page scrolls up to it.
 */
const SENT_BEAT = {
  title: 380,
  body: 760,
  rule: 200,
  label: 320,
  message: 440,
  recommended: 1100,
  offscreenHold: 450,
} as const

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as CSSProperties

/** Small copy and controls: fade up out of a light blur. */
const enterIn = 'motion-safe:animate-hero-in motion-reduce:animate-hero-fade'

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
 * Sent, the note is sealed where it was written (`SEAL`), then the page
 * swaps on the shared panel choreography (`useRevealSwap`, height morphing
 * so the footer glides rather than jumps) and the receipt arrives
 * (`SENT_BEAT`): the mark the button let go draws again over the heading, which thanks the
 * sender by name and says where the reply goes, the message is read back in
 * their own words, and a few works and posts are offered for the wait.
 * Reduced motion skips the seal and fades everything in place.
 *
 * Arriving from Ask's "Contact page" link, the visitor's questions open the
 * message (theirs to edit) and the inquiry carries the chat, as on sas-site.
 */
export function ContactTemplate({
  copy,
  cv,
  email,
  profiles,
  recommendations,
  responseTime,
}: ContactTemplateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sentHeadingRef = useRef<HTMLHeadingElement>(null)
  const sealTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [panel, setPanel] = useState(FORM)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [sealed, setSealed] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => () => clearTimeout(sealTimer.current), [])

  const swapTo = useRevealSwap({
    rootRef,
    active: panel,
    onSwap: setPanel,
    // The receipt's heading takes focus so a screen reader starts there.
    onSettled: () =>
      requestAnimationFrame(() => sentHeadingRef.current?.focus({ preventScroll: true })),
    morphHeight: true,
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
              recommendations={recommendations}
              responseTime={responseTime}
              rootRef={rootRef}
            />
          ) : (
            <Compose
              copy={copy}
              cv={cv}
              email={email}
              onSent={(sent) => {
                setReceipt(sent)
                if (reducedMotion) {
                  swapTo(SENT)
                  return
                }
                setSealed(true)
                sealTimer.current = setTimeout(() => swapTo(SENT), SEAL.exit)
              }}
              profiles={profiles}
              responseTime={responseTime}
              sealed={sealed}
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
      <RisingHeading>{copy.heading}</RisingHeading>
      {copy.lead ? (
        <p
          className={`text-lead text-muted-foreground max-w-[34ch] text-pretty ${enterIn}`}
          style={enterAt(BEAT.lead)}
        >
          {copy.lead}
        </p>
      ) : null}
      {email ? (
        <p
          className={`text-muted-foreground mt-2 text-base/relaxed ${enterIn}`}
          style={enterAt(BEAT.email)}
        >
          Prefer email?{' '}
          <a
            className="text-foreground decoration-foreground/30 hover:decoration-foreground underline underline-offset-4 transition-[text-decoration-color] duration-300"
            href={`mailto:${email}`}
          >
            {email}
          </a>
        </p>
      ) : null}
    </div>
  )
}

/** The heading, each word rising into place behind its own mask, as on a case study. */
function RisingHeading({
  at = BEAT.title,
  children,
  className,
  ref,
  tabIndex,
}: {
  at?: number
  children: string
  className?: string
  ref?: Ref<HTMLHeadingElement>
  tabIndex?: number
}) {
  const words = children.split(/\s+/).filter(Boolean)
  return (
    <h1
      className={`text-heading-1 motion-reduce:animate-hero-fade max-w-[16ch] text-balance ${className ?? ''}`}
      ref={ref}
      tabIndex={tabIndex}
    >
      {/* Read whole: split into inline-blocks, the words would be named with gaps. */}
      <span className="sr-only">{children}</span>
      {keyed(words, (word) => word).map(({ key, item: word }, i) => (
        <span aria-hidden key={key}>
          <span className="-my-[0.15em] inline-block overflow-clip py-[0.15em] align-top">
            <span
              className="motion-safe:animate-hero-rise inline-block"
              style={enterAt(at + i * BEAT.word)}
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

const PROFILE_ICONS = [
  { host: 'github.com', Icon: IconBrandGithub },
  { host: 'linkedin.com', Icon: IconBrandLinkedin },
  { host: 'youtube.com', Icon: IconBrandYoutube },
]

const profileIcon = (url: string) => {
  try {
    const { hostname } = new URL(url)
    const match = PROFILE_ICONS.find(
      ({ host }) => hostname === host || hostname.endsWith(`.${host}`),
    )
    return match?.Icon ?? IconArrowUpRight
  } catch {
    return IconArrowUpRight
  }
}

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

/**
 * Under the intro on a phone, after the form; beside the form's foot from lg:
 * the profile links and the CV card, for anyone who would rather look first.
 */
function Elsewhere({
  copy,
  cv,
  profiles,
}: {
  copy: ContactPageCopy
  cv: ContactCv | null
  profiles: ContactProfile[]
}) {
  if (!profiles.length && !cv) return null

  return (
    <div
      className="flex flex-col gap-8 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-end"
      data-swap="text"
    >
      {profiles.length ? (
        <nav aria-label="Elsewhere">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {profiles.map((profile, i) => {
              const Icon = profileIcon(profile.url)
              return (
                <li
                  className={enterIn}
                  key={profile.url}
                  style={enterAt(BEAT.elsewhere + i * BEAT.elsewhereStep)}
                >
                  <a
                    className="contact-profile text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm/5 transition-colors duration-300"
                    href={profile.url}
                    rel="noopener me"
                    target="_blank"
                  >
                    <Icon aria-hidden className="size-4" stroke={1.5} />
                    <span>{profile.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : null}
      {cv ? (
        <div
          className={enterIn}
          style={enterAt(BEAT.elsewhere + profiles.length * BEAT.elsewhereStep)}
        >
          <CvCard copy={copy} cv={cv} />
        </div>
      ) : null}
    </div>
  )
}

/** The CV: one quiet card, the whole of it the link. */
function CvCard({ copy, cv }: { copy: ContactPageCopy; cv: ContactCv }) {
  const meta = ['PDF', cv.filesize ? formatFileSize(cv.filesize) : null].filter(Boolean).join(' · ')

  return (
    <a
      className="contact-cv group ring-foreground/10 hover:bg-foreground/[0.03] hover:ring-foreground/25 focus-visible:ring-ring/50 flex w-full max-w-sm items-center gap-4 rounded-lg p-4 ring-1 focus-visible:ring-2 focus-visible:outline-none"
      download
      href={cv.url}
      rel="noopener"
      target="_blank"
    >
      <span className="bg-foreground/5 text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground flex size-10 shrink-0 items-center justify-center rounded-md transition-[color,background-color] duration-300">
        <IconFileCv aria-hidden className="size-5" stroke={1.5} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-foreground text-sm/5 font-medium">{copy.cvHeading}</span>
        {copy.cvNote ? (
          <span className="text-muted-foreground text-sm/5">{copy.cvNote}</span>
        ) : null}
        <span className="text-muted-foreground font-mono text-xs/4 tracking-widest uppercase">
          {meta}
        </span>
      </span>
      <IconDownload
        aria-hidden
        className="text-muted-foreground ease-out-quint group-hover:text-foreground size-4 shrink-0 transition-[color,translate] duration-300 group-hover:translate-y-0.5 group-active:translate-y-1 group-active:duration-150"
        stroke={1.5}
      />
    </a>
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
    <span aria-live="polite" className={ENTER_NOTE}>
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
  /**
   * Set while Send is held. Leaving the email for Send would flag it on blur,
   * the problem's line would push Send down under the pointer, and the click
   * would land beside it. The send checks everything anyway.
   */
  const pressingSend = useRef(false)

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
    if (pressingSend.current) return
    if (values.email.trim() && !isValidEmailAddress(normalizeEmailAddress(values.email)))
      setErrors((current) => ({ ...current, email: INQUIRY_EMAIL_INVALID }))
  }

  /** Flags every problem, shakes those fields and focuses the first; true when there is none. */
  const checkAll = () => {
    setAttempted(true)
    const found = validate(values)
    setErrors(found)
    const flagged = FIELD_ORDER.filter((field) => found[field])
    shake(flagged.map((field) => controls[field].current?.closest('[data-slot="field"]')))
    if (flagged[0]) controls[flagged[0]].current?.focus()
    return !flagged[0]
  }

  const pressSend = () => {
    pressingSend.current = true
    const release = () => {
      pressingSend.current = false
    }
    window.addEventListener('pointerup', release, { once: true })
    window.addEventListener('pointercancel', release, { once: true })
  }

  return { checkAll, checkEmail, controls, edit, errors, pressSend, setValues, values }
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
  cv,
  email,
  onSent,
  profiles,
  responseTime,
  sealed,
}: {
  copy: ContactPageCopy
  cv: ContactCv | null
  email: string | null
  onSent: (receipt: Receipt) => void
  profiles: ContactProfile[]
  responseTime: string
  /** Sent: the note seals in place before the page swaps. Inert from here on. */
  sealed: boolean
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
        className="contact-form flex flex-col gap-10 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1"
        data-sealed={sealed || undefined}
        inert={sealed}
        noValidate
        onSubmit={form.send}
      >
        <NameField form={form} id={ids.name} order={0} />
        <EmailField form={form} id={ids.email} order={1} />
        <MessageField
          form={form}
          id={ids.message}
          order={2}
          placeholder={copy.messagePlaceholder}
        />

        <SendRow
          copy={copy}
          enter={BEAT.field + 3 * BEAT.fieldStep}
          failure={form.failure}
          onPress={form.pressSend}
          responseTime={responseTime}
          sealed={sealed}
          sending={form.sending}
          statusId={ids.status}
        />

        {/* Honeypot. Off-screen rather than display:none, because bots that skip
            hidden fields still fill this one in; the intake drops what it catches. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <input autoComplete="off" name="role" ref={form.honeypotRef} tabIndex={-1} />
        </div>
      </form>

      <Elsewhere copy={copy} cv={cv} profiles={profiles} />
    </>
  )
}

/** `order`: the field's place in reading order, which paces its entrance and its seal. */
type FieldProps = { form: ComposeForm; id: string; order: number }

/** The line control's own focus and problem colors give way to the ink `.contact-line` draws over its rule. */
const LINE_FOCUS =
  'text-foreground focus-visible:border-b-input not-placeholder-shown:focus-visible:border-b-foreground aria-invalid:border-b-input not-placeholder-shown:aria-invalid:border-b-foreground'

function NameField({ form, id, order }: FieldProps) {
  return (
    <ContactField error={form.errors.name} htmlFor={id} label="Name" line order={order}>
      <Input
        {...problemProps(form.errors.name, id)}
        autoComplete="name"
        className={LINE_FOCUS}
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

function EmailField({ form, id, order }: FieldProps) {
  return (
    <ContactField error={form.errors.email} htmlFor={id} label="Email" line order={order}>
      <Input
        {...problemProps(form.errors.email, id)}
        autoComplete="email"
        className={LINE_FOCUS}
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

function MessageField({ form, id, order, placeholder }: FieldProps & { placeholder: string }) {
  return (
    <ContactField
      order={order}
      error={form.errors.message}
      htmlFor={id}
      label="Message"
      meta={messageCounter(form.values.message.length)}
      note={form.fromAsk ? 'Your questions from Ask are included. Edit anything.' : null}
    >
      <FieldPanel className="duration-300">
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
  enter,
  failure,
  onPress,
  responseTime,
  sealed,
  sending,
  statusId,
}: {
  copy: ContactPageCopy
  enter: number
  failure: string | null
  onPress: () => void
  responseTime: string
  sealed: boolean
  sending: boolean
  statusId: string
}) {
  return (
    <div className={`flex flex-col gap-5 ${enterIn}`} style={enterAt(enter)}>
      {failure ? (
        <FieldError className="contact-problem" id={statusId}>
          <IconAlertCircle aria-hidden />
          {failure}
        </FieldError>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button
          aria-disabled={sending || undefined}
          className="contact-send"
          data-sealed={sealed || undefined}
          onPointerDown={onPress}
          style={{ '--seal-pulse': `${SEAL.pulse}ms` } as CSSProperties}
          size="xl"
          type="submit"
        >
          {sealed ? (
            <SentMark className="contact-seal size-4" strokeWidth={SEAL_STROKE} />
          ) : sending ? (
            <Spinner />
          ) : null}
          {sealed ? (
            // Held at the width of "Sending…", so the button keeps its size.
            <span className="contact-send-label grid">
              <span aria-hidden className="invisible col-start-1 row-start-1">
                Sending…
              </span>
              <span className="col-start-1 row-start-1">Sent</span>
            </span>
          ) : sending ? (
            'Sending…'
          ) : (
            copy.submitLabel
          )}
        </Button>
        <p className="text-muted-foreground text-sm/5" data-swap="text">
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
  line,
  meta,
  note,
  order,
}: {
  children: React.ReactNode
  error?: string
  htmlFor: string
  label: string
  /** A line control, which takes the focus ink. */
  line?: boolean
  meta?: React.ReactNode
  note?: string | null
  order: number
}) {
  return (
    <Field
      className={`gap-3 ${enterIn}`}
      data-invalid={error ? true : undefined}
      data-swap="text"
      style={
        {
          ...enterAt(BEAT.field + order * BEAT.fieldStep),
          '--seal-at': `${order * SEAL.lineStep}ms`,
        } as CSSProperties
      }
    >
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel className="transition-colors duration-300" htmlFor={htmlFor} variant="mono">
          {label}
        </FieldLabel>
        {meta ? <FieldMeta>{meta}</FieldMeta> : null}
      </div>
      {line ? <div className="contact-line">{children}</div> : children}
      {error ? (
        <FieldError className="contact-problem" id={`${htmlFor}-error`}>
          <IconAlertCircle aria-hidden />
          {error}
        </FieldError>
      ) : note ? (
        <FieldDescription>{note}</FieldDescription>
      ) : null}
    </Field>
  )
}

/**
 * Once, as the receipt mounts on a phone, where the button sat far below the
 * heading: the page scrolls up to the heading and the receipt holds its
 * entrance until it arrives.
 */
function useSentArrival({
  headingRef,
  rootRef,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  rootRef: RefObject<HTMLDivElement | null>
}) {
  const reducedMotion = usePrefersReducedMotion()
  const lenis = useLenis()

  const arrive = useEffectEvent(() => {
    const heading = headingRef.current
    if (!heading || heading.getBoundingClientRect().top >= 0) return

    const root = rootRef.current
    if (!reducedMotion) root?.style.setProperty('--morph-hold', `${SENT_BEAT.offscreenHold}ms`)
    const scroller = lenis ?? { scrollTo: scrollIntoViewNatively }
    scroller.scrollTo(heading, { offset: -120, immediate: reducedMotion })
    return () => {
      root?.style.removeProperty('--morph-hold')
    }
  })
  // Once, as the receipt mounts; the event reads that moment's motion setting and scroller.
  useLayoutEffect(() => arrive(), [])
}

function Sent({
  copy,
  headingRef,
  receipt,
  recommendations,
  responseTime,
  rootRef,
}: {
  copy: ContactPageCopy
  headingRef: RefObject<HTMLHeadingElement | null>
  receipt: Receipt
  recommendations: ContactRecommendation[]
  responseTime: string
  rootRef: RefObject<HTMLDivElement | null>
}) {
  useSentArrival({ headingRef, rootRef })
  const tokens = { name: firstName(receipt.name), email: receipt.email, responseTime }

  return (
    <>
      <div className="flex flex-col items-start gap-6 lg:col-span-5">
        <SentMark className="text-foreground size-10" />
        <RisingHeading at={SENT_BEAT.title} className="outline-none" ref={headingRef} tabIndex={-1}>
          {fillContactTokens(copy.sentHeading, tokens)}
        </RisingHeading>
        <p
          className={`text-lead text-muted-foreground max-w-[34ch] text-pretty ${enterIn}`}
          style={enterAt(SENT_BEAT.body)}
        >
          {fillContactTokens(copy.sentBody, tokens)}
        </p>
      </div>

      <section
        aria-label="Your message"
        className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7"
      >
        <div className="relative flex items-baseline justify-between gap-6 pb-3">
          <p
            className={`text-muted-foreground font-mono text-xs/4 tracking-widest uppercase ${enterIn}`}
            style={enterAt(SENT_BEAT.label)}
          >
            Your message
          </p>
          {receipt.reference ? (
            <p
              className={`text-muted-foreground font-mono text-xs/4 tracking-widest uppercase tabular-nums ${enterIn}`}
              style={enterAt(SENT_BEAT.label + BEAT.word)}
            >
              Ref <span className="text-foreground">{receipt.reference}</span>
            </p>
          ) : null}
          <span
            aria-hidden
            className="bg-foreground motion-safe:animate-hero-draw motion-reduce:animate-hero-fade absolute inset-x-0 bottom-0 h-px origin-left"
            style={enterAt(SENT_BEAT.rule)}
          />
        </div>
        <p
          className="text-foreground motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade max-w-[60ch] text-base/relaxed whitespace-pre-line md:text-lg/relaxed"
          style={enterAt(SENT_BEAT.message)}
        >
          {receipt.message}
        </p>
      </section>

      <Recommended
        at={SENT_BEAT.recommended}
        heading={copy.recommendedHeading}
        items={recommendations}
      />
    </>
  )
}

/**
 * The sent mark: a ring and a check that draw themselves once, ring first.
 * The button's seal is the same mark at 16px on a heavier stroke, so both
 * read at 1.5px and the receipt's reads as the seal come back.
 */
function SentMark({ className, strokeWidth = 1.5 }: { className: string; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={`contact-sent-mark ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 40 40"
    >
      <circle cx="20" cy="20" pathLength={1} r="18.25" />
      <path d="M13 20.5l4.75 4.75L27 16" pathLength={1} />
    </svg>
  )
}
