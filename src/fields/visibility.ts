import type { Field } from 'payload'

export type Visibility = 'public' | 'members'

/** Whether a document is for signed-in members only. */
export const isMembersOnly = (doc: { visibility?: Visibility | null } | null | undefined) =>
  doc?.visibility === 'members'

/**
 * Who may read a document: everyone, or signed-in members (docs/members.md).
 * A members-only document lists as a locked card and its page shows a sign-in
 * gate in place of the body; it never reaches the sitemap, llms.txt, the
 * markdown alternates or Ask. A new audience (a paid tier) is a new option
 * here and a new branch in `publishedContentRead`.
 */
export const visibilityField = (): Field => ({
  name: 'visibility',
  type: 'select',
  defaultValue: 'public',
  required: true,
  index: true,
  options: [
    { label: 'Everyone', value: 'public' },
    { label: 'Members', value: 'members' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Members-only pages show a sign-in gate to everyone else.',
  },
})
