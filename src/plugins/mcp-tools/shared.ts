import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { CollectionSlug, GlobalSlug, PayloadRequest } from 'payload'
// The plugin and the MCP SDK under it were built against zod 3; the project
// is on zod 4. A `zod/v3` schema is what the SDK's converter expects.
import { z } from 'zod/v3'
import { HOME_SURFACE } from '@/shared/content/surfaces'
import type { Doc } from './blocks'

export type McpTool = NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']>[number]

/**
 * The plugin types `parameters` with its own zod 3 copy; comparing a
 * `zod/v3` shape against it makes tsc give up ("excessively deep"). Tools are
 * typed here with the shape kept simple and cast once at the export.
 */
export type SiteTool = Omit<McpTool, 'parameters'> & { parameters: Record<string, z.ZodTypeAny> }

/** Collections with blocks in them. A slug not listed has no block to reach. */
export const BLOCK_COLLECTIONS = [
  'pages',
  'works',
  'posts',
] as const satisfies readonly CollectionSlug[]

/** Globals with blocks in them. Each is one document, so a call names no id. */
export const BLOCK_GLOBALS = [HOME_SURFACE.global] as const satisfies readonly GlobalSlug[]

const BLOCK_TARGETS = [...BLOCK_COLLECTIONS, ...BLOCK_GLOBALS] as const

export type CollectionTarget = (typeof BLOCK_COLLECTIONS)[number]

export type GlobalTarget = (typeof BLOCK_GLOBALS)[number]

export type Target = CollectionTarget | GlobalTarget

export const isGlobalTarget = (target: string): target is GlobalTarget =>
  (BLOCK_GLOBALS as readonly string[]).includes(target)

/** The plugin's rule for a capability group name: `site-info` is `siteInfo`. */
const toCamelCase = (slug: string): string =>
  slug.replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ''))

export type Op = 'find' | 'create' | 'update'

type KeyCapabilities = Record<string, Partial<Record<Op, boolean | null>> | undefined>

export const keyAllows = (req: PayloadRequest, slug: string, op: Op): boolean => {
  const key = req.context.mcpApiKey as KeyCapabilities | undefined
  return Boolean(key?.[toCamelCase(slug)]?.[op])
}

export const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] })

export const json = (value: unknown) => text(JSON.stringify(value))

/** A refused save names each problem by path; surface those, not just the headline. */
export const errorText = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  // A draft skips field validation, so a bad option reaches Postgres; its
  // reason is in the cause, the message is the whole SQL statement.
  const cause = (error as { cause?: { message?: unknown } })?.cause?.message
  if (message.startsWith('Failed query') && typeof cause === 'string') {
    return `Error: not saved, ${cause}. Check the value against describeFields.`
  }
  const errors = (error as { data?: { errors?: unknown } })?.data?.errors
  return errors ? `Error: ${message}\n${JSON.stringify(errors)}` : `Error: ${message}`
}

export const cannot = (op: Op, slug: string) =>
  text(`Error: this key cannot ${op} ${slug}. Ask an admin to grant it.`)

export const collectionParam = z
  .enum(BLOCK_COLLECTIONS)
  .describe('The collection the document is in, by slug.')

export const targetParams = {
  collection: z
    .enum(BLOCK_TARGETS)
    .describe('The collection the document is in, or `home` for the home page global, by slug.'),
  id: z
    .union([z.string(), z.number()])
    .optional()
    .describe('The document id. Required for pages, posts and works; omit for `home`.'),
}

type TargetId = string | number | undefined

const requireId = (collection: CollectionTarget, id: TargetId): string | number => {
  if (id === undefined) throw new Error(`send the id of the ${collection} document.`)
  return id
}

export const draftParam = z
  .boolean()
  .optional()
  .default(true)
  .describe('true saves a draft (the default); false publishes the document.')

/**
 * The data that saves as asked. Payload publishes only when the data carries
 * `_status: 'published'`; `draft: false` alone keeps a draft (and an explicit
 * `_status` in the data wins, so `'draft'` with `draft: false` unpublishes).
 */
export const withStatus = (data: Doc, draft: boolean): Doc =>
  draft || data._status ? data : { ...data, _status: 'published' }

/** The latest version of the document, draft or published, as the team member may see it. */
export async function readTarget(req: PayloadRequest, collection: Target, id: TargetId) {
  const common = { depth: 0, draft: true, overrideAccess: false, req, user: req.user }
  const doc = isGlobalTarget(collection)
    ? await req.payload.findGlobal({ ...common, slug: collection })
    : await req.payload.findByID({ ...common, collection, id: requireId(collection, id) })
  return doc as unknown as Doc
}

/** Save fields of a document as the team member, by the same draft rule as every tool here. */
export async function saveTarget(
  req: PayloadRequest,
  collection: Target,
  id: TargetId,
  data: Doc,
  draft: boolean,
) {
  const common = {
    data: withStatus(data, draft),
    depth: 0,
    draft,
    overrideAccess: false,
    overrideLock: true,
    req,
    user: req.user,
  }
  const saved = isGlobalTarget(collection)
    ? await req.payload.updateGlobal({ ...common, slug: collection })
    : await req.payload.update({ ...common, collection, id: requireId(collection, id) })
  return saved as unknown as Doc
}
