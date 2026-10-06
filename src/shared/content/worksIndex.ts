/**
 * The works index's words, stated once.
 *
 * The Works index global seeds its fields with these, and /works falls back to
 * them until the global is published, so the page never renders blank.
 */
export const WORKS_INDEX_DEFAULTS = {
  heading: 'Work',
  description: 'Portfolio of selected works',
} as const
