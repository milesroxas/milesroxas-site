import type {
  CollapsibleField,
  Condition,
  Field,
  FieldAffectingData,
  FieldHook,
  RadioField,
  SelectField,
  TabAsField,
} from 'payload'
import { isInsideSection } from '@/blocks/section/shared'
import { BAND_THEME_OPTIONS, type BandTheme } from '@/blocks/shared/band-theme'
import type { MediaSize } from '@/blocks/shared/media-size'
import type { ProseHeadingLevel, TextSize } from '@/blocks/shared/typography'
import { hasRichTextContent } from '@/utilities/hasRichTextContent'

const hasContent = (value: unknown): boolean => {
  if (value === null || value === undefined || value === false) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object' && 'root' in value)
    return hasRichTextContent(value as Parameters<typeof hasRichTextContent>[0])
  return true
}

type GatedField = Exclude<FieldAffectingData, TabAsField>

const both =
  (first: Condition, second?: Condition): Condition =>
  (data, siblingData, context) =>
    Boolean(first(data, siblingData, context)) &&
    (!second || Boolean(second(data, siblingData, context)))

/**
 * Virtual checkbox gating optional fields; reads back as "any gated field has content".
 * Unticking clears only stored content, so a stale `false` from an API write keeps new copy.
 */
export const optionalFields = ({
  condition,
  contentOf,
  description,
  fields,
  label,
  name,
}: {
  condition?: Condition
  /** Fields that tick the box on read (default: all). Omit fields with a defaultValue. */
  contentOf?: string[]
  description?: string
  fields: GatedField[]
  label: string
  name: string
}): Field[] => {
  const watched = contentOf ?? fields.map((field) => field.name)
  const ticked = both((_, siblingData) => Boolean(siblingData?.[name]), condition)
  const gate = (field: GatedField): Field => {
    const clear: FieldHook = ({ previousSiblingDoc, siblingData, value }) =>
      siblingData?.[name] === false && hasContent(previousSiblingDoc?.[field.name])
        ? field.type === 'array' || field.type === 'blocks'
          ? []
          : null
        : value
    return {
      ...field,
      admin: { ...field.admin, condition: both(ticked, field.admin?.condition) },
      hooks: { ...field.hooks, beforeChange: [...(field.hooks?.beforeChange ?? []), clear] },
    } as Field
  }
  return [
    {
      name,
      type: 'checkbox',
      label,
      virtual: true,
      // Virtual fields default to read-only.
      admin: { condition, description, readOnly: false },
      hooks: {
        afterRead: [({ siblingData }) => watched.some((key) => hasContent(siblingData?.[key]))],
      },
    },
    ...fields.map(gate),
  ]
}

export const eyebrowFields = ({ condition }: { condition?: Condition } = {}): Field[] =>
  optionalFields({
    name: 'showEyebrow',
    label: 'Show eyebrow',
    condition,
    fields: [
      {
        name: 'eyebrow',
        type: 'text',
        admin: {
          description: 'A short kicker above the heading. Most headings read better without one.',
        },
      },
    ],
  })

// Layout-only wrapper: storage paths unchanged.
export const designFields = (fields: Field[]): CollapsibleField => ({
  type: 'collapsible',
  label: 'Design',
  admin: { initCollapsed: true },
  fields: [
    {
      type: 'row',
      fields: fields.map(
        (field) => ({ ...field, admin: { ...field.admin, width: '50%' } }) as Field,
      ),
    },
  ],
})

// Maps to `typeScale` in ./typography.ts.
export const textSizeField = ({ condition }: { condition?: Condition } = {}): RadioField => ({
  name: 'textSize',
  type: 'radio',
  label: 'Text size',
  defaultValue: 'small',
  options: [
    { label: 'Small', value: 'small' },
    { label: 'Large', value: 'large' },
  ] satisfies Array<{ label: string; value: TextSize }>,
  admin: {
    condition,
    layout: 'horizontal',
    description: 'Large sets the heading and copy one step up the type scale.',
  },
})

export const mediaSizeField = (description: string): SelectField => ({
  name: 'size',
  type: 'select',
  // Function, not literal: Payload then writes no column default naming a just-added enum label.
  defaultValue: () => 'contained',
  options: [
    { label: 'Full width', value: 'full' },
    { label: 'Contained', value: 'contained' },
    { label: 'Inset', value: 'inset' },
    { label: 'Small', value: 'small' },
  ] satisfies Array<{ label: string; value: MediaSize }>,
  admin: { description },
})

/**
 * The band theme select, shared by every block family, the Section block and
 * the hero bands. Options and their meaning live in `./band-theme`.
 *
 * Inside a Section the block renders bare and the Section paints the band, so
 * the block's own select is hidden there: the Section's theme is the one that
 * applies.
 */
export const themeField = ({
  admin,
  defaultValue = 'default',
}: {
  admin?: SelectField['admin']
  defaultValue?: BandTheme
} = {}): SelectField => ({
  name: 'theme',
  type: 'select',
  defaultValue,
  options: [...BAND_THEME_OPTIONS],
  admin: {
    condition: (_, __, { path }) => !isInsideSection(path),
    description:
      'Flips this band against its neighbours. "Default" follows the visitor\'s light or dark preference; "Inverted" paints the opposite of it.',
    ...admin,
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
const proseHeadingLevelField = ({
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

export const transitionFields = (): Field[] => [
  ...eyebrowFields(),
  { name: 'heading', type: 'text', required: true },
  ...optionalFields({
    name: 'showBody',
    label: 'Show supporting copy',
    fields: [{ name: 'body', type: 'richText' }],
  }),
  designFields([
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
      admin: { description: 'How the copy sits on the band.' },
    },
    // Statement is fixed display size; Prose is sized by heading level.
    textSizeField({
      condition: (_, siblingData) => !['prose', 'statement'].includes(siblingData?.layout),
    }),
    // Prose only: the other layouts are page furniture and always render an h2.
    // Inside an article the opener has to say where it sits in the outline.
    proseHeadingLevelField({
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'prose',
        description:
          'Outline level and type size for the Prose layout, set against the article body rather than the page headings.',
      },
    }),
    themeField(),
  ]),
]
