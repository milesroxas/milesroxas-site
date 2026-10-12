import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDocument } from '@/collections/shared/revalidateDocument'

export const {
  afterChange: revalidateWork,
  afterOperation: revalidateUnpublish,
  afterDelete: revalidateDelete,
} = revalidateDocument<'works'>({
  noun: 'work',
  pathFor: (slug) => `/works/${slug}`,
  // Every work page lists other works (More work), so every work page goes too.
  // The sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
  revalidateLists: () => {
    revalidatePath('/works')
    revalidatePath('/works/[slug]', 'page')
    revalidateTag('works', 'max')
  },
})
