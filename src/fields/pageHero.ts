import type { GroupField } from 'payload'

/**
 * Full-screen introduction band rendered right after the hero of a Work or a
 * Post (`sections/WorkIntro`). Ported from sas-site's `pageIntroField`, where
 * the body is a Content Hub record's summary behind an override toggle; this
 * site has no record to read, so the body is authored here (composer roadmap,
 * D1). The band renders only when it has a title.
 */
export const pageIntroField = (): GroupField => ({
  name: 'intro',
  type: 'group',
  interfaceName: 'WorkIntro',
  admin: {
    description:
      'Full-screen introduction band rendered right after the hero. Shown when it has a title.',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        description: 'Short label above the introduction copy, e.g. "Introduction".',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Statement headline for the section.' },
    },
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'The introduction copy, offset beside the title.' },
    },
  ],
})
