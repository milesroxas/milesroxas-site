/**
 * The benchmark's scoring, shared by scripts/bench.mjs and the review tool
 * (scripts/review.mjs). Raw answers in (lint findings, shape measures, Jev's
 * probabilities and verdicts), layer scores and flags out. Pure and free of
 * Node imports, so the review tool rescores every stored output as a slider
 * moves, without asking Jev again. evals/bench-config.json overrides the
 * defaults; the review tool's Save writes it.
 */

export const LAYERS = ['lint', 'shape', 'structure', 'substance', 'tone', 'grounding']

/** Layers each kind is scored on. A layer that does not apply is left out and the rest rescale to 100. */
export const KIND_LAYERS = {
  article: LAYERS,
  linkedinPost: ['lint', 'structure', 'substance', 'tone', 'grounding'],
  coverLetter: ['lint', 'structure', 'substance', 'tone', 'grounding'],
  youtubeScript: ['lint', 'structure', 'substance', 'tone', 'grounding'],
}
const DEFAULT_LAYERS = ['lint', 'substance', 'tone', 'grounding']

export const DEFAULT_CONFIG = {
  /** Points per layer. */
  weights: { lint: 15, shape: 15, structure: 20, substance: 25, tone: 10, grounding: 15 },
  /** A Noul at or above this reads as yes. */
  yes: 0.5,
  /** A grounding verdict below this confidence is listed as unsure. */
  sure: 0.6,
  /** What one lint warning costs the lint layer. Any error scores it 0. */
  warningCost: 0.2,
  /** Points inside structure; title counts only when the piece has one. */
  structure: { opening: 5, point: 5, ending: 6, title: 4, pointerCredit: 0.5 },
  /** Points inside substance; aiSplit counts only where AI did part of the work. */
  substance: { specificity: 13, decision: 5, setback: 4, aiSplit: 3 },
  /** Grounding is (supported + prior) / (factual claims + 1). */
  groundingPrior: 0.9,
  /** Any contradiction caps grounding here. */
  contradictionCap: 0.5,
  /** Bands from docs/article-voice-study.md; each band met is a share of shape. */
  bands: {
    sentenceMedian: [12, 22],
    shortSentenceShare: [0.08, 0.3],
    paragraphMedian: [25, 75],
    oneLineShare: [0, 0.2],
  },
  /** Review tool only: a layer score at or above this agrees with a "good" mark. */
  agreeAt: 70,
}

/** Where each layer is fixed when it is low: the skill section, or the benchmark knob when the judge is wrong. */
export const LAYER_HOME = {
  lint: {
    skill: 'The rule and its reason in SKILL.md, or the example pair in references/examples.md',
    bench: 'scripts/check-voice.mjs: the rule, its severity, or warningCost',
  },
  shape: {
    skill: 'references/articles.md: Paragraphs and sentences; Sections and headings',
    bench: 'bands, or the shape weight',
  },
  structure: {
    skill: 'references/articles.md: Open; Close; Titles',
    bench:
      'The opens_on_work, point_early, ending and title questions in bench.mjs; structure points',
  },
  substance: {
    skill: 'references/articles.md: Pick the shape; Evidence; Honesty',
    bench: 'The specificity, decision, setback and ai_split questions; substance points; yes',
  },
  tone: {
    skill: 'references/articles.md: The stance; the voice section of the brand guide',
    bench: 'The selling question in bench.mjs, or the tone weight',
  },
  grounding: {
    skill: 'SKILL.md: The claim ledger',
    bench:
      'The evidence pack in evals/files; the grounding and conflict questions; groundingPrior, contradictionCap',
  },
}

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

/** Defaults with a saved config laid over them, one level of nesting deep. */
export function mergeConfig(saved = {}) {
  const merged = structuredClone(DEFAULT_CONFIG)
  for (const [key, value] of Object.entries(saved ?? {})) {
    if (!(key in merged)) continue
    merged[key] = isObject(merged[key]) && isObject(value) ? { ...merged[key], ...value } : value
  }
  return merged
}

export function readFrontMatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw)
  if (!match) return { meta: {}, text: raw.trim() }
  const meta = {}
  for (const line of match[1].split('\n')) {
    const field = /^(\w+):\s*(.*)$/.exec(line)
    if (field) meta[field[1]] = field[2].trim()
  }
  return { meta, text: raw.slice(match[0].length).trim() }
}

/** The copy a piece is judged on: front matter and HTML comments removed. */
export const copyOf = (raw) =>
  readFrontMatter(raw)
    .text.replace(/<!--[\s\S]*?-->\s*/g, '')
    .trim()

/** Prose paragraphs and list blocks, in order; headings, figures and code are left out. */
export function unitsOf(text) {
  const units = []
  const blocks = text
    .replace(/```[\s\S]*?```/g, '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
  for (const block of blocks) {
    if (/^#{1,6}\s/.test(block) || /^\[(?:figure|caption)\]/i.test(block)) continue
    if (/^<!--/.test(block) || /^!\[/.test(block)) continue
    const lines = block.split('\n')
    const isList = lines.every((line) => /^\s*(?:[-*+]|\d+[.)])\s/.test(line))
    const items = isList
      ? lines.map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ''))
      : [block.replace(/\n/g, ' ')]
    units.push({ text: items.join(' ').replace(/^>\s?/, ''), items, list: isList })
  }
  return units
}

const mean = (values) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null
const inBand = (value, [low, high]) => value != null && value >= low && value <= high
const weighted = (parts) => {
  const weight = parts.reduce((sum, [, w]) => sum + w, 0)
  return weight ? parts.reduce((sum, [v, w]) => sum + v * w, 0) / weight : null
}

export function shapeScore(shape, config) {
  const checks = Object.entries(config.bands).map(([key, band]) =>
    inBand(shape.measures[key], band),
  )
  checks.push(shape.questionHeadings === 0 && shape.longHeadings === 0)
  return checks.filter(Boolean).length / checks.length
}

/** Counts and verdicts that depend on the thresholds, from Jev's raw answers. */
export function deriveJev(jev, config) {
  if (!jev) return null
  const { yes, sure } = config
  const units = jev.perUnit
  const aiUnits = units.filter((u) => u.aiDidWork != null && u.aiDidWork >= yes)
  const ending =
    jev.ending === 'pointer' && jev.endingBefore === 'implication' ? 'implication' : jev.ending
  const verdicts = (jev.grounding?.verdicts ?? []).map((v) => ({
    ...v,
    final:
      v.verdict === 'contradicted' && v.conflict != null && v.conflict < yes
        ? 'missing'
        : v.verdict,
  }))
  const factual = verdicts.filter((v) => v.final !== 'no_facts')
  const supported = factual.filter((v) => v.final === 'supported').length
  return {
    ending,
    opensOnWork: jev.opensOnWork >= yes,
    pointEarly: jev.pointEarly >= yes,
    title: jev.title,
    specificity: mean(units.map((u) => u.specificity)),
    selling: mean(units.map((u) => u.selling)),
    decisions: units.filter((u) => u.decision >= yes).length,
    setbacks: units.filter((u) => u.setback >= yes).length,
    aiWork: aiUnits.length,
    aiSplitShare: aiUnits.length
      ? aiUnits.filter((u) => u.aiSplit >= yes).length / aiUnits.length
      : null,
    aiUnmentioned: Boolean(jev.aiBuilt) && aiUnits.length === 0 && !jev.aiMentioned,
    graded: Boolean(jev.grounding),
    verdicts,
    factual: factual.length,
    supported,
    contradicted: factual.filter((v) => v.final === 'contradicted'),
    missing: factual.filter((v) => v.final === 'missing'),
    unsure: factual.filter((v) => v.confidence < sure),
    share: (supported + config.groundingPrior) / (factual.length + 1),
  }
}

function flagsOf(result, d) {
  const flags = []
  const range = result.range
  if (range && (result.words < range[0] || result.words > range[1]))
    flags.push(`length: ${result.words} words, case asks ${range[0]} to ${range[1]}`)
  for (const pattern of result.borrowed ?? []) flags.push(`borrowed line: ${pattern}`)
  for (const excerpt of result.lint?.errorExcerpts ?? []) flags.push(`lint error ${excerpt}`)
  if (!d) return flags
  if (!d.opensOnWork) flags.push('opening is not inside the work')
  if (!d.pointEarly) flags.push('point not stated in the first two paragraphs')
  if (d.ending !== 'implication') flags.push(`ending reads as ${d.ending}`)
  if (d.decisions === 0) flags.push('no decision against an alternative')
  if (d.setbacks === 0) flags.push('no cost, failure or open question')
  if (d.aiUnmentioned) flags.push('evidence says AI helped build it; the copy does not say so')
  for (const v of d.contradicted) flags.push(`CONTRADICTS evidence: "${v.claim}"`)
  for (const v of d.missing) flags.push(`not in evidence: "${v.claim}"`)
  return flags
}

/** Layer scores (0 to 100), the total, the derived counts and the flags for one graded output. */
export function scoreResult(result, config) {
  const c = config
  const layers = KIND_LAYERS[result.kind] ?? DEFAULT_LAYERS
  const d = deriveJev(result.jev, c)
  const raw = {}
  if (layers.includes('lint') && result.lint)
    raw.lint = result.lint.errors ? 0 : Math.max(0, 1 - result.lint.warnings.length * c.warningCost)
  if (layers.includes('shape') && result.shape) raw.shape = shapeScore(result.shape, c)
  if (d) {
    if (layers.includes('structure')) {
      const parts = [
        [d.opensOnWork ? 1 : 0, c.structure.opening],
        [d.pointEarly ? 1 : 0, c.structure.point],
        [{ implication: 1, pointer: c.structure.pointerCredit }[d.ending] ?? 0, c.structure.ending],
      ]
      if (d.title)
        parts.push([['descriptive', 'claim'].includes(d.title) ? 1 : 0, c.structure.title])
      raw.structure = weighted(parts)
    }
    if (layers.includes('substance')) {
      const parts = [
        [d.specificity ?? 0, c.substance.specificity],
        [d.decisions > 0 ? 1 : 0, c.substance.decision],
        [d.setbacks > 0 ? 1 : 0, c.substance.setback],
      ]
      if (d.aiSplitShare !== null) parts.push([d.aiSplitShare, c.substance.aiSplit])
      if (d.aiUnmentioned) parts.push([0, c.substance.aiSplit])
      raw.substance = weighted(parts)
    }
    if (layers.includes('tone')) raw.tone = 1 - (d.selling ?? 0)
    if (layers.includes('grounding') && result.hasEvidence && d.graded && d.factual > 0)
      raw.grounding = d.contradicted.length ? Math.min(d.share, c.contradictionCap) : d.share
  }
  const present = Object.entries(raw).filter(([layer, v]) => v != null && c.weights[layer] > 0)
  const total = weighted(present.map(([layer, v]) => [v, c.weights[layer]]))
  const scores = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.round(v * 100)]))
  scores.total = total === null ? null : Math.round(total * 100)
  return { scores, derived: d, flags: flagsOf(result, d) }
}
