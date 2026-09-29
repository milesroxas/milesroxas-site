import type { Metadata } from 'next'
import { ContactTemplate } from '@/features/contact/ContactTemplate'
import type { ContactPage, SiteInfo } from '@/payload-types'
import { CONTACT_PAGE_DEFAULTS, type ContactPageCopy } from '@/shared/content/contact'
import { inquiryResponseTime } from '@/shared/content/inquiry'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

const loadContactPage = () =>
  Promise.all([
    getCachedGlobal('contact-page', 0)() as Promise<ContactPage>,
    // Depth 1 like the site chrome: the cache is keyed by slug alone, so both share one entry.
    getCachedGlobal('site-info', 1)() as Promise<SiteInfo>,
  ])

/** Each field falls back on its own, so clearing one in the admin never blanks the page. */
const resolveCopy = (page: ContactPage | null): ContactPageCopy => {
  const copy = { ...CONTACT_PAGE_DEFAULTS } as ContactPageCopy
  for (const key of Object.keys(copy) as (keyof ContactPageCopy)[]) {
    const value = page?.[key]
    if (typeof value === 'string' && value.trim()) copy[key] = value
  }
  return copy
}

/**
 * The contact page: a route rather than a Pages document, because the form
 * is fixed (name, email, message into Inquiries) and only its words are
 * edited, in the Contact page global. Static: the Ask prefill is read in the
 * browser, never from the URL.
 */
export default async function ContactRoute() {
  const [page, siteInfo] = await loadContactPage()

  return (
    <ContactTemplate
      copy={resolveCopy(page)}
      email={siteInfo?.contactEmail ?? null}
      responseTime={inquiryResponseTime(siteInfo)}
    />
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const [page] = await loadContactPage()
  const title = `${page?.meta?.title || 'Contact'} | Miles Roxas`
  const description = page?.meta?.description || resolveCopy(page).lead

  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description, url: '/contact' }),
  }
}
