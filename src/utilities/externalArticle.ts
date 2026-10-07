import type { Post } from '@/payload-types'

export const DEFAULT_PUBLISHER = 'Suits & Sandals'

type PostSource = Partial<Pick<Post, 'source' | 'external'>> | null | undefined

/** An external post: written elsewhere, introduced here, read at its original URL. */
export type ExternalArticle = {
  url: string
  publisher: string
  /** The URL without its protocol or `www.`, as the link names its destination. */
  address: string
}

export const isExternalPost = (post: PostSource): boolean => post?.source === 'external'

export function parseArticleUrl(value: unknown): URL | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/** The original article a post points to, or null when the post is read here. */
export function externalArticle(post: PostSource): ExternalArticle | null {
  if (!isExternalPost(post)) return null
  const url = parseArticleUrl(post?.external?.url)
  if (!url) return null
  const path = url.pathname.replace(/\/$/, '')
  return {
    url: url.href,
    publisher: post?.external?.publisher?.trim() || DEFAULT_PUBLISHER,
    address: `${url.hostname.replace(/^www\./, '')}${path}`,
  }
}
