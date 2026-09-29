import { TypeSafeClient } from '@typesafe-ai/sdk'
import { ASK_JUDGE_KEY_VAR, ASK_JUDGE_MODEL } from '@/features/ask/judge'

/**
 * The TypeSafe client the MCP tools judge with: the same key and pinned model
 * as the Ask judge, so one threshold review covers both when Jev moves.
 *
 * An agent waits for an answer where a visitor would not, so the timeout is
 * wider than the Ask judge's 800 ms, and one retry covers a 429.
 */
export const MCP_JEV_TIMEOUT_MS = 10_000

/** What the tools need from a client: the tests hand in a fake. */
export type Jev = Pick<TypeSafeClient, 'systemOne'>

let client: TypeSafeClient | null = null

/** The shared client, or null when the server has no key. */
export function mcpJevClient(): TypeSafeClient | null {
  if (!process.env[ASK_JUDGE_KEY_VAR]?.trim()) return null
  client ??= new TypeSafeClient({
    defaultModel: ASK_JUDGE_MODEL,
    timeout: MCP_JEV_TIMEOUT_MS,
    retry: { maxRetries: 1 },
    logLevel: 'error',
  })
  return client
}
