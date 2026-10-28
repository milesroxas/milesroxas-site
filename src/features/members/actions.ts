'use server'

import configPromise from '@payload-config'
import { login, logout } from '@payloadcms/next/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, LockedAuth, UnverifiedEmail } from 'payload'
import { MEMBER_SESSION_SECONDS } from '@/collections/Members'
import { sendAlreadyMemberEmail } from '@/collections/Members/emails'
import type { Member } from '@/payload-types'
import { MEMBER_HINT_COOKIE } from './hint'
import { MEMBERS_PATHS, safeNext } from './paths'
import { getMember } from './session'

/**
 * Every member account change. Members never write through the REST API
 * (`collections/Members`): these actions take whitelisted fields from the
 * form and act as the signed-in member, with `overrideAccess` and the
 * member's own id.
 */

export type MemberFormState = {
  /** A problem with the whole form, shown above the submit button. */
  error?: string
  /** A problem with one field, shown under it. */
  fieldErrors?: Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'current', string>>
  /** The form did its job; the page swaps it for its receipt. */
  done?: boolean
  /** What the visitor typed, kept across a failed submit. Never a password. */
  values?: { name?: string; email?: string }
}

type Action = (state: MemberFormState, formData: FormData) => Promise<MemberFormState>

const MIN_PASSWORD = 10
const MAX_PASSWORD = 128
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const field = (formData: FormData, name: string) => {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/** Passwords are taken as typed: no trimming. */
const secret = (formData: FormData, name: string) => {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

const passwordProblem = (password: string) => {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (password.length > MAX_PASSWORD) return `Use at most ${MAX_PASSWORD} characters.`
  return undefined
}

/**
 * The cookie the head script reads to draw cards unlocked before paint
 * (`MemberHint`). It says nothing the server trusts: every gate reads the
 * Payload session.
 */
async function setHint() {
  ;(await cookies()).set(MEMBER_HINT_COOKIE, '1', {
    httpOnly: false,
    maxAge: MEMBER_SESSION_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

async function clearHint() {
  ;(await cookies()).delete(MEMBER_HINT_COOKIE)
}

const signInMember = (email: string, password: string) =>
  login({ collection: 'members', config: configPromise, email, password })

export const signIn: Action = async (_state, formData) => {
  const email = field(formData, 'email').toLowerCase()
  const password = secret(formData, 'password')
  const next = safeNext(formData.get('next'))

  if (!email || !password) return { error: 'Enter your email and password.', values: { email } }

  try {
    await signInMember(email, password)
  } catch (error) {
    if (error instanceof UnverifiedEmail) {
      return {
        error:
          'Confirm your email first. The link is in your inbox; if it is lost, reset your password and that confirms it too.',
        values: { email },
      }
    }
    if (error instanceof LockedAuth) {
      return {
        error: 'Too many attempts. Try again in 15 minutes, or reset your password.',
        values: { email },
      }
    }
    return { error: 'That email and password do not match.', values: { email } }
  }

  await setHint()
  redirect(next)
}

export const join: Action = async (_state, formData) => {
  const name = field(formData, 'name').slice(0, 120)
  const email = field(formData, 'email').toLowerCase()
  const password = secret(formData, 'password')

  // A hidden field people never see; a bot that fills it gets the same answer.
  if (field(formData, 'website')) return { done: true, values: { email } }

  const fieldErrors: MemberFormState['fieldErrors'] = {}
  if (!EMAIL.test(email)) fieldErrors.email = 'Enter a valid email address.'
  const problem = passwordProblem(password)
  if (problem) fieldErrors.password = problem
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { name, email } }

  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'members',
    where: { email: { equals: email } },
  })

  try {
    // The same answer for a new and a known address, so the form cannot be
    // used to find out who has an account. The owner hears about it by email.
    if (totalDocs > 0) await sendAlreadyMemberEmail(payload, email)
    else
      await payload.create({
        collection: 'members',
        data: { email, password, ...(name ? { name } : {}) },
      })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'member join failed' })
    return { error: 'Something went wrong. Try again in a moment.', values: { name, email } }
  }

  return { done: true, values: { email } }
}

export const requestPasswordReset: Action = async (_state, formData) => {
  const email = field(formData, 'email').toLowerCase()
  if (field(formData, 'website')) return { done: true, values: { email } }
  if (!EMAIL.test(email)) {
    return { fieldErrors: { email: 'Enter a valid email address.' }, values: { email } }
  }

  const payload = await getPayload({ config: configPromise })
  try {
    // Sends nothing for an unknown address; the answer is the same either way.
    await payload.forgotPassword({ collection: 'members', data: { email } })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'member password reset request failed' })
  }
  return { done: true, values: { email } }
}

export const resetPassword: Action = async (_state, formData) => {
  const token = field(formData, 'token')
  const password = secret(formData, 'password')
  const problem = passwordProblem(password)
  if (problem) return { fieldErrors: { password: problem } }

  const payload = await getPayload({ config: configPromise })
  let email: string
  try {
    const { user } = await payload.resetPassword({
      collection: 'members',
      data: { token, password },
      overrideAccess: true,
    })
    const member = user as unknown as Member
    email = member.email
    // The reset link reached the inbox, which is what verification proves.
    if (!member._verified) {
      await payload.update({ collection: 'members', id: member.id, data: { _verified: true } })
    }
    await signInMember(email, password)
  } catch {
    return { error: 'This link has expired or was already used. Ask for a new one.' }
  }

  await setHint()
  redirect(MEMBERS_PATHS.home)
}

export async function signOut() {
  await logout({ config: configPromise })
  await clearHint()
  redirect('/')
}

/** The signed-in member, or off to sign in. */
async function requireMember() {
  const member = await getMember()
  if (!member) redirect(MEMBERS_PATHS.signIn)
  return member
}

export const updateProfile: Action = async (_state, formData) => {
  const member = await requireMember()
  const name = field(formData, 'name').slice(0, 120)
  const payload = await getPayload({ config: configPromise })
  await payload.update({ collection: 'members', id: member.id, data: { name } })
  return { done: true, values: { name } }
}

/** The current password, checked through Payload's login so a wrong one counts toward the lockout. */
async function confirmPassword(email: string, password: string) {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.login({ collection: 'members', data: { email, password } })
    return true
  } catch {
    return false
  }
}

export const changePassword: Action = async (_state, formData) => {
  const member = await requireMember()
  const current = secret(formData, 'current')
  const password = secret(formData, 'password')

  const problem = passwordProblem(password)
  if (problem) return { fieldErrors: { password: problem } }
  if (!(await confirmPassword(member.email, current))) {
    return { fieldErrors: { current: 'That is not your current password.' } }
  }

  // A new password signs every other device out; this one signs in again.
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: 'members',
    id: member.id,
    data: { password, sessions: [] },
  })
  await signInMember(member.email, password)
  await setHint()
  return { done: true }
}

export const deleteAccount: Action = async (_state, formData) => {
  const member = await requireMember()
  if (!(await confirmPassword(member.email, secret(formData, 'current')))) {
    return { fieldErrors: { current: 'That is not your password.' } }
  }

  const payload = await getPayload({ config: configPromise })
  await payload.delete({ collection: 'members', id: member.id })
  const store = await cookies()
  store.delete(`${payload.config.cookiePrefix}-token`)
  store.delete(MEMBER_HINT_COOKIE)
  redirect('/')
}
