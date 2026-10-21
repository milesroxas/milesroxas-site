import type { JSONField } from 'payload'
import type { Effect, Parameter } from './effect'
import { EFFECTS } from './effects'
import { FRAME_MAX, RECIPE_VERSION, SEED_MAX } from './recipe'
import { STILL_USE_IDS, STILL_USES } from './stills'

/**
 * A recipe as JSON Schema, for the look's `recipe` field. The admin never sees
 * it (the Inspector replaces the JSON editor); it is there for the reader that
 * has no Inspector: an agent drafting a look over MCP, whose tool schema is
 * built from this.
 *
 * Every name and range below is read out of the effect contracts, so nothing
 * here restates a number. Defaults are left out on purpose: they move with
 * every tuning pass, and this text is also written into `payload-types.ts`. A
 * published look's `snapshot` already shows every resolved value.
 *
 * `deltas` stays an open object because its keys depend on a sibling field
 * (the look's `effect`), which JSON Schema cannot condition on; the parameter
 * table rides in its description, and `validateRecipe` is what answers on save.
 */

const describeParameter = (key: string, spec: Parameter): string => {
  if ('options' in spec) return `${key}: ${spec.options.map((option) => `"${option}"`).join(' | ')}`
  if ('toggle' in spec) return `${key}: true | false`
  if ('color' in spec) return `${key}: [r, g, b], each 0 to 1`
  if ('vector' in spec) return `${key}: ${spec.vector} numbers, each ${spec.min} to ${spec.max}`
  return `${key}: ${spec.min} to ${spec.max}`
}

const describeEffect = (effect: Effect): string => {
  const groups = new Map<string, string[]>()
  for (const [key, spec] of Object.entries(effect.parameters)) {
    const lines = groups.get(spec.group) ?? []
    lines.push(describeParameter(key, spec))
    groups.set(spec.group, lines)
  }
  const table = [...groups].map(([group, lines]) => `${group}: ${lines.join('; ')}.`).join(' ')
  return `When \`effect\` is "${effect.id}" (${effect.label}): ${table}`
}

const DELTAS_DESCRIPTION = [
  'Only the parameters that leave their default, by name. `{}` is the effect as it ships, and the `snapshot.dark` of any published look of the same effect shows every resolved value to start from. An unknown name or a value out of range is refused on save with the reason.',
  ...Object.values(EFFECTS).map(describeEffect),
].join(' ')

const unseeded = Object.values(EFFECTS)
  .filter((effect) => !effect.seeded)
  .map((effect) => effect.label)

const uri = 'a://studio/recipe.schema.json'
const stillsUri = 'a://studio/stills.schema.json'

export const recipeJsonSchema: NonNullable<JSONField['jsonSchema']> = {
  fileMatch: [uri],
  uri,
  schema: {
    type: 'object',
    description:
      'What a Studio look draws. A draft can be written over the API; publishing happens in the admin Studio, where the posters are rendered.',
    additionalProperties: false,
    required: ['version', 'seed', 'deltas', 'frame'],
    properties: {
      version: { type: 'integer', enum: [RECIPE_VERSION] },
      seed: {
        type: 'integer',
        minimum: 0,
        maximum: SEED_MAX,
        description: `Lays out a seeded effect: a different seed is a different arrangement of the same look. Send 0 for an effect no seed changes (${unseeded.join(', ')}).`,
      },
      frame: {
        type: 'integer',
        minimum: 1,
        maximum: FRAME_MAX,
        description: 'The animation frame the posters are captured at.',
      },
      deltas: { type: 'object', description: DELTAS_DESCRIPTION },
    },
  },
}

const describeUses = STILL_USE_IDS.map(
  (use) =>
    `"${use}" (${STILL_USES[use].label}, ${STILL_USES[use].width} × ${STILL_USES[use].height})`,
).join(', ')

/**
 * The look's stills as JSON Schema, for the `stills` field, for the same
 * reader. A still is rendered in the admin Studio on Publish; an agent can
 * draft one (its use, face, seed, frame and overrides) and leave the render
 * to the editor. `media` and `hash` are the published output and are never
 * sent.
 */
export const stillsJsonSchema: NonNullable<JSONField['jsonSchema']> = {
  fileMatch: [stillsUri],
  uri: stillsUri,
  schema: {
    type: 'array',
    description:
      'Static renders of the look, one per use: the share image of a page that opens on the look (preview), social sizes and custom sizes. Each is the live recipe plus its own overrides, rendered in the admin Studio when the look is published; the published look serves the preview still wherever the look is used. Up to 12; one preview.',
    items: {
      type: 'object',
      additionalProperties: false,
      required: [
        'id',
        'use',
        'surface',
        'width',
        'height',
        'scale',
        'format',
        'transparent',
        'seed',
        'frame',
        'deltas',
      ],
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-z0-9]{6,12}$',
          description: 'Stable within the look; 6 to 12 lowercase letters and digits.',
        },
        use: { type: 'string', enum: STILL_USE_IDS, description: `One of ${describeUses}.` },
        label: { type: 'string', maxLength: 80, description: 'A name for a custom still.' },
        surface: {
          type: 'string',
          enum: ['dark', 'light'],
          description: 'The face the still is of.',
        },
        width: {
          type: 'integer',
          minimum: 320,
          maximum: 1920,
          description: 'Logical pixels. Fixed by the use; free for "custom".',
        },
        height: { type: 'integer', minimum: 320, maximum: 1920 },
        scale: {
          type: 'integer',
          enum: [1, 2],
          description: 'Pixel density: 2 renders twice the size.',
        },
        format: { type: 'string', enum: ['webp', 'jpeg'] },
        transparent: {
          type: 'boolean',
          description: "Keep alpha instead of flattening onto the face's ground. Custom WebP only.",
        },
        seed: { type: 'integer', minimum: 0, maximum: SEED_MAX },
        frame: { type: 'integer', minimum: 1, maximum: FRAME_MAX },
        deltas: {
          type: 'object',
          description: `Overrides on the live recipe for this still only, by parameter name; \`{}\` is the look as it runs. ${DELTAS_DESCRIPTION}`,
        },
      },
    },
  },
}
