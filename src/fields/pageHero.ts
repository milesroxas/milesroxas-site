import type { GroupField } from 'payload'

/**
 * Introduction band rendered right after the hero of a Work or a
 * Post (`sections/WorkIntro`). Ported from sas-site's `pageIntroField`, where
 * the body is a Content Hub record's summary behind an override toggle; this
 * site has no record to read, so the body is authored here (composer roadmap,
 * D1). The band renders only when it has a body.
 */
export const pageIntroField = (): GroupField => ({
  name: 'intro',
  type: 'group',
  interfaceName: 'WorkIntro',
  admin: {
    description: 'Introduction band rendered right after the hero. Shown when it has a body.',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        description: 'Short label for the introduction. Not shown on the site for now.',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Names the section for screen readers. Not shown on the site.' },
    },
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'The introduction statement.' },
    },
  ],
})
