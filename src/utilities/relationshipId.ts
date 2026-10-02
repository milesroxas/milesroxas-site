/**
 * The id behind a Payload relationship value, whether the query populated it
 * into a document or left it as a bare id. Returns null for an empty field.
 */
const relationshipId = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value)
    return (value as { id: number | string }).id
  return null
}

/** Ids behind a list of relationship values, with empty entries dropped. */
export const relationshipIds = (values: unknown[]): (number | string)[] =>
  values.map(relationshipId).filter((id): id is number | string => id !== null)

/**
 * The document behind a Payload relationship value, or null when the query
 * left it as a bare id and when the field is empty. `typeof null === 'object'`,
 * so the bare `typeof value === 'object'` test call sites reach for lets an
 * empty field through as a populated document — this does not.
 */
export const populatedDoc = <T>(value: unknown): T | null =>
  value !== null && typeof value === 'object' ? (value as T) : null
