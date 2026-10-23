/**
 * Domain-specific key generators
 */

import { getEntityKey, getSlugKey } from './reactKeys'

/**
 * Block domain - keys for Payload CMS blocks
 */
export const blockKeys = {
  /**
   * Generate key for a layout block
   */
  fromBlock: (
    block: { id?: string | number | null; blockType?: string },
    index: number,
  ): string => {
    return getEntityKey(block, block.blockType || 'block', index)
  },
}

/**
 * Slide domain - keys for slider slides
 */
export const slideKeys = {
  /**
   * Generate key for a slide
   */
  fromSlide: (
    slide: {
      id?: string | number | null
      image?: number | { id?: string | number | null } | null
    },
    index: number,
  ): string => {
    if (slide.id) {
      return `slide-${slide.id}`
    }
    if (slide.image) {
      if (typeof slide.image === 'object' && slide.image !== null && 'id' in slide.image) {
        if (slide.image.id) {
          return `slide-image-${slide.image.id}`
        }
      } else if (typeof slide.image === 'number') {
        return `slide-image-${slide.image}`
      }
    }
    return `slide-${index}`
  },
}

/**
 * Category domain - keys for categories
 */
export const categoryKeys = {
  /**
   * Generate key for a category
   */
  fromCategory: (
    category: { id?: string | number | null; slug?: string | null },
    index?: number,
  ): string => {
    if (category.id) {
      return `category-${category.id}`
    }
    return getSlugKey(category.slug || null, 'category', index)
  },
}

/**
 * Link domain - keys for CMS links
 */
export const linkKeys = {
  /**
   * Generate key for a link
   */
  fromLink: (
    link: { id?: string | number | null; url?: string | null; label?: string | null },
    index: number,
  ): string => {
    if (link.id) {
      return `link-${link.id}`
    }
    if (link.url) {
      return `link-${link.url}-${index}`
    }
    if (link.label) {
      return `link-${link.label}-${index}`
    }
    return `link-${index}`
  },
}
