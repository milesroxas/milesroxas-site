/**
 * Utilities for generating stable React keys
 */

/**
 * Generates a stable key from an entity with an ID
 */
export function getEntityKey<T extends { id?: string | number | null }>(
  entity: T,
  prefix?: string,
  fallbackIndex?: number,
): string {
  if (entity.id) {
    return prefix ? `${prefix}-${entity.id}` : String(entity.id)
  }

  if (fallbackIndex !== undefined) {
    return prefix ? `${prefix}-fallback-${fallbackIndex}` : `fallback-${fallbackIndex}`
  }

  // Generate a hash from the entity for stability
  const entityStr = JSON.stringify(entity)
  const hash = entityStr.split('').reduce((acc, char) => {
    const hash = ((acc << 5) - acc + char.charCodeAt(0)) | 0
    return hash
  }, 0)

  return prefix ? `${prefix}-${Math.abs(hash)}` : String(Math.abs(hash))
}

/**
 * Generates a key from a slug-based entity
 */
export function getSlugKey(
  slug: string | null | undefined,
  prefix: string,
  fallbackIndex?: number,
): string {
  if (slug) {
    return `${prefix}-${slug}`
  }

  if (fallbackIndex !== undefined) {
    return `${prefix}-fallback-${fallbackIndex}`
  }

  return `${prefix}-unknown`
}

/**
 * Generates a composite key from multiple values
 */
export function getCompositeKey(...parts: (string | number | null | undefined)[]): string {
  return parts.filter(Boolean).join('-')
}

/**
 * Keys a positional list by what each item says: a repeat is told apart by its
 * occurrence (`word`, then `word~2`), never by its index.
 */
export function keyed<T>(
  items: readonly T[],
  label: (item: T) => string,
): Array<{ key: string; item: T }> {
  const seen = new Map<string, number>()
  return items.map((item) => {
    const base = label(item)
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return { key: count === 1 ? base : `${base}~${count}`, item }
  })
}
