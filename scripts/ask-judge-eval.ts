/**
 * Ask judge eval: the tuning tool for Jev's questions and thresholds
 * (src/features/ask/judge.ts). No server and no visitor: it calls the judge
 * directly and prints the probabilities beside what the fixture expects
 * (scripts/ask-cases.ts), so a threshold is chosen from numbers and a
 * criterion is reworded from a miss. Ported from sas-site.
 *
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts              # turn judgments
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts --passages   # + passage checks
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts --from-db    # replay stored questions
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts --journey [--passages]   # the page a question is asked on
 *
 * `--passages` and `--from-db` boot Payload, as scripts/backfill-ask-index.ts
 * does, and need an indexed corpus (or stored `ask-questions` rows) in the
 * database `POSTGRES_URL` names: run them against the local Docker database,
 * never production. Needs TYPESAFE_API_KEY; `--passages` also needs
 * OPENAI_API_KEY for the query embedding. In a worktree without its own .env,
 * call the binary directly: `./node_modules/.bin/tsx --env-file=<path to .env> ...`
 * (the pnpm shim swallows an absolute `--env-file`).
 */

import type { Payload } from 'payload'
import type { NearestChunk } from '@/features/ask/embeddings'
import {
  ASK_JUDGE_KEY_VAR,
  ASK_JUDGE_THRESHOLDS,
  type AskPassageJudgment,
  type AskTurnJudgment,
  dependsOnPrevious,
  judgePassages,
  judgeTurn,
  leansOnPage,
  routeCardReason,
  routePassage,
  routeTurn,
} from '@/features/ask/judge'
import { ASK_CASES, ASK_DEPENDS_EXPECTATIONS, ASK_JOURNEY_CASES, type AskCase } from './ask-cases'

/** A tuning run must not be colored by the network, so it waits far longer than a visitor would. */
const TIMEOUT_MS = 10_000

if (!process.env[ASK_JUDGE_KEY_VAR]) {
  console.error(`${ASK_JUDGE_KEY_VAR} is not set. Aborting.`)
  process.exit(1)
}

const args = process.argv.slice(2)
const pct = (value: number | null | undefined) =>
  value == null ? '  - ' : value.toFixed(2).padStart(4)

function describe(judgment: AskTurnJudgment | null): string {
  if (!judgment) return 'judge returned null'
  return [
    `${judgment.request.padEnd(12)} conf ${pct(judgment.confidence)}`,
    `own ${pct(judgment.ownProject)}  general ${pct(judgment.generalQuestion)}  names ${pct(judgment.namesWork)}`,
    `depends ${pct(judgment.dependsOnPrevious)}  open ${pct(judgment.openReference)}`,
    `${judgment.ms} ms`,
  ].join('  ')
}

/**
 * The card the turn judgment alone leads to. An `evidence` route without a
 * reason can still end in `no_answer` once passages are checked, so a case
 * that expects `no_answer` passes here on an `evidence` route.
 */
function turnAgrees(testCase: AskCase, judgment: AskTurnJudgment | null): boolean {
  const route = routeTurn(judgment, {
    isFollowUp: testCase.turns.length > 1,
    handoffState: 'none',
  })
  if (route.kind === 'fallback') return false
  const { handoff, text } = testCase.expect
  // Contact details are found by a regex before Jev is asked.
  if (handoff === 'contact_details') return true
  if (handoff === 'no_answer') return route.kind === 'evidence' && route.reason === null
  if (routeCardReason(route) !== handoff) return false
  if (text === false) return route.kind === 'card'
  if (text === true) return route.kind !== 'card'
  return true
}

async function evalTurns(onKnownPage = false): Promise<Map<string, AskTurnJudgment | null>> {
  console.log('\nTurn judgments (thresholds:', JSON.stringify(ASK_JUDGE_THRESHOLDS), ')')
  console.log(onKnownPage ? 'every question asked on a page the index knows\n' : '')
  const judgments = new Map<string, AskTurnJudgment | null>()
  let agreed = 0
  let dependsAgreed = 0
  let dependsChecked = 0
  let tokens = 0

  for (const testCase of ASK_CASES) {
    const question = testCase.turns.at(-1) ?? ''
    const previousQuestion = testCase.turns.at(-2) ?? null
    const judgment = await judgeTurn({
      question,
      previousQuestion,
      onKnownPage,
      timeoutMs: TIMEOUT_MS,
      logger: console,
    })
    judgments.set(testCase.id, judgment)
    tokens += judgment?.inputTokens ?? 0

    const route = routeTurn(judgment, {
      isFollowUp: previousQuestion !== null,
      handoffState: 'none',
    })
    const ok = turnAgrees(testCase, judgment)
    if (ok) agreed += 1
    const expected = `${testCase.expect.handoff ?? 'no card'}${
      testCase.expect.text === undefined ? '' : testCase.expect.text ? ' + words' : ', no words'
    }`
    console.log(`${ok ? 'ok  ' : 'MISS'} ${testCase.id.padEnd(20)} "${question}"`)
    console.log(`       ${describe(judgment)}`)
    console.log(
      `       route ${route.kind}${'reason' in route && route.reason ? ` (${route.reason})` : ''}   expected ${expected}`,
    )
    if (judgment) {
      const spread = Object.entries(judgment.probabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([kind, probability]) => `${kind} ${pct(probability)}`)
        .join('  ')
      console.log(`       ${spread}`)
    }

    const expectsDepends = ASK_DEPENDS_EXPECTATIONS[testCase.id]
    if (previousQuestion !== null && expectsDepends !== undefined) {
      dependsChecked += 1
      const depends = dependsOnPrevious(judgment)
      if (depends === expectsDepends) dependsAgreed += 1
      else
        console.log(
          `       DEPENDS MISS: searched ${depends ? 'with' : 'without'} the previous turn`,
        )
    }
  }

  console.log(`\nturn routing agrees with the fixture on ${agreed} of ${ASK_CASES.length} cases`)
  if (dependsChecked > 0) {
    console.log(
      `depends_on_previous agrees on ${dependsAgreed} of ${dependsChecked} follow-ups (threshold ${ASK_JUDGE_THRESHOLDS.dependsOnPrevious})`,
    )
  }
  console.log(`${Math.round(tokens / ASK_CASES.length)} input tokens a turn`)
  return judgments
}

type PassageRun = { query: string; chunks: NearestChunk[]; judged: AskPassageJudgment | null }

/**
 * Retrieval as the endpoint runs it (`prepareRetrieval`), with Jev's passage
 * check as the veto and every candidate list captured for printing. The
 * `query` and `also` indices pick among `queries` as the endpoint does.
 */
async function searchWithPassages(
  payload: Payload,
  queries: string[],
  { query, also }: { query: number; also?: number },
): Promise<PassageRun[]> {
  const { prepareRetrieval } = await import('@/features/ask/retrieve')
  const runs: PassageRun[] = []
  await prepareRetrieval(payload, queries).search({
    query,
    also,
    check: async (checked, chunks) => {
      const judged = await judgePassages({
        query: checked,
        chunks,
        timeoutMs: TIMEOUT_MS,
        logger: console,
      })
      runs.push({ query: checked, chunks, judged })
      return chunks.map((_, i) => routePassage(judged?.answers[i] ?? null) === 'keep')
    },
  })
  return runs
}

const keptPaths = async (runs: PassageRun[]): Promise<Set<string>> => {
  const { indexedSourcePath } = await import('@/shared/content/surfaces')
  const kept = new Set<string>()
  for (const run of runs) {
    run.chunks.forEach((chunk, i) => {
      if (routePassage(run.judged?.answers[i] ?? null) === 'keep') {
        kept.add(indexedSourcePath(chunk.collection, chunk.slug) ?? '?')
      }
    })
  }
  return kept
}

async function printRun(run: PassageRun): Promise<void> {
  const { indexedSourcePath } = await import('@/shared/content/surfaces')
  for (const [i, chunk] of run.chunks.entries()) {
    const answers = run.judged?.answers[i] ?? null
    console.log(
      `   ${routePassage(answers).padEnd(4)} sim ${pct(chunk.similarity)}  rel ${pct(answers?.isRelevant)}  evid ${pct(answers?.hasEvidence)}  ${indexedSourcePath(chunk.collection, chunk.slug)}  ${chunk.headingPath ?? ''}`.slice(
        0,
        160,
      ),
    )
  }
}

/**
 * The journey: `open_reference` on questions that leave their subject to the
 * page and on ones that name it, then the whole turn fixture replayed with
 * the question asked, since one more question must move no route. With
 * `--passages`, the pooled search (plain form and page form) per case.
 */
async function evalJourney(payload: Payload | null): Promise<void> {
  console.log(`\nopen_reference (threshold ${ASK_JUDGE_THRESHOLDS.openReference})\n`)
  let agreed = 0
  let tokens = 0
  for (const testCase of ASK_JOURNEY_CASES) {
    const judgment = await judgeTurn({
      question: testCase.question,
      previousQuestion: null,
      onKnownPage: true,
      timeoutMs: TIMEOUT_MS,
      logger: console,
    })
    const leans = leansOnPage(judgment)
    const ok = judgment !== null && leans === testCase.leans
    if (ok) agreed += 1
    tokens += judgment?.inputTokens ?? 0
    console.log(
      `${ok ? 'ok  ' : 'MISS'} ${testCase.id.padEnd(18)} open ${pct(judgment?.openReference)}  expected ${testCase.leans ? 'yes' : 'no '}  "${testCase.question}" on "${testCase.page}"`,
    )
    if (!payload) continue

    const { pageRetrievalQuery } = await import('@/features/ask/retrieve')
    const queries = [testCase.question, pageRetrievalQuery(testCase.question, testCase.page)]
    const runs = await searchWithPassages(payload, queries, {
      query: 0,
      also: leans ? 1 : undefined,
    })
    for (const run of runs) {
      const kept = run.chunks.filter(
        (_, i) => routePassage(run.judged?.answers[i] ?? null) === 'keep',
      )
      console.log(
        `       "${run.query.replaceAll('\n', ' / ')}": kept ${kept.length} of ${run.chunks.length}`,
      )
    }
    const kept = await keptPaths(runs)
    const missing = (testCase.sources ?? []).filter((path) => !kept.has(path))
    console.log(
      `       pages kept: ${[...kept].join(', ') || 'none'}${missing.length > 0 ? `   MISSING ${missing.join(', ')}` : ''}`,
    )
  }
  console.log(
    `\nopen_reference agrees on ${agreed} of ${ASK_JOURNEY_CASES.length} cases, ${Math.round(tokens / ASK_JOURNEY_CASES.length)} input tokens a turn`,
  )
  await evalTurns(true)
}

async function evalPassages(
  payload: Payload,
  judgments: Map<string, AskTurnJudgment | null>,
): Promise<void> {
  // Loaded here, not at the top: a turn-only run needs neither Payload nor the corpus.
  const { retrievalQueries } = await import('@/features/ask/retrieve')

  console.log('\nPassage checks\n')
  for (const testCase of ASK_CASES) {
    const question = testCase.turns.at(-1) ?? ''
    const previousQuestion = testCase.turns.at(-2) ?? null
    const queries = retrievalQueries(question, previousQuestion)
    const judgment = judgments.get(testCase.id) ?? null
    const query = previousQuestion && dependsOnPrevious(judgment) ? queries.length - 1 : 0

    const runs = await searchWithPassages(payload, queries, { query })
    const kept = await keptPaths(runs)
    const missing = (testCase.expect.sources ?? []).filter((source) => !kept.has(source))
    const run = runs[0]
    const keptCount = run
      ? run.chunks.filter((_, i) => routePassage(run.judged?.answers[i] ?? null) === 'keep').length
      : 0

    console.log(
      `${testCase.id.padEnd(20)} "${(queries[query] ?? question).replaceAll('\n', ' / ')}"  kept ${keptCount} of ${run?.chunks.length ?? 0}  ${run?.judged?.ms ?? '-'} ms${
        missing.length ? `  MISSING ${missing.join(', ')}` : ''
      }`,
    )
    if (run) await printRun(run)
  }
}

/** Stored turns as labels: the redacted question, and the card the writing model ended it with. */
async function evalFromDb(payload: Payload): Promise<void> {
  const { docs } = await payload.find({
    collection: 'ask-questions',
    depth: 0,
    limit: 500,
    pagination: false,
    sort: 'createdAt',
  })
  console.log(`\nReplaying ${docs.length} stored questions\n`)
  if (docs.length === 0) return

  const previousByConversation = new Map<string, string>()
  let judged = 0
  let agreed = 0

  for (const doc of docs) {
    const previousQuestion =
      doc.followUp && doc.conversation
        ? (previousByConversation.get(doc.conversation) ?? null)
        : null
    if (doc.conversation) previousByConversation.set(doc.conversation, doc.question)
    // A stopped or failed turn has no card to compare with.
    if (doc.outcome === 'stopped' || doc.outcome === 'error') continue

    const judgment = await judgeTurn({
      question: doc.question,
      previousQuestion,
      timeoutMs: TIMEOUT_MS,
      logger: console,
    })
    const route = routeTurn(judgment, { isFollowUp: Boolean(doc.followUp), handoffState: 'none' })
    if (route.kind === 'fallback') continue

    const recorded = doc.handoffReason ?? null
    const jev = routeCardReason(route)
    // `no_answer` and `contact_details` are not the turn judgment's to call.
    const comparable = recorded !== 'no_answer' && recorded !== 'contact_details'
    if (!comparable) continue

    judged += 1
    const ok = jev === recorded
    if (ok) agreed += 1
    console.log(
      `${ok ? 'ok  ' : 'DIFF'} recorded ${String(recorded ?? 'none').padEnd(9)} jev ${String(jev ?? 'none').padEnd(9)} ${describe(judgment)}  "${doc.question.slice(0, 80)}"`,
    )
  }

  console.log(`\nJev's card matches the recorded one on ${agreed} of ${judged} comparable turns`)
}

const bootPayload = async (): Promise<Payload> => {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  return getPayload({ config })
}

if (args.includes('--journey')) {
  await evalJourney(args.includes('--passages') ? await bootPayload() : null)
  process.exit(0)
}

const judgments = args.includes('--from-db') ? new Map() : await evalTurns()

if (args.includes('--passages') || args.includes('--from-db')) {
  const payload = await bootPayload()
  if (args.includes('--passages')) await evalPassages(payload, judgments)
  if (args.includes('--from-db')) await evalFromDb(payload)
}

process.exit(0)
