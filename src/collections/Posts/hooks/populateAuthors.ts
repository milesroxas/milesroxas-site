import type { CollectionAfterReadHook } from 'payload'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
const getAuthorId = (author: unknown): string | number | null => {
  if (typeof author === 'object' && author !== null && 'id' in author) {
    return author.id as string | number
  }
  if (typeof author === 'string' || typeof author === 'number') {
    return author
  }
  return null
}

export const populateAuthors: CollectionAfterReadHook = async ({ doc, req: { payload } }) => {
  if (!doc?.authors || doc.authors.length === 0) {
    return doc
  }

  const authorIds = (doc.authors as unknown[])
    .map(getAuthorId)
    .filter((id): id is string | number => id !== null)

  if (authorIds.length === 0) {
    return doc
  }

  try {
    const { docs: authorDocs } = await payload.find({
      collection: 'users',
      depth: 0,
      pagination: false,
      where: { id: { in: authorIds } },
    })

    // Preserve the order of the authors field
    const authorsById = new Map(authorDocs.map((author) => [String(author.id), author]))

    doc.populatedAuthors = authorIds
      .map((id) => authorsById.get(String(id)))
      .filter((author) => author !== undefined)
      .map((author) => ({ id: author.id, name: author.name }))
  } catch (err) {
    // Never let author population break the read
    payload.logger.error({ msg: 'Failed to populate post authors', err })
  }

  return doc
}
