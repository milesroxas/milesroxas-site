import type { CollectionAfterReadHook, Payload } from 'payload'
import type { User } from 'src/payload-types'

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

const fetchAuthor = async (payload: Payload, authorId: string | number): Promise<User | null> => {
  try {
    const authorDoc = await payload.findByID({
      id: authorId,
      collection: 'users',
      depth: 0,
    })
    return authorDoc || null
  } catch {
    return null
  }
}

export const populateAuthors: CollectionAfterReadHook = async ({
  doc,
  req: _req,
  req: { payload },
}) => {
  if (!doc?.authors || doc.authors.length === 0) {
    return doc
  }

  const authorDocs: User[] = []

  for (const author of doc.authors) {
    const authorId = getAuthorId(author)
    if (!authorId) continue

    const authorDoc = await fetchAuthor(payload, authorId)
    if (authorDoc) {
      authorDocs.push(authorDoc)
    }
  }

  if (authorDocs.length > 0) {
    doc.populatedAuthors = authorDocs.map((authorDoc) => ({
      id: authorDoc.id,
      name: authorDoc.name,
    }))
  }

  return doc
}
