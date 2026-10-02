/**
 * OpenAI spend and token usage for the Site Info › Ask usage panel.
 *
 * Reads the organization Usage and Costs APIs (https://platform.openai.com/docs/api-reference/usage),
 * which need an Admin key (Settings › Organization › Admin keys), not the
 * project key the endpoint answers with. Spend comes from the Costs API in
 * USD; tokens from the completions and embeddings usage endpoints, per model.
 * OpenAI exposes no remaining-credit balance over the API, so the panel links
 * to Billing for that.
 *
 * OpenAI is only called when someone presses Refresh. The Admin API allows
 * 30 requests a minute across the organization, and a panel that fetched on
 * every mount (three calls each, from every warm serverless instance) ran
 * straight into that. The last report lives in Payload KV, so every reader on
 * every instance sees the same snapshot and its `fetchedAt`.
 *
 * Nothing here is a model call; the aggregation is pure so it can be tested
 * against fixture buckets without a key.
 */

import type { Payload } from 'payload'

export const OPENAI_ADMIN_KEY_VAR = 'OPENAI_ADMIN_API_KEY'
const OPENAI_PROJECT_ID_VAR = 'OPENAI_PROJECT_ID'

const OPENAI_API_URL = 'https://api.openai.com/v1'
/** Daily buckets; the usage endpoints cap `limit` at 31 for `1d`. */
const MAX_DAILY_BUCKETS = 31
const WINDOW_DAYS = 30
const DAY_MS = 86_400_000
/** KV key holding the last report fetched; shared by every instance. */
const USAGE_REPORT_KV_KEY = 'ask:usage-report'

export type UsageReport = {
  fetchedAt: string
  /** UTC day bounds of the buckets fetched, `YYYY-MM-DD`. */
  window: { start: string; end: string }
  /** Set when OPENAI_PROJECT_ID scopes the report; otherwise the whole organization. */
  projectId: string | null
  currency: string
  spend: {
    monthToDate: number
    last30Days: number
    byLineItem: { lineItem: string; amount: number }[]
    byDay: { date: string; amount: number }[]
  }
  completions: {
    inputTokens: number
    cachedInputTokens: number
    outputTokens: number
    requests: number
    byModel: {
      model: string
      inputTokens: number
      cachedInputTokens: number
      outputTokens: number
      requests: number
    }[]
  }
  embeddings: {
    inputTokens: number
    requests: number
    byModel: { model: string; inputTokens: number; requests: number }[]
  }
}

/* OpenAI response shapes, only the fields read. */

type UsageBucket<T> = { start_time: number; end_time: number; results: T[] }

type Page<T> = { data: UsageBucket<T>[]; has_more?: boolean; next_page?: string | null }

type CostResult = {
  amount: { value: number; currency: string }
  line_item?: string | null
}

type CompletionsResult = {
  input_tokens: number
  input_cached_tokens?: number
  output_tokens: number
  num_model_requests: number
  model?: string | null
}

type EmbeddingsResult = {
  input_tokens: number
  num_model_requests: number
  model?: string | null
}

/** A failed call to the Admin API, with OpenAI's status so the endpoint can tell a bad key from an outage. */
export class OpenAIAdminError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'OpenAIAdminError'
    this.status = status
  }
}

const utcDayStart = (ms: number): number => Math.floor(ms / DAY_MS) * DAY_MS
const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

/**
 * Window start: far enough back for a 30-day total and for the 1st of the
 * current month, whichever is earlier. Never more than 31 buckets.
 */
export function windowStart(nowMs: number): number {
  const today = utcDayStart(nowMs)
  const now = new Date(today)
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  return Math.min(today - (WINDOW_DAYS - 1) * DAY_MS, monthStart)
}

type ReportInput = {
  nowMs: number
  projectId: string | null
  costs: UsageBucket<CostResult>[]
  completions: UsageBucket<CompletionsResult>[]
  embeddings: UsageBucket<EmbeddingsResult>[]
}

const byAmountDesc = <T extends { amount: number }>(a: T, b: T) => b.amount - a.amount
const byRequestsDesc = <T extends { requests: number }>(a: T, b: T) => b.requests - a.requests

/** Spend per day and per line item, with the month-to-date and 30-day totals. */
function sumCosts(
  buckets: UsageBucket<CostResult>[],
  { monthStart, last30Start }: { monthStart: number; last30Start: number },
): { currency: string; spend: UsageReport['spend'] } {
  let currency = 'usd'
  const byDay = new Map<string, number>()
  const byLineItem = new Map<string, number>()
  let monthToDate = 0
  let last30Days = 0

  for (const bucket of buckets) {
    const bucketMs = bucket.start_time * 1000
    const date = dayKey(bucketMs)
    let dayTotal = byDay.get(date) ?? 0
    for (const result of bucket.results) {
      currency = result.amount.currency || currency
      const amount = result.amount.value
      dayTotal += amount
      const lineItem = result.line_item ?? 'Other'
      byLineItem.set(lineItem, (byLineItem.get(lineItem) ?? 0) + amount)
      if (bucketMs >= monthStart) monthToDate += amount
      if (bucketMs >= last30Start) last30Days += amount
    }
    byDay.set(date, dayTotal)
  }

  return {
    currency,
    spend: {
      monthToDate,
      last30Days,
      byLineItem: [...byLineItem]
        .map(([lineItem, amount]) => ({ lineItem, amount }))
        .sort(byAmountDesc),
      byDay: [...byDay]
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
  }
}

/** Adds each count onto the same key of `into`. */
function addCounts<Counts extends Record<string, number>>(into: Counts, counts: Counts): void {
  for (const key of Object.keys(counts) as (keyof Counts)[]) {
    into[key] = (into[key] + counts[key]) as Counts[keyof Counts]
  }
}

/**
 * Each result's counts summed per model and overall, from `zero`; the models
 * ranked by requests, an unnamed one as `unknown`.
 */
function sumByModel<
  Result extends { model?: string | null },
  Counts extends Record<string, number> & { requests: number },
>(
  buckets: UsageBucket<Result>[],
  zero: Counts,
  countsOf: (result: Result) => Counts,
): Counts & { byModel: (Counts & { model: string })[] } {
  const byModel = new Map<string, Counts & { model: string }>()
  const totals = { ...zero }
  for (const bucket of buckets) {
    for (const result of bucket.results) {
      const model = result.model ?? 'unknown'
      const row = byModel.get(model) ?? { model, ...zero }
      const counts = countsOf(result)
      addCounts<Counts>(row, counts)
      byModel.set(model, row)
      addCounts(totals, counts)
    }
  }
  return { ...totals, byModel: [...byModel.values()].sort(byRequestsDesc) }
}

/** Pure aggregation over the raw buckets. */
export function buildUsageReport(input: ReportInput): UsageReport {
  const today = utcDayStart(input.nowMs)
  const now = new Date(today)
  const { currency, spend } = sumCosts(input.costs, {
    monthStart: Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    last30Start: today - (WINDOW_DAYS - 1) * DAY_MS,
  })

  return {
    fetchedAt: new Date(input.nowMs).toISOString(),
    window: { start: dayKey(windowStart(input.nowMs)), end: dayKey(today) },
    projectId: input.projectId,
    currency,
    spend,
    completions: sumByModel(
      input.completions,
      { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, requests: 0 },
      (result) => ({
        inputTokens: result.input_tokens,
        cachedInputTokens: result.input_cached_tokens ?? 0,
        outputTokens: result.output_tokens,
        requests: result.num_model_requests,
      }),
    ),
    embeddings: sumByModel(input.embeddings, { inputTokens: 0, requests: 0 }, (result) => ({
      inputTokens: result.input_tokens,
      requests: result.num_model_requests,
    })),
  }
}

/** The query string for one page of buckets: an array param repeats its key. */
function bucketQuery(
  params: Record<string, string | string[]>,
  page: string | null | undefined,
): URLSearchParams {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item)
    } else {
      search.set(key, value)
    }
  }
  if (page) search.set('page', page)
  return search
}

/** Follows `next_page` until the window is exhausted. */
async function fetchAllBuckets<T>(
  path: string,
  params: Record<string, string | string[]>,
  adminKey: string,
): Promise<UsageBucket<T>[]> {
  const buckets: UsageBucket<T>[] = []
  let page: string | null | undefined

  do {
    const res = await fetch(`${OPENAI_API_URL}${path}?${bucketQuery(params, page)}`, {
      headers: { Authorization: `Bearer ${adminKey}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
      throw new OpenAIAdminError(
        body?.error?.message ?? `OpenAI answered ${res.status} for ${path}.`,
        res.status,
      )
    }
    const json = (await res.json()) as Page<T>
    buckets.push(...json.data)
    page = json.has_more ? json.next_page : null
  } while (page)

  return buckets
}

/** True when the Admin key is set, so a refresh can be attempted. */
export const isUsageConfigured = (): boolean => Boolean(process.env[OPENAI_ADMIN_KEY_VAR])

/** The last report someone refreshed, or `null` before the first refresh. Never calls OpenAI. */
export function readUsageReport(payload: Payload): Promise<UsageReport | null> {
  return payload.kv.get<UsageReport>(USAGE_REPORT_KV_KEY)
}

/**
 * Fetches a fresh report from OpenAI (three Admin API calls) and stores it
 * for every later reader. Only the Refresh button reaches this.
 */
export async function refreshUsageReport(payload: Payload): Promise<UsageReport> {
  const nowMs = Date.now()

  const adminKey = process.env[OPENAI_ADMIN_KEY_VAR]
  if (!adminKey) throw new OpenAIAdminError(`${OPENAI_ADMIN_KEY_VAR} is not set.`, 503)
  const projectId = process.env[OPENAI_PROJECT_ID_VAR] || null

  const base: Record<string, string | string[]> = {
    start_time: String(Math.floor(windowStart(nowMs) / 1000)),
    bucket_width: '1d',
    limit: String(MAX_DAILY_BUCKETS),
  }
  if (projectId) base.project_ids = [projectId]

  const [costs, completions, embeddings] = await Promise.all([
    fetchAllBuckets<CostResult>(
      '/organization/costs',
      { ...base, group_by: ['line_item'] },
      adminKey,
    ),
    fetchAllBuckets<CompletionsResult>(
      '/organization/usage/completions',
      { ...base, group_by: ['model'] },
      adminKey,
    ),
    fetchAllBuckets<EmbeddingsResult>(
      '/organization/usage/embeddings',
      { ...base, group_by: ['model'] },
      adminKey,
    ),
  ])

  const report = buildUsageReport({ nowMs, projectId, costs, completions, embeddings })
  await payload.kv.set(USAGE_REPORT_KV_KEY, report)
  return report
}
