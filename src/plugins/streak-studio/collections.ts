import { sql } from '@payloadcms/db-vercel-postgres'
import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
  type Field,
} from 'payload'
import { authenticated } from '@/access/authenticated'
import type { Effect } from '@/features/immersive/studio/effect'
import { DEFAULT_EFFECT, EFFECT_OPTIONS, effectOf } from '@/features/immersive/studio/effects'
import { emptyRecipe, validateRecipe } from '@/features/immersive/studio/recipe'
import { recipeJsonSchema } from '@/features/immersive/studio/recipe-schema'
import { EFFECT_FIELD, LOOKS_SLUG, RECIPE_FIELD } from './components/paths'
import { lookEndpoints } from './endpoints'
import { recipeHash, storedRecipeHash, studioInput } from './hash'
import { lockLook, PUBLISH, transactionDB } from './transaction'
import { lookUsage } from './usage'

const internal = () => false

/**
 * What the website reads, written only by Publish: the resolved snapshot, the
 * poster manifest and the hash of the published recipe. They ride on the look
 * the way image sizes ride on a media document.
 */
const published = (field: Field): Field =>
  ({
    ...field,
    admin: { hidden: true },
    access: { create: internal, update: internal },
  }) as Field

type ChangeArgs = Parameters<CollectionBeforeChangeHook>[0]

/** Writes to a saved look serialize on it; a changed `archived` is written to its row at once. */
async function lockForChange({ data, req, originalDoc }: ChangeArgs) {
  if (!originalDoc?.id) return
  await lockLook(req, originalDoc.id)
  if (typeof data.archived !== 'boolean' || data.archived === originalDoc.archived) return
  const db = await transactionDB(req)
  await db.execute(
    sql`UPDATE streak_looks SET archived = ${data.archived} WHERE id = ${originalDoc.id}`,
  )
}

/**
 * A published look always has its posters: Publish in Studio is the one way
 * to publish new output. Publishing what is already published (Payload's
 * Revert to published) changes nothing the site shows.
 */
async function requireStudioPublish({ data, req, originalDoc }: ChangeArgs, effect: Effect) {
  const id: number | undefined = originalDoc?.id
  const live = id
    ? await req.payload.findByID({
        collection: LOOKS_SLUG,
        id,
        draft: false,
        depth: 0,
        disableErrors: true,
        req,
      })
    : null
  const unchanged =
    live?._status === 'published' &&
    storedRecipeHash(effect.id, live.recipe) ===
      recipeHash(effect.id, data.recipe ?? originalDoc?.recipe)
  if (!unchanged)
    throw new APIError('Use Publish in Studio: it renders the posters the site needs.', 400)
}

/**
 * A look is one effect (`@/features/immersive/studio/effects`), authored. It is
 * used like a media file: a page slot references the document, and the site
 * shows whatever is published. The draft is the working
 * copy (autosaved); Publish renders the two posters in the editor's browser
 * and publishes the look with them in one write. History is Payload's own
 * versions, so there is no second version system beside it.
 */
export const StreakLooks: CollectionConfig = {
  slug: LOOKS_SLUG,
  folders: true,
  // The slug predates the second effect. Slugs are never renamed: the table,
  // its versions and every slot's foreign key carry it.
  labels: { singular: 'Studio Look', plural: 'Studio Looks' },
  admin: {
    group: 'Assets',
    components: {
      edit: { PublishButton: '@/plugins/streak-studio/components/PublishButton#PublishButton' },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'thumbnail', EFFECT_FIELD, 'tags', '_status', 'updatedAt'],
    description:
      'Tune the recipe in the Inspector, watch it on the stage, then publish. Every place that uses the look shows what is published.',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  endpoints: lookEndpoints,
  hooks: {
    beforeChange: [
      async (args) => {
        const { data, req, originalDoc, operation, context } = args
        await lockForChange(args)
        // The effect is open until the look is first published, then fixed:
        // every published state, poster and slot that uses the look was made
        // for that effect. The stage changes it together with the recipe.
        if (originalDoc?.snapshot) data[EFFECT_FIELD] = originalDoc[EFFECT_FIELD]
        const effect = effectOf(data[EFFECT_FIELD] ?? originalDoc?.[EFFECT_FIELD])
        if (data.recipe) studioInput(() => validateRecipe(effect, data.recipe))
        if (operation === 'create') data.createdBy = req.user?.id
        data.updatedBy = req.user?.id ?? originalDoc?.updatedBy
        if (data._status === 'published' && !context[PUBLISH])
          await requireStudioPublish(args, effect)
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const uses = (await lookUsage(req, Number(id))).filter((use) => !use.historical)
        if (uses.length)
          throw new APIError(
            `This look is in use on ${uses.length === 1 ? uses[0].title : `${uses.length} places`}. Remove it there first.`,
            400,
          )
      },
    ],
  },
  fields: [
    // The stage and the meta live on tabs in the main column; the Inspector
    // (the recipe field) sits in the sidebar so it stays beside the stage on
    // every tab. Tabs are unnamed, so the schema is flat and the labels can
    // change without a migration.
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Studio',
          fields: [
            {
              name: 'stage',
              type: 'ui',
              admin: { components: { Field: '@/plugins/streak-studio/components/Stage#Stage' } },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'title', type: 'text', required: true, index: true },
            {
              name: EFFECT_FIELD,
              type: 'select',
              required: true,
              index: true,
              defaultValue: DEFAULT_EFFECT,
              options: EFFECT_OPTIONS,
              // Chosen on the stage, with the recipe it invalidates, and fixed
              // once the look is published (the `beforeChange` hook holds it).
              admin: {
                readOnly: true,
                description: 'What this look draws. Chosen in Studio before the first publish.',
              },
            },
            { name: 'description', type: 'textarea' },
            { name: 'tags', type: 'text', hasMany: true, index: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'thumbnail',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Dark poster',
                  admin: {
                    readOnly: true,
                    components: {
                      Cell: '@/plugins/streak-studio/components/Thumbnail#Thumbnail',
                    },
                    description: 'Rendered on Publish. Also the library thumbnail.',
                  },
                  access: { create: internal, update: internal },
                },
                {
                  name: 'lightPoster',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { readOnly: true, description: 'Rendered on Publish.' },
                  access: { create: internal, update: internal },
                },
              ],
            },
            {
              name: 'archived',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description: 'Hides the look from the picker. Places that use it keep working.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'createdBy',
                  type: 'relationship',
                  relationTo: 'users',
                  admin: { readOnly: true },
                  access: { create: internal, update: internal },
                },
                {
                  name: 'updatedBy',
                  type: 'relationship',
                  relationTo: 'users',
                  admin: { readOnly: true },
                  access: { create: internal, update: internal },
                },
              ],
            },
            {
              name: 'usage',
              type: 'ui',
              admin: { components: { Field: '@/plugins/streak-studio/components/Usage#Usage' } },
            },
          ],
        },
        {
          label: 'History',
          description:
            'Every published state of this look. Restore copies one into the draft; nothing changes on the site until you publish.',
          fields: [
            {
              name: 'history',
              type: 'ui',
              admin: {
                components: { Field: '@/plugins/streak-studio/components/History#History' },
              },
            },
          ],
        },
      ],
    },
    {
      name: RECIPE_FIELD,
      type: 'json',
      required: true,
      defaultValue: emptyRecipe(effectOf(DEFAULT_EFFECT)),
      // For an agent drafting a look over MCP; the Inspector replaces the JSON editor here.
      jsonSchema: recipeJsonSchema,
      admin: {
        position: 'sidebar',
        components: { Field: '@/plugins/streak-studio/components/Inspector#Inspector' },
      },
      validate: (value, { siblingData }) => {
        try {
          validateRecipe(effectOf((siblingData as Record<string, unknown>)[EFFECT_FIELD]), value)
          return true
        } catch (error) {
          return (error as Error).message
        }
      },
    },
    published({ name: 'snapshot', type: 'json' }),
    published({ name: 'posters', type: 'json' }),
    published({ name: 'sourceHash', type: 'text' }),
  ],
}
