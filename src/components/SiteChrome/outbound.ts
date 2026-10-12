/**
 * A work's live site, as the dock offers it: a "Visit" button on the case
 * study. The URL is authored on the work (Works › Status › Live site), the
 * label is derived from its host unless the work names one.
 */

export type OutboundLink = {
  href: string
  label: string
}

/**
 * A host longer than this does not fit the button in its tightest home, the
 * room between the Menu pill and Ask on a 375px phone; the label falls back
 * to the generic.
 */
const HOST_LABEL_LIMIT = 16

export const parseOutboundUrl = (value: unknown): URL | null => {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

/** Payload field validator: empty is fine, anything else must be an absolute http(s) URL. */
export const validateOutboundUrl = (value: unknown): true | string =>
  value == null || value === '' || parseOutboundUrl(value) !== null
    ? true
    : 'Enter a full address, starting with https://'

/** The host as the button names it: no `www.`, no port. */
const hostLabel = (url: URL): string => url.hostname.replace(/^www\./, '')

export function outboundLink(
  link: { url?: string | null; label?: string | null } | null | undefined,
): OutboundLink | null {
  const url = parseOutboundUrl(link?.url)
  if (!url) return null
  const named = link?.label?.trim()
  if (named) return { href: url.href, label: named }
  const host = hostLabel(url)
  return { href: url.href, label: host.length > HOST_LABEL_LIMIT ? 'Visit site' : `Visit ${host}` }
}
