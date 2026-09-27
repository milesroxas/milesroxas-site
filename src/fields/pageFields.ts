import type { CheckboxField } from 'payload'

/** Opt-in floating Contents button (`features/contents`), ported from sas-site. */
export const contentsButtonField = (): CheckboxField => ({
  name: 'showContents',
  type: 'checkbox',
  label: 'Contents button',
  defaultValue: false,
  admin: {
    description:
      'Adds a floating Contents button that lists the section headings on this page and jumps between them. Pages with fewer than three section headings never show it.',
  },
})
