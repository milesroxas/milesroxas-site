import { revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { ASK_QUESTION_LENGTH } from '@/features/ask/vocabulary'

const revalidateSiteInfo: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site info')
    revalidateTag('global_site-info', 'max')
  }
  return doc
}

/**
 * Site-wide facts, the Ask switch, and the site's public identity
 * (docs/composer-roadmap.md, Phase 5; docs/aeo.md). A port of sas-site's Site
 * Info global (its AEO plugin). The facts are what Ask answers "who are you"
 * and "how do I reach you" from (`renderSiteInfo` in shared/content/extract.ts)
 * and what the Person and WebSite JSON-LD, llms.txt and the default share
 * metadata are built from (`utilities/schema.ts`, `plugins/aeo`); the inquiry
 * promises are what the handoff shows; `ask.hidden` takes Ask off the site.
 */
export const SiteInfo: GlobalConfig = {
  slug: 'site-info',
  label: 'Site Info',
  admin: {
    description:
      'Site-wide facts: what Ask answers from, what search engines and AI assistants read about the site, and the Ask switch.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'Miles Roxas' },
    {
      name: 'jobTitle',
      type: 'text',
      admin: {
        description:
          'What you do, as a search result or an AI assistant would say it ("Design engineer").',
      },
    },
    {
      name: 'legalName',
      type: 'text',
      admin: { description: 'Registered legal name, if different from the name above.' },
    },
    {
      name: 'tagline',
      type: 'text',
      admin: { description: 'One-sentence positioning.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'A longer summary Ask can quote. Two to four sentences.' },
    },
    { name: 'foundingYear', type: 'number', min: 1900, max: 2100 },
    {
      name: 'contactEmail',
      type: 'email',
      defaultValue: 'miles@milesroxas.com',
      admin: {
        description: 'Where Ask handoffs are sent, and the address Ask gives when asked.',
      },
    },
    {
      // The promises the handoff and its receipt email make.
      name: 'inquiries',
      type: 'group',
      label: 'Inquiries',
      admin: { description: 'What the Ask handoff and its receipt email promise.' },
      fields: [
        {
          name: 'responseTime',
          type: 'text',
          defaultValue: 'within 2 business days',
          admin: {
            description: 'Completes the sentence "you will hear back ___".',
          },
        },
        {
          name: 'scheduleUrl',
          type: 'text',
          admin: {
            description: 'Booking link behind "Book a call". Leave empty to hide that action.',
          },
        },
      ],
    },
    {
      // Site-wide switch for Ask: /ask, the dock's Ask button and the endpoint
      // all read this one flag (src/features/ask/README.md).
      name: 'ask',
      type: 'group',
      label: 'Ask',
      admin: { description: 'The grounded Q&A assistant in the dock and at /ask.' },
      fields: [
        {
          name: 'hidden',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hide Ask',
          admin: {
            description:
              'Turn on to take Ask off the site: the dock loses its Ask button and /ask returns not found.',
          },
        },
        {
          // Read by the site chrome (src/components/SiteChrome/SiteChrome.tsx)
          // for the Ask panel's empty state.
          name: 'suggestions',
          type: 'array',
          label: 'Suggested questions',
          labels: { singular: 'Question', plural: 'Questions' },
          maxRows: 3,
          admin: {
            description:
              'Shown when Ask opens with nothing asked yet; a tap sends it. Write questions the case studies and posts answer.',
          },
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
              maxLength: ASK_QUESTION_LENGTH.max,
            },
          ],
        },
        {
          // Action panel, no stored value. Rebuilds the embedding index.
          name: 'rebuildIndex',
          type: 'ui',
          admin: {
            components: { Field: '@/features/ask/admin/RebuildIndexPanel#RebuildIndexPanel' },
          },
        },
        {
          // Read-only panel, no stored value. OpenAI spend and tokens.
          name: 'usage',
          type: 'ui',
          admin: {
            components: { Field: '@/features/ask/admin/UsagePanel#UsagePanel' },
          },
        },
      ],
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The picture search engines and AI assistants show for you (Person structured data). Square, at least 400×400px.',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Default preview image',
      admin: {
        description:
          'The share card for every page that has no SEO image of its own. Landscape, at least 1200×630px.',
      },
    },
    {
      name: 'address',
      type: 'group',
      admin: {
        description:
          'Where you are based. Only the city, state and country are published in structured data.',
      },
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    {
      name: 'socialProfiles',
      type: 'array',
      admin: {
        description:
          'Profile URLs (LinkedIn, GitHub, Dribbble). Ask points to them, and structured data lists them as sameAs so search engines and AI assistants match this site to those profiles.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'affiliations',
      type: 'array',
      labels: { singular: 'Affiliation', plural: 'Affiliations' },
      admin: {
        description:
          'Organizations you belong to or founded (the agency, a studio). Structured data lists them as affiliation and worksFor, so an assistant can tie this site to the organization and its site.',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text', admin: { description: "The organization's website." } },
        {
          name: 'role',
          type: 'text',
          admin: { description: 'Your role there ("Co-founder", "Creative director").' },
        },
      ],
    },
    {
      name: 'llmsNotes',
      type: 'textarea',
      label: 'Notes for Ask and AI assistants',
      admin: {
        description:
          'Optional extra paragraph Ask can answer from and llms.txt ends with (what you are known for).',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateSiteInfo],
  },
}
