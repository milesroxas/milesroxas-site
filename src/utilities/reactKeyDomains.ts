/**
 * Domain-specific key generators
 */

import type { Post, Work } from '@/payload-types'
import { getCompositeKey, getEntityKey, getSlugKey } from './reactKeys'

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
 * Post domain - keys for blog posts
 */
export const postKeys = {
  /**
   * Generate key for a post card
   */
  fromPost: (
    post: Post | { slug?: string | null; id?: string | number | null },
    index?: number,
  ): string => {
    if (post.id) {
      return `post-${post.id}`
    }
    return getSlugKey(post.slug || null, 'post', index)
  },

  /**
   * Generate key for post cards in arrays
   */
  fromPostArray: (post: Post | { slug?: string | null }, index: number): string => {
    return postKeys.fromPost(post, index)
  },
}

/**
 * Work domain - keys for portfolio works
 */
export const workKeys = {
  /**
   * Generate key for a work card
   */
  fromWork: (
    work: Work | { slug?: string | null; id?: string | number | null },
    index?: number,
  ): string => {
    if (work.id) {
      return `work-${work.id}`
    }
    return getSlugKey(work.slug || null, 'work', index)
  },

  /**
   * Generate key for work cards in arrays
   */
  fromWorkArray: (work: Work | { slug?: string | null }, index: number): string => {
    return workKeys.fromWork(work, index)
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
 * Code domain - keys for code tokens and lines
 */
export const codeKeys = {
  /**
   * Generate key for a code line
   */
  fromLine: (line: Array<{ content: string }>, index: number): string => {
    const lineContent = line.map((token) => token.content).join('')
    const hash = lineContent.slice(0, 20).replace(/\s+/g, '-')
    return getCompositeKey('line', index, hash)
  },

  /**
   * Generate key for a code token
   */
  fromToken: (token: { content: string }, tokenIndex: number, lineIndex: number): string => {
    return getCompositeKey('token', lineIndex, tokenIndex, token.content.slice(0, 10))
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

/**
 * Marquee domain - keys for marquee items (duplicated for animation)
 */
export const marqueeKeys = {
  /**
   * Generate key for a marquee item
   */
  fromItem: (text: string, index: number, arrayIndex?: number): string => {
    const textHash = text.slice(0, 10).replace(/\s+/g, '-')
    return getCompositeKey('marquee', arrayIndex ?? 0, index, textHash)
  },
}
