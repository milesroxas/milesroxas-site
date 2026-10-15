// The plugin and the MCP SDK under it were built against zod 3; the project
// is on zod 4. A `zod/v3` schema is what the SDK's converter expects.
import { z } from 'zod/v3'
import { embedQuestions, queryNearestChunks } from '@/features/ask/embeddings'
import { ASK_MODEL_API_KEY_VAR } from '@/features/ask/model'
import { redactFreeText } from '@/features/ask/redact'
import { type Doc, findBlock, outline, rootField, withBlock } from './blocks'
import { documentTools } from './documents'
import {
  FIND_CANDIDATES,
  FIND_LIMIT,
  FIND_MAX_LIMIT,
  FIND_MIN_SIMILARITY,
  FIND_SOURCES,
  type FindSource,
  judgeChunks,
  unjudged,
} from './find'
import { mcpJevClient } from './jev'
import { locateInOutline } from './locate'
import {
  cannot,
  draftParam,
  errorText,
  json,
  keyAllows,
  type McpTool,
  readTarget,
  type SiteTool,
  saveTarget,
  type Target,
  targetParams,
  text,
  withStatus,
} from './shared'

/**
 * Custom MCP tools: find where the site talks about something, outline a
 * document, locate the block an instruction means, read one block, patch one
 * block. Ported from sas-site (its docs/typesafe-mcp-roadmap.md), plus
 * `findContent`, the cross-site search its roadmap left as the next step.
 *
 * The generated tools move whole documents. A `find*` call returns the whole
 * page and an `update*` call resends the whole `layout`, so a one-line edit
 * costs the client's model the page twice, the second time as output tokens.
 * These tools move one block, or a handful of snippets, instead. They are
 * custom tools of `@payloadcms/plugin-mcp`, so every client gets them from the
 * server and no client needs a change.
 *
 * Two of them judge with TypeSafe's Jev on the server (`locateBlock`,
 * `findContent`): the page never reaches the client's model, and the
 * judgment costs a fraction of a cent. The rest is plain code.
 *
 * Two gates, like the generated tools. Each tool is a checkbox on the key
 * (`payload-mcp-tool` group, off by default; `mcp.ts` sets that), and a call
 * also needs the key's `find` (outline, locate, get, findContent) or `update`
 * (patch) on the collection it names, read from the key document `mcp.ts`
 * puts on `req.context.mcpApiKey`. The Local API then runs as the linked team
 * member with `overrideAccess: false`, so collection access rules apply too.
 */

const findContent: SiteTool = {
  name: 'findContent',
  description:
    "Where the published site talks about a topic, across Pages, Works, Posts and Site Info, judged on the server (a vector search over the site, then one Jev check per passage), so no page reaches you. Answers with passages best first: collection, document id, title, url, section heading, a snippet, and `focus`: how much of the passage is about the topic (`subject`, `part` or `passing`). Published copy only, protected works never included: before editing, locateBlock the document by id with the user's words. Send the topic as the user put it.",
  parameters: {
    topic: z
      .string()
      .min(2)
      .max(300)
      .describe("What to find, in the user's words, such as 'Webflow' or 'my time at Buzlee'."),
    collections: z
      .array(z.enum(FIND_SOURCES))
      .optional()
      .describe('Search only these. Omit to search every source the key can find.'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(FIND_MAX_LIMIT)
      .optional()
      .default(FIND_LIMIT)
      .describe('Most passages to return.'),
  },
  handler: async (args, req) => {
    const {
      topic,
      collections,
      limit = FIND_LIMIT,
    } = args as {
      topic: string
      collections?: FindSource[]
      limit?: number
    }
    const sources = (collections?.length ? collections : FIND_SOURCES).filter((slug) =>
      keyAllows(req, slug, 'find'),
    )
    if (sources.length === 0) {
      return text(
        `Error: this key cannot find ${(collections ?? FIND_SOURCES).join(', ')}. Ask an admin to grant it.`,
      )
    }
    if (!process.env[ASK_MODEL_API_KEY_VAR]?.trim()) {
      return text(
        'Error: findContent needs the Ask index, which is not configured on this server. Use a find tool with a `where` on the title.',
      )
    }
    try {
      const query = redactFreeText(topic.trim())
      const [embedding] = await embedQuestions([query])
      const nearest = await queryNearestChunks(req.payload, embedding, {
        limit: FIND_CANDIDATES,
        minSimilarity: FIND_MIN_SIMILARITY,
      })
      const allowed = new Set<string>(sources)
      const chunks = nearest.filter((chunk) => allowed.has(chunk.collection))
      const jev = mcpJevClient()
      const found = jev ? await judgeChunks(jev, chunks, query) : unjudged(chunks, query)
      return json({
        topic: query,
        searched: sources,
        ...found,
        rows: found.rows.slice(0, limit),
        more: Math.max(0, found.rows.length - limit),
        ...(found.judged
          ? {}
          : { note: 'No TypeSafe key on this server: similarity order, unchecked.' }),
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const outlineDocument: SiteTool = {
  name: 'outlineDocument',
  description:
    'One row per block of a document, nested blocks included: path, id, blockType, blockName, a child count, and the first 200 characters of its copy. Read this instead of the whole document to find the block an edit concerns, then getBlock or patchBlock it by id. Returns the latest draft.',
  parameters: targetParams,
  handler: async (args, req) => {
    const { collection, id } = args as { collection: Target; id: string | number }
    if (!keyAllows(req, collection, 'find')) return cannot('find', collection)
    try {
      const doc = await readTarget(req, collection, id)
      return json({
        collection,
        id: doc.id,
        title: doc.title,
        _status: doc._status,
        blocks: outline(doc),
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const locateBlock: SiteTool = {
  name: 'locateBlock',
  description:
    "Which block of a document an editing instruction is about, judged on the server from the outline (one Jev request, no client tokens for the page). Answers with a verdict (`found`, `unsure`, `none`), the most likely blocks best first with a probability each (path, id, blockType, blockName, the start of the copy), and what the judgment cost. On `found`, getBlock or patchBlock the first candidate by id; on `unsure`, pick from the candidates or read outlineDocument; on `none`, the document has no such block. Protected works are never sent to the judge: use outlineDocument for those. Send the instruction in the user's words.",
  parameters: {
    ...targetParams,
    instruction: z
      .string()
      .min(1)
      .describe(
        "The edit in words, as the user put it, such as 'tighten the intro under the hero'.",
      ),
  },
  handler: async (args, req) => {
    const { collection, id, instruction } = args as {
      collection: Target
      id: string | number
      instruction: string
    }
    if (!keyAllows(req, collection, 'find')) return cannot('find', collection)
    const jev = mcpJevClient()
    if (!jev) {
      return text('Error: locateBlock is not configured on this server. Use outlineDocument.')
    }
    try {
      const doc = await readTarget(req, collection, id)
      // Client work behind an access link stays between this server and the
      // client's own model: it is not sent to a second processor.
      if (doc.isProtected === true) {
        return text(
          `Error: ${collection} ${doc.id} is a protected work, which locateBlock does not send to the judge. Use outlineDocument.`,
        )
      }
      const located = await locateInOutline(jev, outline(doc), instruction)
      return json({ collection, id: doc.id, title: doc.title, ...located })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const getBlock: SiteTool = {
  name: 'getBlock',
  description:
    'One block of a document by its id (from outlineDocument or locateBlock), with its path. The block comes back exactly as stored, nested blocks included, so it can be edited and sent to patchBlock. Returns the latest draft.',
  parameters: {
    ...targetParams,
    blockId: z.string().describe('The block id from outlineDocument or locateBlock.'),
  },
  handler: async (args, req) => {
    const { collection, id, blockId } = args as {
      collection: Target
      id: string | number
      blockId: string
    }
    if (!keyAllows(req, collection, 'find')) return cannot('find', collection)
    try {
      const doc = await readTarget(req, collection, id)
      const row = findBlock(doc, blockId)
      if (!row) return text(`Error: no block with id "${blockId}" in ${collection} ${doc.id}`)
      return json({ path: row.path, block: row.block })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const patchBlock: SiteTool = {
  name: 'patchBlock',
  description:
    'Change one block of a document by its id and save. `patch` holds only the fields to change; each replaces the stored field whole, so send a complete array (rows with their ids) when changing one row of it. `id` and `blockType` cannot change. Saves a draft unless `draft` is false, which publishes. Returns the saved block. A refused save names each problem by path: fix those and resend the same patch.',
  parameters: {
    ...targetParams,
    blockId: z.string().describe('The block id from outlineDocument or locateBlock.'),
    patch: z
      .record(z.string(), z.unknown())
      .describe('The fields to change, as they appear in getBlock.'),
    draft: draftParam,
  },
  handler: async (args, req) => {
    const {
      collection,
      id,
      blockId,
      patch,
      draft = true,
    } = args as {
      collection: Target
      id: string | number
      blockId: string
      patch: Doc
      draft?: boolean
    }
    if (!keyAllows(req, collection, 'update')) return cannot('update', collection)
    try {
      const doc = await readTarget(req, collection, id)
      const row = findBlock(doc, blockId)
      if (!row) return text(`Error: no block with id "${blockId}" in ${collection} ${doc.id}`)
      const next = { ...row.block, ...patch, id: row.id, blockType: row.blockType }
      const field = rootField(row.path)
      const saved = await saveTarget(
        req,
        collection,
        doc.id as string | number,
        { [field]: withBlock(doc, row.path, next)[field] },
        draft,
      )
      const savedRow = findBlock(saved, blockId)
      return json({
        path: savedRow?.path ?? row.path,
        _status: saved._status,
        block: savedRow?.block ?? next,
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

/**
 * Every document with an SEO group (`meta`), and the fields each carries. The
 * Contact page's group predates `seoTab` and holds only a title and description.
 */
const SEO_FIELDS = ['title', 'description', 'image', 'noIndex'] as const
export const SEO_TARGETS = {
  pages: SEO_FIELDS,
  posts: SEO_FIELDS,
  works: SEO_FIELDS,
  'works-index': SEO_FIELDS,
  'contact-page': ['title', 'description'],
} as const satisfies Record<string, readonly (typeof SEO_FIELDS)[number][]>

type SeoTarget = keyof typeof SEO_TARGETS

const SEO_GLOBAL_TARGETS: ReadonlySet<SeoTarget> = new Set(['works-index', 'contact-page'])

/** Targets without drafts save straight to the live document. */
const SEO_UNVERSIONED: ReadonlySet<SeoTarget> = new Set(['contact-page'])

type SeoMeta = Partial<Record<(typeof SEO_FIELDS)[number], unknown>>

type SeoArgs = { collection: SeoTarget; id?: string | number; meta: SeoMeta; draft?: boolean }

/** Why an `updateSeo` call cannot be saved as sent, or null. */
const seoRefusal = ({ collection, id, meta }: SeoArgs): string | null => {
  const allowed: readonly string[] = SEO_TARGETS[collection]
  const unknown = Object.keys(meta).filter((field) => !allowed.includes(field))
  if (unknown.length > 0) return `${collection} has no SEO field ${unknown.join(', ')}.`
  if (Object.keys(meta).length === 0) return 'send at least one field in `meta`.'
  if (!SEO_GLOBAL_TARGETS.has(collection) && id === undefined) {
    return `send the id of the ${collection} document.`
  }
  return null
}

/**
 * The generated `updatePages`, `updatePosts` and `updateWorks` schemas run to
 * 110-130 KB each (every layout block), and clients with a schema budget
 * (Codex, the ChatGPT app) drop those tools without a word. This one carries
 * only the SEO group, so every client can set titles and descriptions.
 */
const updateSeo: SiteTool = {
  name: 'updateSeo',
  description:
    'Set the SEO fields (`meta`) of a page, post, work, the works index or the contact page, without sending the rest of the document. Send only the fields to change; null clears one. `title` is the page title without the " | Miles Roxas" suffix, `description` the search and share summary (about 150 characters), `image` a media id for the share card, `noIndex` keeps the page out of search. The contact page takes only `title` and `description`. Saves a draft unless `draft` is false, which publishes the document with any other unpublished edits it holds; the contact page has no drafts and saves live. Returns the saved `meta`.',
  parameters: {
    collection: z
      .enum(Object.keys(SEO_TARGETS) as [SeoTarget, ...SeoTarget[]])
      .describe('The collection or global, by slug.'),
    id: z
      .union([z.string(), z.number()])
      .optional()
      .describe('The document id. Required for pages, posts and works; omit for a global.'),
    meta: z
      .object({
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        image: z.number().nullable().optional().describe('A media id.'),
        noIndex: z.boolean().nullable().optional(),
      })
      .strict()
      .describe('Only the SEO fields to change.'),
    draft: draftParam,
  },
  handler: async (args, req) => {
    const { collection, id, meta, draft = true } = args as SeoArgs
    if (!keyAllows(req, collection, 'update')) return cannot('update', collection)
    const refused = seoRefusal(args as SeoArgs)
    if (refused) return text(`Error: ${refused}`)
    const isGlobal = SEO_GLOBAL_TARGETS.has(collection)
    const versioned = !SEO_UNVERSIONED.has(collection)
    const common = {
      data: versioned ? withStatus({ meta }, draft) : { meta },
      depth: 0,
      overrideAccess: false,
      req,
      user: req.user,
      ...(versioned ? { draft } : {}),
    }
    try {
      const saved = (isGlobal
        ? await req.payload.updateGlobal({ ...common, slug: collection as 'works-index' })
        : await req.payload.update({
            ...common,
            collection: collection as Target,
            id: id as string | number,
            overrideLock: true,
          })) as unknown as Doc
      return json({
        collection,
        ...(isGlobal ? {} : { id: saved.id }),
        ...(versioned ? { _status: saved._status } : {}),
        meta: saved.meta,
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const siteTools: SiteTool[] = [
  findContent,
  outlineDocument,
  locateBlock,
  getBlock,
  patchBlock,
  updateSeo,
  ...documentTools,
]

export const mcpSiteTools = siteTools as unknown as McpTool[]
