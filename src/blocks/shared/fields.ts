import type { Field, SelectField } from 'payload'
import type { ProseHeadingLevel } from '@/blocks/shared/typography'

/**
 * Block surface select shared by every block family. Values map to
 * `themeClasses` in `./section.tsx` — keep the two in sync.
 */
export const themeField = (name = 'theme'): SelectField => ({
  name,
  type: 'select',
  defaultValue: 'light',
  options: ['light', 'dark', 'neutral', 'brand'],
  admin: {
    description:
      'Section surface within the visitor\'s site theme. Does not force light/dark mode — "dark" is a contrasted band in whichever theme the visitor chose.',
  },
})

/**
 * How big a tabbed block's trigger strip runs, shared by every tabbed block
 * so a reader meets one tab strip on this site, not two.
 */
export const tabSizeField = (): SelectField => ({
  name: 'tabSize',
  type: 'select',
  label: 'Tab size',
  defaultValue: 'default',
  options: ['default', 'small'],
  admin: {
    description:
      'Default sets heading-sized tab labels that wrap onto a second row. Small steps them down one type size and keeps them on one row that pans sideways, for five or more tabs.',
  },
})

/**
 * The outline level of a heading on the reading column (a Prose Standard
 * heading, a Story beats heading). The level also sets the type size, from
 * the one prose scale in `proseHeadingClassNames` (`./typography.ts`), so the
 * options are that scale's keys and nothing else. Each block states its own
 * condition and description.
 */
export const proseHeadingLevelField = ({
  admin,
  defaultValue = 'h2',
}: {
  admin: SelectField['admin']
  defaultValue?: ProseHeadingLevel
}): SelectField => ({
  name: 'headingLevel',
  type: 'select',
  label: 'Heading level',
  defaultValue,
  options: [
    { label: 'H2 (opens a section)', value: 'h2' },
    { label: 'H3 (opens a subsection)', value: 'h3' },
    { label: 'H4 (opens a passage)', value: 'h4' },
  ] satisfies Array<{ label: string; value: ProseHeadingLevel }>,
  admin,
})

/**
 * Fields of a rich-transition block: a short band of copy between story
 * sections, laid out one of four ways on a themed surface. Layout and theme
 * sit above the body so they stay reachable without scrolling past the editor.
 */
export const transitionFields = (): Field[] => [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text', required: true },
  {
    type: 'row',
    fields: [
      {
        name: 'layout',
        type: 'select',
        label: 'Layout',
        defaultValue: 'offset',
        // `offset` is the arrangement that shipped as `left` (heading one
        // column in); `left` now starts on column 1. Existing rows migrate
        // `left` -> `offset` so their rendering does not change. `centered` is
        // labelled "Center"; retiring `split`/`statement` is a later contract
        // step (see docs/blocks-reorg-roadmap.md, Phase D). `prose` puts the
        // heading on the Story beats reading column so it can open a passage
        // of beats.
        options: [
          { label: 'Offset', value: 'offset' },
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'centered' },
          { label: 'Split', value: 'split' },
          { label: 'Statement', value: 'statement' },
          { label: 'Prose', value: 'prose' },
        ],
        admin: {
          width: '50%',
          description: 'How the copy sits on the band.',
        },
      },
      {
        ...themeField(),
        admin: {
          ...themeField().admin,
          width: '50%',
        },
      },
    ],
  },
  // Prose only: the other layouts are page furniture and always render an h2.
  // Inside an article the opener has to say where it sits in the outline.
  proseHeadingLevelField({
    admin: {
      condition: (_, siblingData) => siblingData?.layout === 'prose',
      description:
        'Outline level and type size for the Prose layout, set against the article body rather than the page headings.',
      width: '50%',
    },
  }),
  { name: 'body', type: 'richText' },
]
