import { revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { CONTACT_PAGE_DEFAULTS } from '@/shared/content/contact'

const revalidateContactPage: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating contact page')
    revalidateTag('global_contact-page', 'max')
  }
  return doc
}

const TOKENS =
  'Use {name}, {email} and {responseTime} to fill in the sender and Site Info’s reply time.'

/**
 * The words on /contact. The page itself is a route (src/app/(frontend)/contact),
 * so this global holds only its copy; the form is fixed at name, email and
 * message and files into Inquiries. The reply time and the direct address
 * come from Site Info, so the promise is made in one place.
 */
export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact page',
  admin: {
    description: 'The copy on /contact. Reply time and email address live in Site Info.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Form',
          fields: [
            {
              name: 'heading',
              type: 'text',
              required: true,
              defaultValue: CONTACT_PAGE_DEFAULTS.heading,
            },
            {
              name: 'lead',
              type: 'textarea',
              defaultValue: CONTACT_PAGE_DEFAULTS.lead,
              admin: {
                description: 'One or two sentences under the heading: what to write about.',
              },
            },
            {
              name: 'messagePlaceholder',
              type: 'text',
              defaultValue: CONTACT_PAGE_DEFAULTS.messagePlaceholder,
              admin: { description: 'The prompt inside the empty message field.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'submitLabel',
                  type: 'text',
                  defaultValue: CONTACT_PAGE_DEFAULTS.submitLabel,
                },
                {
                  name: 'submitNote',
                  type: 'text',
                  defaultValue: CONTACT_PAGE_DEFAULTS.submitNote,
                  admin: { description: 'Beside the send button. {responseTime} fills in.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Sent',
          description: 'What replaces the form once the message is sent.',
          fields: [
            {
              name: 'sentHeading',
              type: 'text',
              defaultValue: CONTACT_PAGE_DEFAULTS.sentHeading,
              admin: { description: TOKENS },
            },
            {
              name: 'sentBody',
              type: 'textarea',
              defaultValue: CONTACT_PAGE_DEFAULTS.sentBody,
              admin: { description: TOKENS },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  admin: { description: 'Browser tab and search title. Defaults to "Contact".' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: { description: 'Search and share description. Defaults to the lead.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateContactPage],
  },
}
