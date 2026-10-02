import type { Where } from 'payload'

/** Matches one slug; outside draft mode only a published version counts. */
export const slugWhere = (slug: string, draft: boolean): Where => ({
  and: [
    { slug: { equals: slug } },
    ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
  ],
})
