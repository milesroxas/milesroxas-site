import { choice, noul } from '@typesafe-ai/sdk'
import type { OutlineRow } from './blocks'
import type { Jev } from './jev'

/**
 * The judgment behind `locateBlock`: which block of a document an editing
 * instruction is about. Pure over an outline, so the tests can run it on a
 * document read any way. Ported from sas-site, where it scored 10 of 10 on
 * its eval (`scripts/mcp-locate-eval.ts` there) with no tuning.
 *
 * The shape is TypeSafe's line-by-line search cookbook. Code tags every
 * block with a short id and joins the outline into one state; a Choice over
 * the tags answers where, and a Noul in the same request answers whether any
 * block fits at all, because Choice probabilities sum to one and always
 * crown something. Jev reads the outline (type, name, nesting, the first
 * characters of copy), never the stored data: a 40-block page is about 2K
 * tokens of state, and jev-1.13 loses accuracy on state full of detail the
 * question does not need.
 *
 * Code owns the verdict. The thresholds are here and nowhere else.
 */

/** A Choice takes up to 255 options. No page on the site is near it; a longer one is cut and says so. */
export const LOCATE_MAX_BLOCKS = 255

export const LOCATE_CANDIDATES = 5

/**
 * `found` needs both: the Noul says a block fits, and the Choice is not split
 * between blocks. sas-site's starting values; read them against real
 * instructions on this site before moving them.
 */
export const LOCATE_THRESHOLDS = {
  /** `exists` at or above which some block fits the instruction. */
  exists: 0.5,
  /** `where` confidence at or above which the top block is the one. */
  confidence: 0.5,
} as const

export type LocateVerdict = 'found' | 'unsure' | 'none'

export type LocateCandidate = OutlineRow & { probability: number }

export type LocateResult = {
  verdict: LocateVerdict
  /** The Noul: probability that some block of the document is the one the instruction means. */
  exists: number
  /** The Choice's confidence in its top block. */
  confidence: number
  /** The most likely blocks, best first. */
  candidates: LocateCandidate[]
  /** Blocks past `LOCATE_MAX_BLOCKS` that were not offered, 0 when every block was. */
  omitted: number
  model: string
  inputTokens: number
  ms: number
}

const tag = (index: number): string => `B${String(index).padStart(2, '0')}`

/** One line per block, the way the model reads it: tag, type, name, nesting, copy. */
export function outlineState(rows: OutlineRow[]): string {
  const depthOf = (path: string) => path.split('.').length
  const parentTag = new Map<string, string>()
  return rows
    .map((row, index) => {
      const own = tag(index)
      parentTag.set(row.path, own)
      const parentPath = row.path.split('.').slice(0, -2).join('.')
      const parent = depthOf(row.path) > 2 ? parentTag.get(parentPath) : undefined
      const parts = [
        `${own}|`,
        row.blockType,
        row.blockName ? `"${row.blockName}"` : '',
        parent ? `(inside ${parent})` : '',
        row.children ? `[${row.children} blocks inside]` : '',
        row.text ? `: ${row.text}` : '',
      ]
      return parts.filter(Boolean).join(' ')
    })
    .join('\n')
}

export function locateQuestions(instruction: string) {
  return (rows: OutlineRow[]) => ({
    where: choice(
      `Which block of the document is the one this editing instruction is about: "${instruction}"? Each line of the document is one block: its tag, its type, its name when it has one, the block it sits inside, and the start of its copy. An ordinal in the instruction ("the first rich text block") counts blocks of that type in document order.`,
      Object.fromEntries(rows.map((_, index) => [tag(index), null])) as Record<string, null>,
    ),
    exists: noul(
      `Is there a block in the document that this editing instruction is about: "${instruction}"?`,
      {
        true: 'A block of the document is the one the instruction names or describes, by its type, its name, its position, or the copy it holds.',
        false:
          'No block of the document matches: the instruction names a kind of block, a name, or copy that is not in the document.',
      },
    ),
  })
}

/** Which of `rows` the instruction means. Throws on a Jev failure; the tool turns that into its error text. */
export async function locateInOutline(
  jev: Jev,
  rows: OutlineRow[],
  instruction: string,
): Promise<LocateResult> {
  const offered = rows.slice(0, LOCATE_MAX_BLOCKS)
  const startedAt = performance.now()
  const result = await jev.systemOne({
    state: { document: outlineState(offered) },
    questions: locateQuestions(instruction)(offered),
  })
  const { where, exists } = result.answers
  const probabilities = where.probabilities as Record<string, number>
  const candidates = offered
    .map((row, index) => ({ ...row, probability: probabilities[tag(index)] ?? 0 }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, LOCATE_CANDIDATES)
  const verdict: LocateVerdict =
    exists.noul < LOCATE_THRESHOLDS.exists
      ? 'none'
      : where.confidence >= LOCATE_THRESHOLDS.confidence
        ? 'found'
        : 'unsure'
  return {
    verdict,
    exists: exists.noul,
    confidence: where.confidence,
    candidates,
    omitted: rows.length - offered.length,
    model: result.model,
    inputTokens: result.usage.input_tokens,
    ms: Math.round(performance.now() - startedAt),
  }
}
