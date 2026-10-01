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
 * Site-wide facts and the Ask switch (docs/composer-roadmap.md, Phase 5).
 * A trimmed port of sas-site's Site Info global (its AEO plugin): only what
 * Ask reads. The company facts are what Ask can answer "who are you" and
 * "how do I reach you" from (`renderSiteInfo` in shared/content/extract.ts);
 * the inquiry promises are what the handoff shows; `ask.hidden` takes Ask off
 * the site.
 */
export const SiteInfo: GlobalConfig = {
  slug: 'site-info',
  label: 'Site Info',
  admin: {
    description: 'Site-wide facts the Ask assistant answers from, and the Ask switch.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'Miles Roxas' },
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
      name: 'address',
      type: 'group',
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
      admin: { description: 'Profile URLs Ask can point to (LinkedIn, GitHub, Dribbble).' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'llmsNotes',
      type: 'textarea',
      label: 'Notes for Ask',
      admin: {
        description: 'Optional extra paragraph Ask can answer from (what you are known for).',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateSiteInfo],
  },
}
