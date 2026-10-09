import type { Block, Condition, Field, FieldAffectingData, TabAsField } from 'payload'

/**
 * A Storybook-side description of one block's top-level Payload fields, so a
 * story's controls offer exactly the options, labels, defaults and conditions
 * the CMS editor does. Built in Node by `scripts/generate-block-controls.ts`
 * (block configs import server-only editor code a story cannot bundle) and
 * read in the browser by `./index.ts`. Plain data: everything here survives
 * JSON.
 */
export type ControlOption = { label: string; value: string }

/** The subset of Storybook's `if` that a Payload condition can be shown to equal. */
export type ControlCondition = { arg: string } & (
  | { eq: string }
  | { neq: string }
  | { truthy: boolean }
)

type FieldControlBase = {
  name: string
  label: string
  description?: string
  /** The collapsible or tab the field sits under in the editor ("Design"). */
  group?: string
  if?: ControlCondition
}

type ControlSpec =
  | { control: 'select' | 'radio'; options: ControlOption[]; defaultValue?: string }
  | { control: 'boolean'; defaultValue?: boolean }
  | { control: 'text'; defaultValue?: string }
  /** Rich text, uploads, arrays and the like: the story's fixtures own these. */
  | { control: 'none' }

export type FieldControl = FieldControlBase & ControlSpec

export type BlockControls = { slug: string; label: string; fields: FieldControl[] }

export type BlockControlsManifest = Record<string, BlockControls>

type DataField = Exclude<FieldAffectingData, TabAsField>

type Placed = { field: DataField; group?: string }

const staticLabel = (label: unknown): string | undefined =>
  typeof label === 'string' ? label : undefined

/** Payload's own fallback label: `contentPosition` reads "Content Position". */
const toWords = (name: string) =>
  name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

/**
 * Flatten the presentational wrappers (rows, collapsibles, unnamed groups and
 * tabs) the way the editor does: a field keeps the nearest collapsible or tab
 * label as its group. A named tab nests data, so it is one opaque field.
 */
const place = (fields: Field[], group?: string): Placed[] =>
  fields.flatMap((field): Placed[] => {
    switch (field.type) {
      case 'row':
        return place(field.fields, group)
      case 'collapsible':
        return place(field.fields, staticLabel(field.label) ?? group)
      case 'group':
        return 'name' in field && field.name
          ? [{ field, group }]
          : place(field.fields, staticLabel(field.label) ?? group)
      case 'tabs':
        return field.tabs.flatMap((tab) =>
          'name' in tab && tab.name
            ? [{ field: { ...tab, type: 'group' } as DataField, group }]
            : place(tab.fields, staticLabel(tab.label) ?? group),
        )
      case 'ui':
        return []
      default:
        return [{ field, group }]
    }
  })

/** Hidden and virtual fields never reach a component, so they get no control. */
const isShown = (field: DataField) =>
  !field.admin?.hidden && !field.admin?.disabled && !('virtual' in field && field.virtual)

const toOptions = (options: readonly (string | { label: unknown; value: string })[]) =>
  options.map(
    (option): ControlOption =>
      typeof option === 'string'
        ? { label: option, value: option }
        : { label: staticLabel(option.label) ?? option.value, value: option.value },
  )

/** A literal default, or what a default function returns with no request. */
const staticDefault = (field: DataField): unknown => {
  const { defaultValue } = field
  if (typeof defaultValue !== 'function') return defaultValue
  try {
    return (defaultValue as (args: Record<string, never>) => unknown)({})
  } catch {
    return undefined
  }
}

/**
 * Every state a control can put a sibling in. A choice with no default also
 * starts empty, and a rule that treats empty like one option (the visual
 * slot: no choice means the upload) must not read as that option alone.
 */
const reachableValues = (field: DataField): unknown[] => {
  if (field.type === 'checkbox') return [true, false]
  if (field.type !== 'select' && field.type !== 'radio') return []
  const values = toOptions(field.options).map(({ value }) => value)
  return staticDefault(field) === undefined ? [undefined, ...values] : values
}

/**
 * Turn a Payload condition into a Storybook `if` by probing it: sweep each
 * sibling choice on top of the block's defaults and see which one flips the
 * result. One driver with a single true value is `eq`, with a single false
 * value `neq`, a checkbox `truthy`. Anything else (two drivers, a path-based
 * rule, a set of three allowed layouts) gets no `if` and stays visible.
 */
const probeCondition = (
  field: DataField,
  siblings: DataField[],
  base: Record<string, unknown>,
): ControlCondition | undefined => {
  const condition = field.admin?.condition as Condition | undefined
  if (!condition) return undefined
  const evaluate = (data: Record<string, unknown>) => {
    try {
      return Boolean(
        condition(data, data, {
          blockData: data,
          operation: 'update',
          path: [field.name],
          user: null,
        } as unknown as Parameters<Condition>[2]),
      )
    } catch {
      return true
    }
  }
  const drivers = siblings.flatMap((sibling) => {
    if (sibling === field) return []
    const values = reachableValues(sibling)
    const truthy = values.filter((value) => evaluate({ ...base, [sibling.name]: value }))
    return truthy.length > 0 && truthy.length < values.length ? [{ sibling, values, truthy }] : []
  })
  if (drivers.length !== 1) return undefined
  const [{ sibling, values, truthy }] = drivers
  if (sibling.type === 'checkbox') return { arg: sibling.name, truthy: truthy[0] === true }
  // Storybook's `if` names an option, so an empty choice cannot be the deciding one.
  if (truthy.length === 1 && typeof truthy[0] === 'string') {
    return { arg: sibling.name, eq: truthy[0] }
  }
  if (truthy.length === values.length - 1) {
    const falsy = values.find((value) => !truthy.includes(value))
    if (typeof falsy === 'string') return { arg: sibling.name, neq: falsy }
  }
  return undefined
}

const toControl = (field: DataField): ControlSpec => {
  const defaultValue = staticDefault(field)
  switch (field.type) {
    case 'select':
    case 'radio':
      if (field.type === 'select' && field.hasMany) return { control: 'none' }
      return {
        control: field.type,
        options: toOptions(field.options),
        defaultValue: typeof defaultValue === 'string' ? defaultValue : undefined,
      }
    case 'checkbox':
      return {
        control: 'boolean',
        defaultValue: typeof defaultValue === 'boolean' ? defaultValue : undefined,
      }
    case 'text':
    case 'textarea':
    case 'email':
      return {
        control: 'text',
        defaultValue: typeof defaultValue === 'string' ? defaultValue : undefined,
      }
    default:
      return { control: 'none' }
  }
}

export const blockControlsFor = (block: Block): BlockControls => {
  const placed = place(block.fields)
  const shown = placed.filter(({ field }) => isShown(field))
  const siblings = shown.map(({ field }) => field)
  // Every field, shown or not, seeds the probe: a rule may read a virtual gate.
  const base = Object.fromEntries(placed.map(({ field }) => [field.name, staticDefault(field)]))
  return {
    slug: block.slug,
    label: staticLabel(block.labels?.singular) ?? toWords(block.slug),
    fields: shown.map(({ field, group }) => ({
      name: field.name,
      label: staticLabel(field.label) ?? toWords(field.name),
      description: staticLabel(field.admin?.description),
      group,
      if: probeCondition(field, siblings, base),
      ...toControl(field),
    })),
  }
}

export const blockControlsManifest = (blocks: Block[]): BlockControlsManifest =>
  Object.fromEntries(blocks.map((block) => [block.slug, blockControlsFor(block)]))
