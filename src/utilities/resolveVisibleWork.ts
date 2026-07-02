import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Work } from '@/payload-types'

/**
 * Resolve which work a visitor is allowed to see.
 *
 * - Unprotected work, or visitor with access: the work itself.
 * - Protected work without access: its public fallback work.
 * - Protected work without access and no usable fallback: null (hide entirely).
 *
 * A fallback is only usable when it exists, is published, and is not itself
 * protected — otherwise hiding is the only safe option.
 */
export async function resolveVisibleWork(
  work: Work,
  hasAccess: boolean,
  depth = 2,
): Promise<Work | null> {
  if (!work.isProtected || hasAccess) {
    return work
  }

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
