import type { Access, CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isMember, isTeam } from '@/access/members'
import { resetPasswordEmail, verifyEmail } from './emails'

/** How long a member stays signed in. The `member` hint cookie lives as long. */
export const MEMBER_SESSION_SECONDS = 60 * 60 * 24 * 30

/** The team reads every member; a member reads only their own record. */
const teamOrSelf: Access = ({ req: { user } }) => {
  if (isTeam(user)) return true
  if (user && isMember(user)) return { id: { equals: user.id } }
  return false
}

/**
 * Site members: people who sign up on the site to read members-only content
 * (docs/members.md). A separate auth collection from `users`, so a member can
 * never reach the admin: Payload only admits `admin.user`, and `access.admin`
 * says so again.
 *
 * Members write only through the site's server actions
 * (`src/features/members/actions.ts`), which pass whitelisted fields; the REST
 * API takes no writes from them. That keeps signup behind the form's guard and
 * keeps a member from changing their email around verification.
 */
export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: 'Member', plural: 'Members' },
  access: {
    admin: () => false,
    create: authenticated,
    delete: authenticated,
    read: teamOrSelf,
    unlock: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['email', 'name', '_verified', 'createdAt'],
    group: 'Audience',
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: MEMBER_SESSION_SECONDS,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    verify: {
      generateEmailSubject: () => verifyEmail.subject,
      generateEmailHTML: ({ token, user }) => verifyEmail.html({ token, name: user?.name }),
    },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: () => resetPasswordEmail.subject,
      generateEmailHTML: (args) =>
        resetPasswordEmail.html({ token: args?.token ?? '', name: args?.user?.name }),
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      maxLength: 120,
    },
  ],
  timestamps: true,
}
