import { revalidateDocument } from '@/collections/shared/revalidateDocument'

// No list of its own: the sitemap and llms.txt follow through the AEO plugin (plugins/aeo).
export const {
  afterChange: revalidatePage,
  afterOperation: revalidateUnpublish,
  afterDelete: revalidateDelete,
} = revalidateDocument<'pages'>({
  noun: 'page',
  pathFor: (slug) => `/${slug}`,
  revalidateLists: () => {},
})
