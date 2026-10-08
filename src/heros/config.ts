import type { Condition, Field, UploadField } from 'payload'

import { headingLexical } from '@/fields/headingLexical'
import { linkGroup } from '@/fields/linkGroup'
import { heroVisualSlotFields } from '@/fields/visual'

/** The hero types that render media. */
const mediaHeroTypes: Condition = (_, { type } = {}) =>
  ['highImpact', 'mediumImpact', 'home', 'editorial'].includes(type)

/**
 * The hero types that can ground their band with an effect (`HeroGround`).
 * The home hero draws its own scene, so it keeps a plain upload.
 */
const effectHeroTypes: Condition = (_, { type } = {}) =>
  ['highImpact', 'mediumImpact', 'editorial'].includes(type)

/**
 * `hero.media` as a visual slot (composer roadmap, D12): the upload keeps its
 * name, relation and the types it shows for, and gains the effect choice and
 * shader group beside it. A hero slot is ambient, so an upload set beside an
 * effect keeps its own frame.
 */
const heroMediaSlot = (): Field[] => {
  const [media, ...visual] = heroVisualSlotFields(
    {
      name: 'media',
      type: 'upload',
      admin: { condition: mediaHeroTypes },
      relationTo: 'media',
      required: true,
    },
    { condition: effectHeroTypes },
  )
  // The slot hides the upload for types that offer no effect; the home hero
  // still shows its plain upload, so the upload keeps its own condition.
  const upload = media as UploadField
  upload.admin = { ...upload.admin, condition: mediaHeroTypes }
  return [upload, ...visual]
}

/**
 * The page hero shared by Pages and Posts. A factory, not a literal:
 * Payload mutates field configs while sanitizing them, and the visual slot
 * must not be shared between collections. `editorial` adds the post opening
 * (`src/heros/PostHero`), which only a post renders.
 */
export const heroField = ({ editorial = false }: { editorial?: boolean } = {}): Field => ({
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
          label: 'Home',
          value: 'home',
        },
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
  ],
  label: false,
})
