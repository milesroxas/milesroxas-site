import type { Category } from '@/payload-types'

/**
 * Flattens category references to their IDs
 */
export function flattenCategories(
  categories?: (number | string | Category)[] | null,
): (number | string)[] | undefined {
  if (!categories || categories.length === 0) {
    return undefined
  }

  return categories.map((category) => {
    if (typeof category === 'object' && 'id' in category) {
      return category.id
    }
    return category
  })
}

/**
 * Creates a query filter for categories if they exist
 */
export function getCategoryFilter(
  flattenedCategories?: (number | string)[],
): { where: { categories: { in: (number | string)[] } } } | Record<string, never> {
  if (flattenedCategories && flattenedCategories.length > 0) {
    return {
      where: {
        categories: {
          in: flattenedCategories,
        },
      },
    }
  }
  return {}
}
