import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'

export const {
  afterChange: revalidateWork,
  afterOperation: revalidateUnpublish,
  afterDelete: revalidateDelete,
} = revalidateDocument<'works'>({
  noun: 'work',
  pathFor: (slug) => `/works/${slug}`,
  // Every work page lists other works (More work), so every work page goes too;
  // the pattern carries its route group, as the page's tag does.
  // The sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
  revalidateLists: () => {
    revalidatePath('/works')
    revalidatePath('/(frontend)/works/[slug]', 'page')
    revalidateTag('works', 'max')
  },
})
