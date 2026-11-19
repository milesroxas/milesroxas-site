/**
 * The posts index's words, stated once.
 *
 * The Posts index global seeds its heading with these, and /posts falls back
 * to them until the global is published, so the page never renders blank.
 */
export const POSTS_INDEX_DEFAULTS = {
  path: '/posts',
  heading: 'Posts',
  description:
    'Articles by Miles Roxas on design systems, brand strategy, Payload CMS, Webflow tooling and running a small design studio.',
} as const
