import type { PostsSelect } from '@/payload-types'

/** What a post card reads: the collection's `defaultPopulate` and every card listing. */
export const postCardSelect = {
  title: true,
  slug: true,
  hero: {
    media: true,
    visualType: true,
    shader: true,
  },
  categories: true,
  meta: {
    image: true,
    description: true,
  },
  source: true,
  external: {
    publisher: true,
  },
} satisfies PostsSelect<true>
