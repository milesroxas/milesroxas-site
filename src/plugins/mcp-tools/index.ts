import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { CollectionSlug, PayloadRequest } from 'payload'
// The plugin and the MCP SDK under it were built against zod 3; the project
// is on zod 4. A `zod/v3` schema is what the SDK's converter expects.
import { z } from 'zod/v3'
import { embedQuestions, queryNearestChunks } from '@/features/ask/embeddings'
import { ASK_MODEL_API_KEY_VAR } from '@/features/ask/model'
import { redactFreeText } from '@/features/ask/redact'
import { type Doc, findBlock, outline, rootField, withBlock } from './blocks'
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

type McpTool = NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']>[number]

/**
 * The plugin types `parameters` with its own zod 3 copy; comparing a
 * `zod/v3` shape against it makes tsc give up ("excessively deep"). Tools are
 * typed here with the shape kept simple and cast once at the export.
 */
type SiteTool = Omit<McpTool, 'parameters'> & { parameters: Record<string, z.ZodTypeAny> }

/** Collections with blocks in them. A slug not listed has no block to reach. */
const BLOCK_COLLECTIONS = ['pages', 'works', 'posts'] as const satisfies readonly CollectionSlug[]

type Target = (typeof BLOCK_COLLECTIONS)[number]

const collectionEnum = z.enum(BLOCK_COLLECTIONS)

/** The plugin's rule for a capability group name: `site-info` is `siteInfo`. */
const toCamelCase = (slug: string): string =>
  slug.replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ''))

type KeyCapabilities = Record<
  string,
  { find?: boolean | null; update?: boolean | null } | undefined
>

const keyAllows = (req: PayloadRequest, slug: string, op: 'find' | 'update'): boolean => {
  const key = req.context.mcpApiKey as KeyCapabilities | undefined
  return Boolean(key?.[toCamelCase(slug)]?.[op])
}

const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] })

const json = (value: unknown) => text(JSON.stringify(value))

/** A refused save names each problem by path; surface those, not just the headline. */
const errorText = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  const errors = (error as { data?: { errors?: unknown } })?.data?.errors
  return errors ? `Error: ${message}\n${JSON.stringify(errors)}` : `Error: ${message}`
}

const cannot = (op: 'find' | 'update', slug: string) =>
  text(`Error: this key cannot ${op} ${slug}. Ask an admin to grant it.`)

const targetParams = {
  collection: collectionEnum.describe('The collection the document is in, by slug.'),
  id: z.union([z.string(), z.number()]).describe('The document id.'),
}

/** The latest version of the document, draft or published, as the team member may see it. */
async function readTarget(req: PayloadRequest, collection: Target, id: string | number) {
  const doc = await req.payload.findByID({
    collection,
    id,
    depth: 0,
    draft: true,
    overrideAccess: false,
    req,
    user: req.user,
  })
  return doc as unknown as Doc
}

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
    draft: z
      .boolean()
      .optional()
      .default(true)
      .describe('true saves a draft (the default); false publishes the document.'),
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
      const saved = (await req.payload.update({
        collection,
        id: doc.id as string | number,
        data: { [field]: withBlock(doc, row.path, next)[field] },
        depth: 0,
        draft,
        overrideAccess: false,
        overrideLock: true,
        req,
        user: req.user,
      })) as unknown as Doc
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

const siteTools: SiteTool[] = [findContent, outlineDocument, locateBlock, getBlock, patchBlock]

export const mcpSiteTools = siteTools as unknown as McpTool[]
