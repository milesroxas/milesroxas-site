import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import type { Client, Media, Work } from '@/payload-types'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'

/** How many works the index lists. */
export const MORE_WORK_LIMIT = 4

/** One row of the index: only what the row and the plate render. */
export type MoreWorkItem = {
  id: number
  slug: string
  title: string
  client: string | null
  industry: string | null
  capabilities: string[]
  media: Media | null
}

const SELECT = {
  title: true,
  slug: true,
  hero: { media: true },
  client: true,
  industry: true,
  capabilities: true,
} as const

type SelectedWork = Pick<
  Work,
  'id' | 'title' | 'slug' | 'hero' | 'client' | 'industry' | 'capabilities'
>

const toItem = (doc: SelectedWork): MoreWorkItem | null =>
  doc.slug
    ? {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        client: populatedDoc<Client>(doc.client)?.title ?? null,
        industry: doc.industry ?? null,
        capabilities: doc.capabilities ?? [],
        media: populatedDoc<Media>(doc.hero?.media),
      }
    : null

/**
 * The works to show under a case study: the ones it names as related, in
 * the order it names them, then the latest that share one of its categories,
 * then the latest of all. Reads as an anonymous visitor (`overrideAccess:
 * false`), so drafts and protected works never surface, whoever is looking.
 */
export async function getMoreWork(
  work: Pick<Work, 'id' | 'relatedWorks' | 'categories'>,
): Promise<MoreWorkItem[]> {
  const payload = await getPayload({ config: configPromise })
  const picked: SelectedWork[] = []
  const taken = () => [work.id, ...picked.map((doc) => doc.id)]

  const find = async (where?: Where, sort?: string) => {
    const limit = MORE_WORK_LIMIT - picked.length
    if (limit <= 0) return []
    const { docs } = await payload.find({
      collection: 'works',
      depth: 1,
      draft: false,
      limit,
      overrideAccess: false,
      pagination: false,
      select: SELECT,
      sort,
      where: { and: [...(where ? [where] : []), { id: { not_in: taken() } }] },
    })
    return docs as SelectedWork[]
  }

  const relatedIds = relationshipIds(work.relatedWorks ?? []).slice(0, MORE_WORK_LIMIT)
  if (relatedIds.length) {
    const docs = await find({ id: { in: relatedIds } })
    picked.push(...docs.sort((a, b) => relatedIds.indexOf(a.id) - relatedIds.indexOf(b.id)))
  }

  const categoryIds = relationshipIds(work.categories ?? [])
  if (categoryIds.length)
    picked.push(...(await find({ categories: { in: categoryIds } }, '-publishedAt')))

  picked.push(...(await find(undefined, '-publishedAt')))

  return picked.map(toItem).filter((item): item is MoreWorkItem => item !== null)
}
