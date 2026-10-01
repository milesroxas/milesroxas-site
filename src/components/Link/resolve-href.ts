/**
 * Single source for the site's CMS-link URL scheme: reference links resolve
 * pages at the root and every other collection under its slug, custom links
 * pass their URL through. Shared by CMSLink and the ported blocks that reduce
 * a link field to an href (FAQ, Rich text Actions).
 */
export function resolveCmsLinkHref(link: {
  type?: 'custom' | 'reference' | null
  reference?: {
    relationTo: string
    value: { slug?: string | null } | string | number
  } | null
  url?: string | null
}): string | null {
  const { type, reference, url } = link
  if (type === 'reference' && typeof reference?.value === 'object' && reference.value.slug) {
    return `${reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''}/${reference.value.slug}`
  }
  return url ?? null
}
