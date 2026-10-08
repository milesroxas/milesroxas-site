import { MorePostsIndex } from './MorePosts.client'
import type { MorePostsItem } from './query'

/** The close of every post: other posts to open next. Renders nothing when there are none. */
export function MorePosts({ items }: { items: MorePostsItem[] }) {
  return items.length > 0 ? <MorePostsIndex items={items} /> : null
}

export { getMorePosts } from './query'
