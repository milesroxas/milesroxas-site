import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Paths no crawler needs: the admin, the APIs, preview switches, and the
 * query-driven search page (its results are the pages to index).
 */
const DISALLOW = ['/admin', '/api/', '/next/', '/search']

/**
 * AI crawlers named explicitly so a future blanket rule can never shut them
 * out by accident (docs/aeo.md). The search and user-triggered fetchers
 * (OAI-SearchBot, Claude-SearchBot, PerplexityBot, the *-User agents) decide
 * whether an answer can cite the site; the training crawlers (GPTBot,
 * ClaudeBot, Google-Extended, CCBot, meta-externalagent) decide whether the
 * models know it at all. The list is checked against Vercel's verified bot
 * directory (bots.fyi), which is also what lets them past Bot Protection. A portfolio wants both. Allowing training is a
 * business choice: to withdraw it, move a crawler to TRAINING_DENIED.
 */
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'Meta-ExternalFetcher',
  'DuckAssistBot',
  'MistralAI-User',
  'CCBot',
]

/** Training crawlers turned away. Empty by choice; see AI_CRAWLERS. */
const TRAINING_DENIED: string[] = []

/**
 * The same choice as a Content Signal (contentsignals.org): whether the
 * content may be searched, quoted in an answer, and used for training.
 */
const CONTENT_SIGNAL = `search=yes, ai-input=yes, ai-train=${TRAINING_DENIED.length ? 'no' : 'yes'}`

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getServerSideURL()

  return {
    rules: [
      ...AI_CRAWLERS.filter((agent) => !TRAINING_DENIED.includes(agent)).map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
      ...TRAINING_DENIED.map((userAgent) => ({ userAgent, disallow: '/' })),
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
        other: { 'Content-Signal': CONTENT_SIGNAL },
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
