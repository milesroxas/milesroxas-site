'use client'

import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import Link from 'next/link'
import { type ReactNode, useActionState, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel, FieldMeta } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/utilities/ui'
import {
  changePassword,
  deleteAccount,
  join,
  type MemberFormState,
  requestPasswordReset,
  resetPassword,
  signIn,
  updateProfile,
} from './actions'
import { MEMBERS_PATHS, withNext } from './paths'

type Action = (state: MemberFormState, formData: FormData) => Promise<MemberFormState>

/** A status line eases in once, when it appears: one short beat, never on a keystroke. */
const ENTER =
  'motion-safe:transition-[opacity,translate] motion-safe:duration-200 motion-safe:ease-out-quint motion-safe:starting:-translate-y-1 motion-safe:starting:opacity-0'

const MIN_PASSWORD_NOTE = 'At least 10 characters.'

/** One field: the mono label (and a trailing control) on a row, the line input, then its problem or note. */
function MemberField({
  error,
  label,
  meta,
  note,
  ...input
}: React.ComponentProps<typeof Input> & {
  error?: string
  label: string
  meta?: ReactNode
  note?: string
}) {
  const id = useId()
  const describedBy = error ? `${id}-error` : note ? `${id}-note` : undefined
  return (
    <Field className="gap-3" data-invalid={error ? true : undefined}>
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel htmlFor={id} variant="mono">
          {label}
        </FieldLabel>
        {meta}
      </div>
      <Input
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        id={id}
        // A blank placeholder, so the rule darkens once there is a value.
        placeholder=" "
        variant="line"
        {...input}
      />
      {error ? (
        <FieldError className={ENTER} id={`${id}-error`}>
          <IconAlertCircle aria-hidden />
          {error}
        </FieldError>
      ) : note ? (
        <FieldDescription id={`${id}-note`}>{note}</FieldDescription>
      ) : null}
    </Field>
  )
}

/** A password field with a quiet Show / Hide beside its label. */
function PasswordField(props: Omit<React.ComponentProps<typeof MemberField>, 'type' | 'meta'>) {
  const [shown, setShown] = useState(false)
  return (
    <MemberField
      {...props}
      autoCapitalize="none"
      meta={
        <FieldMeta>
          <button
            aria-pressed={shown}
            className="hover:text-foreground focus-visible:text-foreground -my-2 py-2 uppercase transition-colors duration-150 outline-none"
            onClick={() => setShown((value) => !value)}
            type="button"
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        </FieldMeta>
      }
      spellCheck={false}
      type={shown ? 'text' : 'password'}
    />
  )
}

function Submit({
  children,
  pending,
  pendingLabel,
  variant,
}: {
  children: ReactNode
  pending: boolean
  pendingLabel: string
  variant?: 'default' | 'destructive'
}) {
  return (
    <Button aria-disabled={pending || undefined} size="xl" type="submit" variant={variant}>
      {pending && <Spinner aria-hidden />}
      {pending ? pendingLabel : children}
    </Button>
  )
}

/** The form's own problem, above its button, announced as it appears. */
function FormProblem({ state }: { state: MemberFormState }) {
  if (!state.error) return null
  return (
    <FieldError className={cn('text-sm/5', ENTER)}>
      <IconAlertCircle aria-hidden />
      {state.error}
    </FieldError>
  )
}

/** What a form says once it has done its job, in place of the form. */
export function Receipt({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div aria-live="polite" className={cn('flex flex-col gap-3', ENTER)} role="status">
      <p className="flex items-center gap-2 text-lg/7">
        <IconCircleCheck aria-hidden className="text-primary size-5 shrink-0" stroke={1.75} />
        {title}
      </p>
      <div className="text-muted-foreground text-base text-pretty">{children}</div>
    </div>
  )
}

function useMemberAction(action: Action) {
  return useActionState<MemberFormState, FormData>(action, {})
}

/** A second press while the first is in flight does nothing (the button stays focusable). */
const blockWhile = (pending: boolean) => (event: React.FormEvent) => {
  if (pending) event.preventDefault()
}

const FORM = 'flex flex-col gap-8'

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useMemberAction(signIn)
  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)} noValidate>
      <input name="next" type="hidden" value={next} />
      <MemberField
        autoComplete="email"
        defaultValue={state.values?.email}
        inputMode="email"
        label="Email"
        name="email"
        required
        spellCheck={false}
        type="email"
      />
      <PasswordField
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        label="Password"
        name="password"
        required
      />
      <div className="flex flex-col items-start gap-5">
        <FormProblem state={state} />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Submit pending={pending} pendingLabel="Signing in…">
            Sign in
          </Submit>
          <Button asChild size="clear" variant="text">
            <Link href={withNext(MEMBERS_PATHS.forgotPassword, next)}>Forgot your password?</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}

export function JoinForm({ next }: { next: string }) {
  const [state, formAction, pending] = useMemberAction(join)

  if (state.done) {
    return (
      <Receipt title="Check your inbox">
        <p>
          We sent a link to <span className="text-foreground">{state.values?.email}</span>. Open it
          to confirm your address, then{' '}
          <Link
            className="text-foreground underline underline-offset-4"
            href={withNext(MEMBERS_PATHS.signIn, next)}
          >
            sign in
          </Link>
          .
        </p>
      </Receipt>
    )
  }

  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)} noValidate>
      <Honeypot />
      <MemberField
        autoComplete="name"
        defaultValue={state.values?.name}
        label="Name"
        maxLength={120}
        meta={<FieldMeta>Optional</FieldMeta>}
        name="name"
      />
      <MemberField
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        inputMode="email"
        label="Email"
        name="email"
        required
        spellCheck={false}
        type="email"
      />
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        label="Password"
        minLength={10}
        name="password"
        note={MIN_PASSWORD_NOTE}
        required
      />
      <div className="flex flex-col items-start gap-5">
        <FormProblem state={state} />
        <Submit pending={pending} pendingLabel="Creating your account…">
          Create account
        </Submit>
      </div>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useMemberAction(requestPasswordReset)

  if (state.done) {
    return (
      <Receipt title="Check your inbox">
        <p>
          If <span className="text-foreground">{state.values?.email}</span> has an account, a link
          to reset the password is on its way. It works for one hour.
        </p>
      </Receipt>
    )
  }

  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)} noValidate>
      <Honeypot />
      <MemberField
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        inputMode="email"
        label="Email"
        name="email"
        required
        spellCheck={false}
        type="email"
      />
      <div className="flex flex-col items-start gap-5">
        <FormProblem state={state} />
        <Submit pending={pending} pendingLabel="Sending…">
          Send reset link
        </Submit>
      </div>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useMemberAction(resetPassword)
  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)} noValidate>
      <input name="token" type="hidden" value={token} />
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        label="New password"
        minLength={10}
        name="password"
        note={MIN_PASSWORD_NOTE}
        required
      />
      <div className="flex flex-col items-start gap-5">
        <FormProblem state={state} />
        {state.error && (
          <Link
            className="text-sm underline underline-offset-4"
            href={MEMBERS_PATHS.forgotPassword}
          >
            Ask for a new link
          </Link>
        )}
        <Submit pending={pending} pendingLabel="Saving…">
          Save and sign in
        </Submit>
      </div>
    </form>
  )
}

/** A short "Saved" beside the button once a settings form goes through. */
function Saved({ shown }: { shown?: boolean }) {
  if (!shown) return null
  return (
    <p
      aria-live="polite"
      className={cn('text-muted-foreground flex items-center gap-1.5 text-sm', ENTER)}
      role="status"
    >
      <IconCircleCheck aria-hidden className="text-primary size-4" stroke={1.75} />
      Saved
    </p>
  )
}

export function ProfileForm({ name }: { name: string }) {
  const [state, formAction, pending] = useMemberAction(updateProfile)
  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)}>
      <MemberField
        autoComplete="name"
        defaultValue={state.values?.name ?? name}
        label="Name"
        maxLength={120}
        name="name"
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Submit pending={pending} pendingLabel="Saving…">
          Save name
        </Submit>
        <Saved shown={state.done && !pending} />
      </div>
    </form>
  )
}

export function PasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useMemberAction(changePassword)
  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)} noValidate>
      {/* Lets a password manager file the new password under the right account. */}
      <input autoComplete="username" hidden name="username" readOnly type="email" value={email} />
      <PasswordField
        autoComplete="current-password"
        error={state.fieldErrors?.current}
        label="Current password"
        name="current"
        required
      />
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        label="New password"
        minLength={10}
        name="password"
        note={`${MIN_PASSWORD_NOTE} Signs out your other devices.`}
        required
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Submit pending={pending} pendingLabel="Saving…">
          Change password
        </Submit>
        <Saved shown={state.done && !pending} />
      </div>
    </form>
  )
}

export function DeleteAccountForm() {
  const [state, formAction, pending] = useMemberAction(deleteAccount)
  return (
    <form action={formAction} className={FORM} onSubmit={blockWhile(pending)} noValidate>
      <PasswordField
        autoComplete="current-password"
        error={state.fieldErrors?.current}
        label="Password"
        name="current"
        note="Your account and everything in it are removed. This cannot be undone."
        required
      />
      <div>
        <Submit pending={pending} pendingLabel="Deleting…" variant="destructive">
          Delete my account
        </Submit>
      </div>
    </form>
  )
}

/**
 * A field people never see and bots fill. The action answers a filled one
 * as if it went through. Off-screen rather than `hidden`, which bots skip.
 */
function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
      <label>
        Website
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>
    </div>
  )
}
