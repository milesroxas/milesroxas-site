import configPromise from '@payload-config'
import { cookies, draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { isMember, isTeam } from '@/access/members'
import { isMembersOnly, type Visibility } from '@/fields/visibility'
import type { Member } from '@/payload-types'

/**
 * Who is signed in, from the request's Payload cookie. Reading it makes the
 * render dynamic, so a cached content route calls it only through `isGated`,
 * once it has met a members-only document. Memoised per request.
 */
const getViewer = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  // The cookies, not the raw header: after a server action signs in again
  // (a password change), the re-render must see the new session.
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('cookie', (await cookies()).toString())
  const { user } = await payload.auth({ headers: requestHeaders })
  return user
})

/** The signed-in member, or null. The members area's routes read this. */
export const getMember = cache(async (): Promise<Member | null> => {
  const user = await getViewer()
  return user && isMember(user) ? (user as Member) : null
})

/**
 * Whether the visitor may read members-only content: a signed-in member, a
 * team member (Miles signed in to the admin), or draft mode.
 */
const hasMembersAccess = cache(async (): Promise<boolean> => {
  if ((await draftMode()).isEnabled) return true
  const user = await getViewer()
  return isMember(user) || isTeam(user)
})

/**
 * True when a document's page should show the sign-in gate in place of its
 * body. A public document never reads the request, so its page stays cached
 * HTML; only a members-only one renders per request.
 */
export async function isGated(doc: { visibility?: Visibility | null }): Promise<boolean> {
  if (!isMembersOnly(doc)) return false
  return !(await hasMembersAccess())
}
