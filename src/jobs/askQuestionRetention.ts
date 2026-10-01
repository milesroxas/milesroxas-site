import type { TaskConfig } from 'payload'
import { ASK_QUESTION_RETENTION_DAYS } from '@/features/ask/retention'

const DAY_MS = 86_400_000

/**
 * Deletes Ask questions older than the retention window, so the window the
 * visitor notice promises is enforced by the system rather than by policy.
 *
 * Scheduled for 05:00 in the server's timezone, which is UTC on Vercel. The
 * daily cron at 05:10 (vercel.json; a Hobby plan allows one run a day) calls
 * /api/payload-jobs/run, which executes the run that is due and queues the next
 * 05:00 slot. The first cleanup lands the day after the first cron run, and a
 * row can outlive the window by up to two days.
 */
export const askQuestionRetentionTask: TaskConfig = {
  slug: 'askQuestionRetention',
  retries: 2,
  schedule: [{ cron: '0 0 5 * * *', queue: 'default' }],
  outputSchema: [{ name: 'deleted', type: 'number' }],
  handler: async ({ req }) => {
    const cutoff = new Date(Date.now() - ASK_QUESTION_RETENTION_DAYS * DAY_MS).toISOString()
    const { docs, errors } = await req.payload.delete({
      collection: 'ask-questions',
      where: { createdAt: { less_than: cutoff } },
      overrideAccess: true,
      req,
    })
    if (errors.length > 0) {
      throw new Error(`Could not delete ${errors.length} expired Ask questions`)
    }
    return { output: { deleted: docs.length } }
  },
}
