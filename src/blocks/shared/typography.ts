/**
 * The kicker above a heading: the media and split block family (full-media,
 * split-content) and the Section heading (Standard) block. Stated once so the
 * same CMS `eyebrow` field never renders in two different treatments.
 *
 * Style only: the gap to the heading belongs to the `text-stack` utility (see
 * `globals.css`), so a call site sets this class and no margin of its own.
 *
 * The legacy Story section blocks (lab, case-study) and Lab facts use a
 * second, larger uppercase-tracked kicker. That is a deliberate second voice,
 * not drift: keep the two apart rather than folding them together here.
 */
export const eyebrowClassName = 'font-mono text-xs/none font-medium'

export type TextSize = 'small' | 'large'

// One ~1.2 ladder for every block. Each role picks a rung; Large moves all roles up one.
const TYPE_LADDER = [
  'text-base',
  'text-lg',
  'text-lead',
  'text-heading-3',
  'text-heading-2',
  'text-heading-1',
] as const

const ROLE_RUNG = {
  body: 0,
  /** Opener deck, or an item title in a run (question, insight). */
  lead: 1,
  statement: 2,
  heading: 3,
  /** Section opener h2 (Standard, Offset). */
  title: 4,
} as const

type TextRole = keyof typeof ROLE_RUNG
export type TypeScale = Record<TextRole, (typeof TYPE_LADDER)[number]>

const scaleAt = (shift: 0 | 1) =>
  Object.fromEntries(
    Object.entries(ROLE_RUNG).map(([role, rung]) => [role, TYPE_LADDER[rung + shift]]),
  ) as TypeScale

const TYPE_SCALE: Record<TextSize, TypeScale> = { small: scaleAt(0), large: scaleAt(1) }

export const typeScale = (size: TextSize | null | undefined): TypeScale =>
  TYPE_SCALE[size ?? 'small']

// Long-form reading column: off the ladder, capped at 20px (lead is too big for a passage).
export const proseBodyClassNames: Record<TextSize, string> = {
  small: 'text-base xl:text-lg',
  large: 'text-lg xl:text-xl',
}

/**
 * Prose type scale: a heading inside the reading column, measured against the
 * copy it opens (Story beats and Rich text render Tailwind Typography's
 * `prose` base: 16px on a 28px line), not against the page type scale:
 * `text-heading-1` beside 16px body is a page title standing inside an
 * article, and the two read as separate documents rather than one passage.
 *
 * So the levels are plain Tailwind sizes, a 1.25 ladder over that body:
 * 30 / 24 / 20px. Their default line heights (2.25rem, 2rem, 1.75rem) sit on
 * or just above the body's 28px line, so the passage keeps one rhythm, and
 * the two larger steps take `tracking-tight` because the text-box-trimmed
 * cluster otherwise reads loose at those sizes. At h4 the step over the body
 * is only 4px, so weight carries the hierarchy instead, the way the in-prose
 * headings do (`prose-h4:font-medium` in components/RichText).
 *
 * Levels are not restated in `em`: the gaps around the heading already are
 * (`text-stack`), so the whole cluster tracks whichever level the editor
 * picks. The level select is `proseHeadingLevelField` (`./fields.ts`).
 */
export const proseHeadingClassNames = {
  h2: 'text-3xl tracking-tight',
  h3: 'text-2xl tracking-tight',
  h4: 'text-xl font-medium',
} as const

export type ProseHeadingLevel = keyof typeof proseHeadingClassNames
