import type { ContactPage } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaURL'

/**
 * The contact page's words, stated once.
 *
 * The Contact page global seeds its fields with these, and the route falls
 * back to them field by field, so a global that was never saved (or a field
 * an editor cleared) reads the same as the defaults.
 *
 * Three tokens are filled in on the page: `{name}` (the sender's first name),
 * `{email}` (the address they gave) and `{responseTime}` (Site Info ›
 * Inquiries › Response time).
 */
export const CONTACT_PAGE_DEFAULTS = {
  heading: 'Tell Miles what you’re working on.',
  lead: 'A role, a project, or a question about the work. A few lines is plenty.',
  messagePlaceholder: 'What you’re hiring for or building, and where Miles fits in.',
  submitLabel: 'Send to Miles',
  submitNote: 'Miles replies {responseTime}.',
  sentHeading: 'Thanks, {name}. Your message is with Miles.',
  sentBody: 'He’ll reply to {email} {responseTime}. A confirmation is on its way to your inbox.',
  recommendedHeading: 'While you wait',
  cvHeading: 'Miles’s CV',
  cvNote: 'Roles, clients and tools, in one file.',
} as const

export type ContactPageCopy = { -readonly [Key in keyof typeof CONTACT_PAGE_DEFAULTS]: string }

type ContactTokens = Record<'name' | 'email' | 'responseTime', string>

/** Fill the page's tokens. Every one always has a value: name and email are required to send. */
export const fillContactTokens = (template: string, values: Partial<ContactTokens>): string =>
  template.replace(
    /\{(name|email|responseTime)\}/g,
    (_, key: keyof ContactTokens) => values[key] ?? '',
  )

/** Each field falls back on its own, so clearing one in the admin never blanks the page. */
export const resolveContactCopy = (page: ContactPage | null | undefined): ContactPageCopy => {
  const copy = { ...CONTACT_PAGE_DEFAULTS } as ContactPageCopy
  for (const key of Object.keys(copy) as (keyof ContactPageCopy)[]) {
    const value = page?.[key]
    if (typeof value === 'string' && value.trim()) copy[key] = value
  }
  return copy
}

/** The CV card's file, once one is chosen (the global read at depth 1). */
export const resolveContactCv = (page: ContactPage | null | undefined) => {
  const file = page?.cv
  if (!file || typeof file !== 'object' || !file.url) return null
  return { url: getMediaUrl(file.url), filesize: file.filesize ?? null }
}
