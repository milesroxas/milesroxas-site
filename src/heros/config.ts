import type { Condition, Field } from 'payload'

import { headingLexical } from '@/fields/headingLexical'
import { linkGroup } from '@/fields/linkGroup'
import { heroVisualSlotFields } from '@/fields/visual'

/**
 * The hero types that render media, each able to ground its band with an
 * effect (`HeroGround`).
 */
const mediaHeroTypes: Condition = (_, { type } = {}) =>
  ['highImpact', 'mediumImpact', 'editorial'].includes(type)

/**
 * `hero.media` as a visual slot (composer roadmap, D12): the upload keeps its
 * name, relation and the types it shows for, and gains the effect choice and
 * shader group beside it. A hero slot is ambient, so an upload set beside an
 * effect keeps its own frame.
 */
const heroMediaSlot = (): Field[] =>
  heroVisualSlotFields(
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    { condition: mediaHeroTypes },
  )

/**
 * The openings that paint the aim field (`@/features/aim-field`): `field`
 * grounds the whole band, `instrument` holds it in one ink panel beside the
 * copy. Neither shows media.
 */
const aimFieldHeroOptions = [
  { label: 'Field', value: 'field' },
  { label: 'Instrument', value: 'instrument' },
]

const isLift: Condition = (_, { type } = {}) => type === 'lift'

const scoreField = (name: string, label: string, description: string): Field => ({
  name,
  type: 'group',
  label,
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { width: '70%' } },
        {
          name: 'score',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          admin: { width: '30%', step: 1 },
        },
      ],
    },
  ],
})

/**
 * The Lift opening (`src/heros/LiftHero`): a dark band whose figure is a
 * score stepping up from a first version to the latest, over a dashed
 * baseline, with the gain as the fluoro readout. Scores run 0 to 100.
 */
const liftFields = (): Field => ({
  name: 'lift',
  type: 'group',
  label: 'Lift',
  admin: { condition: isLift },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'A short kicker above the headline, e.g. "A desktop app for…".' },
    },
    {
      name: 'readoutLabel',
      type: 'text',
      label: 'Readout label',
      admin: {
        description:
          'Names what the gain measures, under the readout, e.g. "/brand-design, v0 to v1". The readout is the latest score less the first.',
      },
    },
    scoreField('first', 'First', 'The low step, on the left, e.g. "First runs, v0" at 85.'),
    scoreField('latest', 'Latest', 'The high step, on the right, e.g. "Latest runs, v1" at 98.'),
    scoreField(
      'baseline',
      'Baseline',
      'The dashed line under both, e.g. "Without the skill" at 71. Its score is shown after the label.',
    ),
  ],
})

/**
 * The page hero shared by Pages and Posts. A factory, not a literal:
 * Payload mutates field configs while sanitizing them, and the visual slot
 * must not be shared between collections. `editorial` adds the post opening
 * (`src/heros/PostHero`), which only a post renders; `aimField` adds the aim
 * field openings and `lift` the Lift opening, which only `RenderHero` (Pages)
 * renders. The home opening
 * is the Home global's own (`homeHeroField`), so it is not a type here.
 */
export const heroField = ({
  editorial = false,
  aimField = false,
  lift = false,
}: {
  editorial?: boolean
  aimField?: boolean
  lift?: boolean
} = {}): Field => ({
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        ...(editorial ? [{ label: 'Editorial', value: 'editorial' }] : []),
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        ...(aimField ? aimFieldHeroOptions : []),
        ...(lift ? [{ label: 'Lift', value: 'lift' }] : []),
      ],
      required: true,
    },
    {
      name: 'showContent',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Content',
    },
    {
      name: 'richText',
      type: 'richText',
      admin: {
        condition: (_, { showContent } = {}) => showContent,
      },
      editor: headingLexical(),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    ...heroMediaSlot(),
    ...(lift ? [liftFields()] : []),
  ],
  label: false,
})
