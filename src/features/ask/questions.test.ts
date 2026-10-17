import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utilities/afterResponse', () => ({
  afterResponse: (run: () => Promise<void>) => run(),
}))

import { pruneExpiredAskQuestions, recordAskQuestion } from './questions'
import { ASK_QUESTION_RETENTION_DAYS, askRetentionCutoff } from './retention'

const logger = { error: vi.fn() }

const fakePayload = (deleted: { docs?: unknown[]; errors?: unknown[] } = {}) => ({
  create: vi.fn(async () => ({})),
  delete: vi.fn(async () => ({ docs: deleted.docs ?? [], errors: deleted.errors ?? [] })),
  logger,
})

const record = {
  question: 'How long do you keep this?',
  turn: 'msg_1',
  conversation: 'chat_1',
  pagePath: '/',
  followUp: false,
  retrieval: 'embedding' as const,
  sources: [],
  answer: 'Ninety days.',
  outcome: 'answered' as const,
  handoffReason: null,
  latencyMs: 10,
}

beforeEach(() => vi.clearAllMocks())

describe('askRetentionCutoff', () => {
  it('is the window before now', () => {
    const now = Date.UTC(2026, 9, 17)
    expect(askRetentionCutoff(now)).toBe(
      new Date(now - ASK_QUESTION_RETENTION_DAYS * 86_400_000).toISOString(),
    )
  })
})

describe('pruneExpiredAskQuestions', () => {
  it('deletes every row older than the cutoff and answers the count', async () => {
    const payload = fakePayload({ docs: [{ id: 1 }, { id: 2 }] })
    const before = Date.now()
    expect(await pruneExpiredAskQuestions(payload as never)).toBe(2)
    const [[call]] = vi.mocked(payload.delete).mock.calls as unknown as [
      [{ collection: string; where: { createdAt: { less_than: string } } }],
    ]
    expect(call.collection).toBe('ask-questions')
    expect(new Date(call.where.createdAt.less_than).getTime()).toBeGreaterThanOrEqual(
      new Date(askRetentionCutoff(before)).getTime(),
    )
  })

  it('throws when a row could not be deleted', async () => {
    const payload = fakePayload({ errors: [{ id: 3 }] })
    await expect(pruneExpiredAskQuestions(payload as never)).rejects.toThrow('1 expired')
  })
})

describe('recordAskQuestion', () => {
  it('stores the turn, then prunes the window; neither failure reaches the caller', async () => {
    const payload = fakePayload()
    recordAskQuestion({ payload } as never, record)
    await vi.waitFor(() => expect(payload.delete).toHaveBeenCalledTimes(1))
    expect(payload.create).toHaveBeenCalledTimes(1)
    expect(vi.mocked(payload.create).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(payload.delete).mock.invocationCallOrder[0],
    )

    const failing = fakePayload()
    vi.mocked(failing.create).mockRejectedValueOnce(new Error('db down'))
    vi.mocked(failing.delete).mockRejectedValueOnce(new Error('still down'))
    recordAskQuestion({ payload: failing } as never, record)
    await vi.waitFor(() => expect(logger.error).toHaveBeenCalledTimes(2))
  })
})
