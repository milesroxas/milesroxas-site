#!/usr/bin/env node
/**
 * Benchmark grader for this skill (evals/benchmarks.md). Three layers per
 * output: the voice lint (check-voice.mjs), shape against the long-form study
 * (docs/article-voice-study.md), and Jev judgments for what code cannot read:
 * openings, endings, specificity, decisions, honesty, the AI split and whether
 * each claim is in the case's evidence. Jev returns probabilities; every
 * threshold and weight is below, in code, so changing policy never rewords a
 * question. Counting and arithmetic stay in code (jev-1.13 jaggedness notes).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk'
import { copyOf, mergeConfig, readFrontMatter, scoreResult, unitsOf } from './bench-core.mjs'
import { articleParts, lintField, sentencesOf, words } from './check-voice.mjs'

const HELP = `Usage:
  node --env-file=.env scripts/bench.mjs <output.md | run-dir>... [options]
  node --env-file=.env scripts/bench.mjs --self-test
  node scripts/bench.mjs --compare <before.json> <after.json>

An output is a Markdown file. Its case comes from front matter (case: 5) or a
file name that starts with the case id (5-build-story.md). The case's bench
settings in evals/evals.json give the kind, the evidence and the word range;
an output with no case can set kind and evidence (comma separated) in front
matter. Weights and thresholds come from evals/bench-config.json when it
exists (the review tool writes it), else from bench-core.mjs.

Options:
  --case <id>      Grade every file as this case.
  --out <file>     Write the JSON report here (default: <run-dir>/report.json).
  --no-jev         Lint and shape only, no TypeSafe calls.
  --model <id>     Jev version (default: jev-1.14.0).
  --format <f>     text (default) or json.
  --self-test      Grade evals/anchors and check each good anchor beats its bad ones.
  --compare a b    Per-case score deltas between two reports.
  -h, --help       Show this help.`

const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG_PATH = join(SKILL, 'evals/bench-config.json')
const DEFAULT_MODEL = 'jev-1.14.0'
const CONCURRENCY = 6
const MAX_CLAIMS = 60
const EVIDENCE_CHUNKS = 6

const loadConfig = () =>
  mergeConfig(existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) : {})

/** Lines the long-form study read in its source. Copy that repeats one borrowed a line. */
const BORROWED = [
  /quality without a name/i,
  /felt,? not seen/i,
  /deep blue moment/i,
  /the form is there/i,
  /go[- ]big[- ]or[- ]go[- ]home/i,
  /like brushing your teeth/i,
  /self[- ]driving saas/i,
  /earns its place in the product/i,
]

const AI_MENTION =
  /\b(?:AI|agents?|Claude|Codex|Cursor|Copilot|GPT|LLMs?|language models?|coding model|automat\w*)\b/

// The questions. Instructions name the state field they read; criteria carry the boundary cases.

const PIECE_QUESTIONS = {
  opens_on_work: noul(
    'Does `opening` begin inside the work or its problem, with a concrete tension, observation, scene or admission?',
    {
      true: 'The first sentences name a specific problem, a moment from the work, what people assume about it, or where the writer started, including a mistake or a doubt.',
      false:
        'The first sentences announce the piece, say the writer is excited or proud, greet the reader, ask a question and then answer it, define a term, or talk about the industry or the world in general.',
    },
  ),
  point_early: noul('Does `opening` tell the reader what the piece shows, argues or found?', {
    true: 'It states the main point, a result, or the question the rest answers, or lists what the sections will cover.',
    false: 'It only sets a scene or gives background, and the main point is not stated in it.',
  }),
  ending: choice('What does `ending` do?', {
    recap: 'Summarizes or lists what the earlier parts covered.',
    implication:
      'States what the work described adds up to: a principle, a consequence or a changed view, tied to that work.',
    engagement: 'Asks the reader to comment, share, follow, reply or say what they think.',
    moral: 'Makes a broad inspirational or industry-wide statement not tied to the specific work.',
    pointer:
      'Only points to where to see or try more, such as a link, a case study, a demo or the feature itself.',
  }),
  ending_before: choice('What does `before_ending` do?', {
    recap: 'Summarizes or lists what the earlier parts covered.',
    implication:
      'States what the work described adds up to: a principle, a consequence or a changed view, tied to that work.',
    engagement: 'Asks the reader to comment, share, follow, reply or say what they think.',
    moral: 'Makes a broad inspirational or industry-wide statement not tied to the specific work.',
    detail: 'Describes more of the work itself: what was built, how, or a result.',
  }),
}

const TITLE_QUESTION = {
  title: choice('What kind of title is `title`?', {
    teaser: 'Hides the subject to make the reader curious.',
    descriptive: 'Says plainly what the piece covers, such as "How I built X" or "Why X".',
    claim: 'States a position or a finding in a few words.',
    hype: 'Uses superlatives, excitement, "ultimate", all caps or a number for clicks.',
  }),
}

const UNIT_QUESTIONS = {
  specificity: score('How specific is `paragraph` to one piece of work?', [
    "General: it could appear unchanged in any designer's or developer's writing. No named project, decision, artifact or measured detail.",
    'Names the project or the topic but stays general about what happened or why.',
    'Gives a concrete detail of the work: a named decision, constraint, artifact or mechanism, a tool used for a stated reason, or a measured result.',
  ]),
  selling: score('How promotional is the language in `paragraph`?', [
    'Plain: states what happened or what the writer thinks, without praising the work, the tools or the writer.',
    'Some emphasis: a few adjectives or claims that praise the work, the tools or the result.',
    'Selling: superlatives, hype, excitement or announcement language about the work, the tools or the writer.',
  ]),
  decision: noul(
    'Does `paragraph` describe a choice between options, or say why one approach was used instead of another?',
    {
      true: 'It names an alternative that was considered, rejected or traded off, or gives the reason this approach was picked over another.',
      false:
        'It describes what exists or what happened, with no alternative and no reason for the choice.',
    },
  ),
  setback: noul(
    'Does `paragraph` say that something did not work, cost something, was harder than expected, was given up, or is not settled yet?',
    {
      true: 'It reports a failure, a mistake, a slower or costlier result, a limitation, or an open question about the work.',
      false: 'It reports only what works or what was achieved.',
    },
  ),
}

const AI_QUESTIONS = {
  ai_did_work: noul(
    'Does `paragraph` say that an AI tool or agent did part of the work of building, coding or writing the thing described?',
  ),
  ai_split: noul(
    'Does `paragraph` make clear which part of the work an AI tool or agent did and which part the writer did?',
    {
      true: 'It says what the AI or agent produced or decided, and what the writer designed, directed, reviewed, tested or fixed.',
      false:
        'It mentions AI or an agent without saying who did which part, or credits all of the work to one side.',
    },
  ),
}

// "me" in the copy against "him" in the evidence read as a contradiction until `writer` said who I is.
const GROUNDING_QUESTION = {
  grounding: choice('How does `evidence` relate to the facts stated in `claim`?', {
    supported:
      'The facts in `claim` (numbers, names, dates, roles, tools, outcomes, who did what) are stated in `evidence`, in the same or other words. `claim` is written by `writer`, so "I", "me" and "my" in it mean `writer`; "it", "this" and "that" in it refer to `sentence_before`.',
    contradicted:
      '`evidence` states something that conflicts with a fact in `claim`. A change of pronoun between "I" and "Miles" is not a conflict.',
    missing: '`claim` states a fact that `evidence` does not mention.',
    no_facts:
      '`claim` states no checkable fact: it is an opinion, a feeling, a reason, a plan or a general statement.',
  }),
}

/**
 * Asked only after the Choice says contradicted. "A Choice always picks
 * something" read as contradicted against evidence that supports it, so a
 * contradiction counts only when this literal second check agrees (TypeSafe's
 * verify-and-escalate pattern); otherwise it is listed as not in evidence.
 */
const CONFLICT_QUESTION = {
  conflict: noul(
    'Does `evidence` state a fact that cannot be true at the same time as a fact in `claim`?',
    {
      true: 'They give different numbers, names, dates, tools or outcomes for the same thing, or one says something happens and the other says it does not.',
      false:
        'They agree, `evidence` adds detail, or `evidence` is about something else. A change of pronoun between "I" and "Miles" is not a conflict.',
    },
  ),
}

// Parsing

const median = (values) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const round = (value, places = 2) => (value === null ? null : Number(value.toFixed(places)))

function shapeOf(text) {
  const { headings, prose } = articleParts(text)
  const sentenceLengths = prose.flatMap((p) => sentencesOf(p).map((s) => words(s).length))
  const paragraphLengths = prose.map((p) => words(p).length)
  const single = prose.filter((p) => sentencesOf(p).length <= 1).length
  const measures = {
    sentenceMedian: median(sentenceLengths),
    shortSentenceShare: sentenceLengths.length
      ? sentenceLengths.filter((n) => n <= 8).length / sentenceLengths.length
      : null,
    paragraphMedian: median(paragraphLengths),
    oneLineShare: prose.length ? single / prose.length : null,
  }
  return {
    measures: Object.fromEntries(Object.entries(measures).map(([k, v]) => [k, round(v)])),
    headings: headings.length,
    questionHeadings: headings.filter((h) => h.endsWith('?')).length,
    longHeadings: headings.filter((h) => words(h).length > 8).length,
  }
}

// Evidence

const STOP = new Set(
  'the a an and or of to in on for with is are was were be been it its this that as at by from my i we our you your not no so than then into over under about after before more most less only one two'.split(
    ' ',
  ),
)
const terms = (text) =>
  new Set(
    (text.toLowerCase().match(/[a-z0-9][a-z0-9.,%-]*/g) ?? [])
      .map((t) => t.replace(/[.,]+$/, ''))
      .filter((t) => t.length > 1 && !STOP.has(t)),
  )

function evidenceChunks(paths) {
  const chunks = []
  for (const path of paths) {
    const raw = readFileSync(resolve(SKILL, path), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
    for (const block of raw.split(/\n\s*\n|\n(?=- )/)) {
      const text = block.replace(/^#+\s.*$/gm, '').trim()
      if (words(text).length >= 4) chunks.push(text.replace(/^- /, ''))
    }
  }
  return chunks
}

/** The chunks that share the most terms with the claim: Jev reads best with little unrelated state. */
function nearestEvidence(claim, chunks) {
  const wanted = terms(claim)
  return chunks
    .map((chunk) => {
      const have = terms(chunk)
      let shared = 0
      for (const t of wanted) if (have.has(t)) shared += /\d/.test(t) ? 3 : 1
      return { chunk, shared }
    })
    .sort((a, b) => b.shared - a.shared)
    .slice(0, EVIDENCE_CHUNKS)
    .map(({ chunk }) => chunk)
}

/** Status and scope words: "the judge is live for every visitor" names no number and no one. */
const STATUS_WORDS =
  /\b(?:live|launched|shipped|released|switched (?:on|off)|in production|every|all|always|never|only|deleted|kept|team|users?|customers?|clients?|recruiters?)\b/i

/**
 * Sentences that state something checkable: a number, a name mid-sentence, or
 * what I or we did. A [check: ...] marker flags its own sentence and the one
 * before it, which is where the skill puts it, so neither counts as a claim.
 */
function claimsOf(units) {
  const found = []
  // A marker can hold its own "?", so it is collapsed before sentences are split.
  const plain = (text) => text.replace(/\*\*|__|`/g, '').replace(/\[check:[^\]]*\]/gi, '[check]')
  for (const unit of units)
    for (const item of unit.items) {
      const sentences = sentencesOf(plain(item))
      sentences.forEach((sentence, i) => {
        const flagged = (s) => s?.includes('[check]')
        if (flagged(sentence) || flagged(sentences[i + 1])) return
        const named = /\s[A-Z][\w&.-]+/.test(sentence.replace(/^\W*\w+/, ''))
        const acted =
          /\b(?:I|we|We)\s+(?:\w+ly\s+)?\w+(?:ed|t|lt|de|ote|an|ew|ook|ound|ent|ept|ave)\b/.test(
            sentence,
          )
        const status = STATUS_WORDS.test(sentence)
        if (/\d/.test(sentence) || named || acted || status)
          found.push({ claim: sentence, before: sentences[i - 1] ?? null })
      })
    }
  return found.slice(0, MAX_CLAIMS)
}

// Jev

let client = null
let inputTokens = 0
let modelSeen = null

async function ask(model, state, questions) {
  client ??= new TypeSafeClient({ defaultModel: model, timeout: 30_000, logLevel: 'error' })
  const result = await client.systemOne({ state, questions })
  inputTokens += result.usage?.input_tokens ?? 0
  modelSeen = result.model
  return result.answers
}

async function pool(items, run) {
  const results = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await run(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker))
  return results
}

/** Jev's raw answers for one output. Thresholds are applied later, in bench-core.mjs. */
async function judge({ text, units, title, evidence, model, aiBuilt }) {
  const prose = units.filter((u) => !u.list)
  const opening = prose
    .slice(0, 2)
    .map((u) => u.text)
    .join('\n\n')
  const ending = prose.at(-1)?.text ?? ''
  const beforeEnding = prose.length > 2 ? prose.at(-2).text : ''

  const pieceState = { opening, ending, ...(beforeEnding ? { before_ending: beforeEnding } : {}) }
  const pieceQuestions = { ...PIECE_QUESTIONS }
  if (!beforeEnding) delete pieceQuestions.ending_before
  const titleAsk = title ? ask(model, { title }, TITLE_QUESTION) : Promise.resolve(null)

  const [piece, titleAnswer, unitAnswers] = await Promise.all([
    ask(model, pieceState, pieceQuestions),
    titleAsk,
    pool(units, (unit) =>
      ask(
        model,
        { paragraph: unit.text },
        AI_MENTION.test(unit.text) ? { ...UNIT_QUESTIONS, ...AI_QUESTIONS } : UNIT_QUESTIONS,
      ),
    ),
  ])

  const perUnit = units.map((unit, i) => ({
    text: unit.text,
    list: unit.list,
    specificity: round(unitAnswers[i].specificity.score / 2),
    selling: round(unitAnswers[i].selling.score / 2),
    decision: round(unitAnswers[i].decision.noul),
    setback: round(unitAnswers[i].setback.noul),
    aiDidWork: unitAnswers[i].ai_did_work ? round(unitAnswers[i].ai_did_work.noul) : null,
    aiSplit: unitAnswers[i].ai_split ? round(unitAnswers[i].ai_split.noul) : null,
  }))
  let grounding = null
  if (evidence.length) {
    const claims = claimsOf(units)
    // "it picked the right card in all 57 turns" read as contradicted until the
    // sentence before it came along to say what "it" was.
    const verdicts = await pool(claims, async ({ claim, before }) => {
      const state = {
        writer: 'Miles Roxas',
        ...(before ? { sentence_before: before } : {}),
        claim,
        evidence: nearestEvidence(`${before ?? ''} ${claim}`, evidence),
      }
      const answer = await ask(model, state, GROUNDING_QUESTION)
      const verdict = answer.grounding.choice
      const conflict =
        verdict === 'contradicted'
          ? round((await ask(model, state, CONFLICT_QUESTION)).conflict.noul)
          : null
      return {
        claim,
        before,
        verdict,
        conflict,
        confidence: round(answer.grounding.confidence),
        evidence: state.evidence,
      }
    })
    grounding = { verdicts }
  }

  return {
    opensOnWork: round(piece.opens_on_work.noul),
    pointEarly: round(piece.point_early.noul),
    ending: piece.ending.choice,
    endingBefore: piece.ending_before?.choice ?? null,
    endingProbabilities: piece.ending.probabilities,
    title: titleAnswer ? titleAnswer.title.choice : null,
    aiBuilt: Boolean(aiBuilt),
    aiMentioned: AI_MENTION.test(text),
    grounding,
    perUnit,
  }
}

// Cases and files

function loadCases() {
  const { evals } = JSON.parse(readFileSync(join(SKILL, 'evals/evals.json'), 'utf8'))
  return new Map(evals.map((c) => [String(c.id), c]))
}

function outputFiles(paths) {
  return paths.flatMap((path) => {
    const full = resolve(path)
    if (!statSync(full).isDirectory()) return [full]
    return readdirSync(full)
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .sort()
      .map((name) => join(full, name))
  })
}

async function gradeFile(file, { cases, caseId, useJev, model, config }) {
  const source = readFileSync(file, 'utf8')
  const { meta } = readFrontMatter(source)
  const text = copyOf(source)
  const id = caseId ?? meta.case ?? /^(?:case-)?(\d+)[-_.]/.exec(basename(file))?.[1] ?? null
  const testCase = id ? cases.get(String(id)) : null
  const bench = testCase?.bench ?? {
    kind: meta.kind,
    evidence: meta.evidence ? meta.evidence.split(/,\s*/) : [],
  }
  const kind = bench.kind ?? 'article'
  const title = /^#\s+(.+)$/m.exec(text)?.[1]?.trim() ?? null
  const units = unitsOf(text)
  const count = words(units.map((u) => u.text).join(' ')).length
  const lint = lintField({ path: basename(file), kind, text }, 'chat')
  const shape = kind === 'article' ? shapeOf(text) : null
  const evidence = evidenceChunks(bench.evidence ?? [])
  const runJudge = useJev && bench.judge !== false && units.length > 0
  const jev = runJudge
    ? await judge({ text, units, title, evidence, model, aiBuilt: bench.aiBuilt })
    : null
  const errors = lint.filter((f) => f.severity === 'error')
  const result = {
    file: basename(file),
    case: id && /^\d+$/.test(String(id)) ? Number(id) : (id ?? null),
    label: meta.label ?? null,
    tests: meta.tests ? meta.tests.split(/,\s*/) : [],
    kind,
    words: count,
    range: bench.words ?? null,
    hasEvidence: evidence.length > 0,
    borrowed: BORROWED.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source),
    lint: {
      errors: errors.length,
      errorExcerpts: errors.map((f) => `${f.rule}: ${f.excerpt ?? f.message}`),
      warnings: lint.filter((f) => f.severity === 'warning').map((f) => f.rule),
    },
    shape,
    jev,
  }
  const { scores, flags } = scoreResult(result, config)
  return { ...result, scores, flags }
}

// Reports

const pad = (value, width) => String(value ?? '-').padStart(width)

function printTable(results) {
  const layers = ['lint', 'shape', 'structure', 'substance', 'tone', 'grounding', 'total']
  console.log(
    `\n${'file'.padEnd(34)}${'case'.padStart(5)}${layers.map((l) => pad(l, 10)).join('')}`,
  )
  for (const r of results)
    console.log(
      `${r.file.slice(0, 33).padEnd(34)}${pad(r.case, 5)}${layers.map((l) => pad(r.scores[l], 10)).join('')}`,
    )
  for (const r of results) {
    if (!r.flags.length) continue
    console.log(`\n${r.file}`)
    for (const flag of r.flags) console.log(`  - ${flag}`)
  }
}

function selfTest(results) {
  let failures = 0
  const goods = new Map(results.filter((r) => r.label === 'good').map((r) => [r.case, r]))
  console.log('\nSelf-test: each bad anchor must score below its good anchor on what it tests.')
  for (const bad of results.filter((r) => r.label === 'bad')) {
    const good = goods.get(bad.case)
    if (!good) continue
    for (const layer of bad.tests) {
      const ok = (good.scores[layer] ?? -1) > (bad.scores[layer] ?? -1)
      if (!ok) failures += 1
      console.log(
        `  ${ok ? 'ok  ' : 'FAIL'} ${bad.file.padEnd(22)} ${layer.padEnd(10)} good ${pad(good.scores[layer], 4)}  bad ${pad(bad.scores[layer], 4)}`,
      )
    }
  }
  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.')
  return failures
}

function compare(beforePath, afterPath) {
  const load = (path) => JSON.parse(readFileSync(path, 'utf8')).results
  const before = new Map(load(beforePath).map((r) => [r.case ?? r.file, r]))
  const layers = ['lint', 'shape', 'structure', 'substance', 'tone', 'grounding', 'total']
  console.log(`\n${'case'.padEnd(8)}${layers.map((l) => pad(l, 10)).join('')}`)
  for (const r of load(afterPath)) {
    const b = before.get(r.case ?? r.file)
    if (!b) continue
    const cells = layers.map((l) => {
      if (r.scores[l] == null || b.scores[l] == null) return pad('-', 10)
      const delta = r.scores[l] - b.scores[l]
      return pad(`${delta > 0 ? '+' : ''}${delta}`, 10)
    })
    console.log(`${String(r.case ?? r.file).padEnd(8)}${cells.join('')}`)
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      case: { type: 'string' },
      out: { type: 'string' },
      'no-jev': { type: 'boolean' },
      model: { type: 'string', default: DEFAULT_MODEL },
      format: { type: 'string', default: 'text' },
      'self-test': { type: 'boolean' },
      compare: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(HELP)
    return 0
  }
  if (values.compare) {
    if (positionals.length !== 2) throw new Error('--compare takes two report files.')
    compare(...positionals)
    return 0
  }
  const paths = values['self-test'] ? [join(SKILL, 'evals/anchors')] : positionals
  if (!paths.length) {
    console.log(HELP)
    return 2
  }
  const useJev = !values['no-jev']
  if (useJev && !process.env.TYPESAFE_API_KEY) {
    console.error('TYPESAFE_API_KEY is not set. Run with --env-file=.env, or pass --no-jev.')
    return 2
  }

  const cases = loadCases()
  const config = loadConfig()
  const files = outputFiles(paths)
  const startedAt = performance.now()
  const results = []
  for (const file of files)
    results.push(
      await gradeFile(file, { cases, caseId: values.case, useJev, model: values.model, config }),
    )

  const report = {
    createdAt: new Date().toISOString(),
    model: useJev ? (modelSeen ?? values.model) : null,
    inputTokens,
    seconds: Math.round((performance.now() - startedAt) / 100) / 10,
    config,
    results,
  }
  const firstDir = paths.find((p) => existsSync(p) && statSync(p).isDirectory())
  const out =
    values.out ?? (firstDir && !values['self-test'] ? join(firstDir, 'report.json') : null)
  if (out) writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`)

  if (values.format === 'json') console.log(JSON.stringify(report, null, 2))
  else {
    printTable(results)
    console.log(
      `\n${results.length} output(s), ${report.model ?? 'no Jev'}, ${inputTokens.toLocaleString()} input tokens, ${report.seconds} s${out ? `, report: ${out}` : ''}`,
    )
  }
  return values['self-test'] ? (selfTest(results) ? 1 : 0) : 0
}

main().then(
  (code) => {
    process.exitCode = code
  },
  (error) => {
    console.error(error.message)
    process.exitCode = 2
  },
)
