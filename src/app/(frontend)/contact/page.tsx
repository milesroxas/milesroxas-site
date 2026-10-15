import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { ContactTemplate } from '@/features/contact/ContactTemplate'
import { getContactRecommendations } from '@/features/contact/recommendations'
import type { ContactPage, SiteInfo } from '@/payload-types'
import { CONTACT_PAGE_DEFAULTS, type ContactPageCopy } from '@/shared/content/contact'
import { inquiryResponseTime } from '@/shared/content/inquiry'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaURL'
import { breadcrumbSchema, contactPageSchema } from '@/utilities/schema'

const loadContactPage = () =>
  Promise.all([
    // Depth 1 for the CV's file. This route is the global's only reader.
    getCachedGlobal('contact-page', 1)() as Promise<ContactPage>,
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

/** The CV card's file, once one is chosen. */
const resolveCv = (page: ContactPage | null) => {
  const file = page?.cv
  if (!file || typeof file !== 'object' || !file.url) return null
  return { url: getMediaUrl(file.url), filesize: file.filesize ?? null }
}

/**
 * The contact page: a route rather than a Pages document, because the form
 * is fixed (name, email, message into Inquiries) and only its words are
 * edited, in the Contact page global. Static: the Ask prefill is read in the
 * browser, never from the URL.
 */
export default async function ContactRoute() {
  const [page, siteInfo] = await loadContactPage()
  const copy = resolveCopy(page)
  const recommendations = await getContactRecommendations(page)

  return (
    <>
      <JsonLd
        data={[
          contactPageSchema({
            name: page?.meta?.title || 'Contact',
            description: page?.meta?.description || copy.lead,
          }),
          breadcrumbSchema([{ name: 'Contact', path: '/contact' }]),
        ]}
      />
      <ContactTemplate
        copy={copy}
        cv={resolveCv(page)}
        email={siteInfo?.contactEmail ?? null}
        profiles={siteInfo?.socialProfiles ?? []}
        recommendations={recommendations}
        responseTime={inquiryResponseTime(siteInfo)}
      />
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const [page] = await loadContactPage()

  return generateMeta({
    doc: {
      title: 'Contact',
      meta: {
        title: page?.meta?.title,
        description: page?.meta?.description || resolveCopy(page).lead,
      },
    },
    pathname: '/contact',
  })
}
