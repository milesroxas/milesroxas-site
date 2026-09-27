import type { Payload } from 'payload'
import type { RetrievedSource } from './retrieve'

/**
 * sas-site answers a question about a thin case study from its Content Hub
 * record's brief (client, kinds of work, deliverables). This site has no
 * Content Hub (docs/composer-roadmap.md, Phase 5), so there is never a brief:
 * the endpoint keeps sas-site's flow and every turn takes the path it takes
 * when a page has none. Kept as a module, not deleted from the endpoint, so a
 * later hub can fill it in without touching `endpoints/ask.ts`.
 */
export type AskStoryBrief = {
  path: string
  title: string
  thin: boolean
}

/** Always null here: no work page has a canonical record to brief from. */
export async function resolveStoryBrief(
  _payload: Payload,
  _path: string,
): Promise<AskStoryBrief | null> {
  return null
}

/** Unreachable without a brief; false keeps the endpoint's types whole. */
export function namesStory(_question: string, _brief: AskStoryBrief): boolean {
  return false
}

/** Unreachable without a brief; the sources pass through. */
export function withStoryBrief(
  sources: RetrievedSource[],
  _brief: AskStoryBrief,
): RetrievedSource[] {
  return sources
}
