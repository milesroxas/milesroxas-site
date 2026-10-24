import type { CollectionBeforeChangeHook, GlobalBeforeChangeHook } from 'payload'

/** Stamps `publishedAt` on the first save that arrives without one. */
const stampPublishedAt = <T extends object>({
  data,
  req,
}: {
  data: T
  req: { data?: { publishedAt?: unknown } }
}) => (req.data && !req.data.publishedAt ? { ...data, publishedAt: new Date() } : data)

export const populatePublishedAt: CollectionBeforeChangeHook = stampPublishedAt

export const populateGlobalPublishedAt: GlobalBeforeChangeHook = stampPublishedAt
