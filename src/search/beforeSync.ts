import type { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

type CategoryRef = number | string | { id?: number | string; title?: string | null }

/**
 * Keeps a flattened copy of a document's categories on its search entry.
 *
 * The array's `id` field is the row id (search_categories' primary key), so
 * it has to be unique across every search entry. It used to be the category's
 * own id, which a Local API save at depth 0 does not have (the category is a
 * bare number, so the row id went in null) and which two posts in one
 * category share (a duplicate key). Either failure aborted the save's
 * transaction and rolled the whole save back, silently. The row id is now the
 * document and the category together.
 */
export const beforeSyncWithSearch: BeforeSync = async ({
  originalDoc,
  payload,
  req,
  searchDoc,
}) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  }

  if (Array.isArray(categories) && categories.length > 0) {
    try {
      const refs = categories as CategoryRef[]
      const ids = refs
        .map((category) => (typeof category === 'object' ? category.id : category))
        .filter((value): value is number | string => value !== undefined && value !== null)
      const { docs } = await payload.find({
        collection: 'categories',
        where: { id: { in: ids } },
        depth: 0,
        limit: ids.length,
        pagination: false,
        select: { title: true },
        req,
      })
      const titles = new Map(docs.map((doc) => [String(doc.id), doc.title]))
      modifiedDoc.categories = ids.map((categoryId) => ({
        id: `${collection}-${id}-${categoryId}`,
        relationTo: 'categories',
        title: titles.get(String(categoryId)) ?? null,
      }))
    } catch (_err) {
      payload.logger.error(
        `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
      )
    }
  }

  return modifiedDoc
}
