import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterOperationHook } from 'payload'
import { unpublishedByOperation } from '@/collections/shared/revalidateDocument'
import type { StreakLook } from '@/payload-types'
import type { LOOKS_SLUG } from './components/paths'

/**
 * Every cached page is busted when what a look shows changes. A look is used
 * like a media file, from any hero, card, block frame or menu preview, and the
 * hydrated release (snapshot, posters, ground) is baked into the cached HTML,
 * so a publish or an unpublish has to reach every route rather than the one
 * document whose own hooks bust its page.
 */
function revalidateUses(payload: { logger: { info: (message: string) => void } }, id: unknown) {
  payload.logger.info(`Revalidating every page for Studio look ${id}`)
  revalidatePath('/', 'layout')
  revalidateTag('posts', 'max')
  revalidateTag('works', 'max')
  revalidateTag('global_header', 'max')
}

/** On publish: the Publish endpoint's write, or Payload's own Revert to published. A draft save is skipped. */
export const revalidateLookPublish: CollectionAfterChangeHook<StreakLook> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && doc._status === 'published') revalidateUses(payload, doc.id)
  return doc
}

/** On unpublish: every slot that used the look falls back to its shipped look. */
export const revalidateLookUnpublish: CollectionAfterOperationHook<typeof LOOKS_SLUG> = (arg) => {
  const {
    req: { payload, context },
    result,
  } = arg
  if (context.disableRevalidate) return result
  for (const doc of unpublishedByOperation<StreakLook>(arg)) revalidateUses(payload, doc.id)
  return result
}
