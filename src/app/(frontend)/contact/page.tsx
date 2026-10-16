import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { ContactTemplate } from '@/features/contact/ContactTemplate'
import { getContactRecommendations } from '@/features/contact/recommendations'
import type { ContactPage, SiteInfo } from '@/payload-types'
import { resolveContactCopy, resolveContactCv } from '@/shared/content/contact'
import { inquiryResponseTime } from '@/shared/content/inquiry'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { breadcrumbSchema, contactPageSchema } from '@/utilities/schema'

const loadContactPage = () =>
  Promise.all([
    // Depth 1 for the CV's file. This route is the global's only reader.
    getCachedGlobal('contact-page', 1)() as Promise<ContactPage>,
    // Depth 1 like the site chrome: the cache is keyed by slug alone, so both share one entry.
    getCachedGlobal('site-info', 1)() as Promise<SiteInfo>,
  ])

/**
 * The contact page: a route rather than a Pages document, because the form
 * is fixed (name, email, message into Inquiries) and only its words are
 * edited, in the Contact page global. Static: the Ask prefill is read in the
 * browser, never from the URL.
 */
export default async function ContactRoute() {
  const [page, siteInfo] = await loadContactPage()
  const copy = resolveContactCopy(page)
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
        cv={resolveContactCv(page)}
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
        description: page?.meta?.description || resolveContactCopy(page).lead,
      },
    },
    pathname: '/contact',
    markdownPath: '/contact.md',
  })
}
