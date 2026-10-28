import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * The member account emails, plain HTML and text through Payload's email
 * adapter (Resend), in the same shape as the inquiry emails.
 */

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const wrap = (lines: string[], action: { href: string; label: string }) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:560px">${lines
    .map((line) => `<p style="margin:0 0 16px">${escapeHtml(line)}</p>`)
    .join(
      '',
    )}<p style="margin:0 0 16px"><a href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a></p></div>`

const text = (lines: string[], href: string) => [...lines, href].join('\n\n')

const memberUrl = (path: string, token?: string) =>
  `${getServerSideURL()}/members/${path}${token ? `?token=${encodeURIComponent(token)}` : ''}`

const greeting = (name?: string | null) => (name?.trim() ? `Hi ${name.trim()},` : 'Hi,')

export const verifyEmail = {
  subject: 'Confirm your email',
  html: ({ token, name }: { token: string; name?: string | null }) =>
    wrap(
      [
        greeting(name),
        'Confirm this address to finish setting up your account on milesroxas.com.',
        'The link works once. If you did not sign up, ignore this email.',
      ],
      { href: memberUrl('verify', token), label: 'Confirm my email' },
    ),
}

export const resetPasswordEmail = {
  subject: 'Reset your password',
  html: ({ token, name }: { token: string; name?: string | null }) =>
    wrap(
      [
        greeting(name),
        'Someone asked to reset the password for your account on milesroxas.com.',
        'The link works for one hour. If it was not you, ignore this email and your password stays the same.',
      ],
      { href: memberUrl('reset-password', token), label: 'Choose a new password' },
    ),
}

/**
 * Sent when someone joins with an address that already has an account, so
 * the join form can answer the same way for every address and the owner
 * still learns how to get in.
 */
export async function sendAlreadyMemberEmail(payload: Payload, to: string) {
  const lines = [
    'Hi,',
    'Someone tried to create an account on milesroxas.com with this address, which already has one.',
    'Sign in, or reset your password if you have lost it. If it was not you, ignore this email.',
  ]
  const href = memberUrl('sign-in')
  return payload.sendEmail({
    to,
    subject: 'You already have an account',
    html: wrap(lines, { href, label: 'Sign in' }),
    text: text(lines, href),
  })
}
