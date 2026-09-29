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
} as const

export type ContactPageCopy = { -readonly [Key in keyof typeof CONTACT_PAGE_DEFAULTS]: string }

type ContactTokens = Record<'name' | 'email' | 'responseTime', string>

/** Fill the page's tokens. Every one always has a value: name and email are required to send. */
export const fillContactTokens = (template: string, values: Partial<ContactTokens>): string =>
  template.replace(
    /\{(name|email|responseTime)\}/g,
    (_, key: keyof ContactTokens) => values[key] ?? '',
  )
