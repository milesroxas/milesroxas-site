import type { SiteInfo } from '@/payload-types'

/** The home page's one heading: the owner's name and role, from Site Info. */
export const homeHeading = (
  siteInfo: Partial<Pick<SiteInfo, 'name' | 'jobTitle'>> | null | undefined,
) => {
  const name = siteInfo?.name?.trim() || 'Miles Roxas'
  const role = siteInfo?.jobTitle?.trim()
  return role ? `${name}, ${role}` : name
}
