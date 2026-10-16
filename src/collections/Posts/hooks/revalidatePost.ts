import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'

// The paginated posts index is ISR-cached; bust it alongside the tag.
// Every post closes on other posts (More posts), so every post page goes too.
// A route pattern carries its route group: the page is tagged
// `_N_T_/(frontend)/posts/[slug]/page`, and `/posts/[slug]` matches nothing.
// The sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
const revalidatePostsIndex = () => {
  revalidatePath('/posts')
  revalidatePath('/(frontend)/posts/page/[pageNumber]', 'page')
  revalidatePath('/(frontend)/posts/[slug]', 'page')
  revalidateTag('posts', 'max')
}

export const {
  afterChange: revalidatePost,
  afterOperation: revalidateUnpublish,
  afterDelete: revalidateDelete,
} = revalidateDocument<'posts'>({
  noun: 'post',
  pathFor: (slug) => `/posts/${slug}`,
  revalidateLists: revalidatePostsIndex,
})
