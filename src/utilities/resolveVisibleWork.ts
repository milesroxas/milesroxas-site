import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { Work } from '@/payload-types'
import type { WorkAccess } from '@/utilities/checkWorkAccess'

/**
 * Resolve which work a visitor is allowed to see.
 *
 * - Unpublished work (a draft, or unpublished since): null, except in draft mode.
 * - Unprotected work, or visitor with access: the work itself.
 * - Protected work without access: its public fallback work.
 * - Protected work without access and no usable fallback: null (hide entirely).
 *
 * A fallback is only usable when it exists, is published, and is not itself
 * protected — otherwise hiding is the only safe option.
 */
export async function resolveVisibleWork(
  work: Work,
  access: WorkAccess,
  depth = 2,
): Promise<Work | null> {
  // A block or relation populated by a trusted fetch carries the work whatever its status.
  if (work._status !== 'published' && !(await draftMode()).isEnabled) {
    return null
  }

  if (!work.isProtected) return work

  // Only now is the visitor's cookie read: a public work never makes the render dynamic.
  const hasAccess = typeof access === 'function' ? await access() : access
  if (hasAccess) return work

  if (!work.fallbackWork) {
    return null
  }

  const payload = await getPayload({ config: configPromise })
  const fallbackId =
    typeof work.fallbackWork === 'object' ? work.fallbackWork.id : work.fallbackWork

  const fallback = await payload.findByID({
    collection: 'works',
    id: fallbackId,
    depth,
    disableErrors: true,
  })

  if (!fallback || fallback.isProtected || fallback._status !== 'published') {
    return null
  }

  return fallback
}
