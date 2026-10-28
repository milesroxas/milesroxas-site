/**
 * What a members-only document's page may show a visitor who is not signed
 * in: its opening and its facts, never its body. An allowlist, so a body
 * field added later stays private by default.
 */
const TEASER_FIELDS = new Set([
  'id',
  'title',
  'slug',
  'hero',
  'meta',
  'visibility',
  '_status',
  'publishedAt',
  'updatedAt',
  'createdAt',
  // Posts
  'categories',
  'authors',
  'populatedAuthors',
  'source',
  'external',
  // Works
  'client',
  'industry',
  'capabilities',
  'link',
  'isProtected',
])

/**
 * The document reduced to its teaser. Everything a route hands a client
 * component is serialized into the page, rendered or not, so a gated route
 * passes this and never the whole document. Typed as the document because
 * every field it drops is one the gated render never reads.
 */
export function toTeaser<T extends object>(doc: T): T {
  return Object.fromEntries(Object.entries(doc).filter(([key]) => TEASER_FIELDS.has(key))) as T
}
