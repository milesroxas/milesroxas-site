import type { Block, Field, PayloadRequest } from 'payload'
import { z } from 'zod/v3'
import {
  containerPath,
  type Doc,
  findBlock,
  LAYOUT_FIELD,
  valueAt,
  withInserted,
  withoutBlock,
} from './blocks'
import {
  BLOCK_COLLECTIONS,
  BLOCK_GLOBALS,
  type CollectionTarget,
  cannot,
  collectionParam,
  draftParam,
  errorText,
  json,
  keyAllows,
  readTarget,
  type SiteTool,
  saveTarget,
  type Target,
  targetParams,
  text,
  withStatus,
} from './shared'

/**
 * Whole-document authoring for clients that cannot hold the generated tools.
 *
 * `createPages`, `updatePages` and their Posts and Works twins carry every
 * layout block in their schema, 110-130 KB each. Codex and the ChatGPT app
 * drop a tool that large without a word, so those clients could neither
 * create a page nor change its title. These tools take the document as plain
 * JSON and leave validation to Payload, which names each problem by path;
 * `describeFields` says what the JSON may hold, one collection or block at a
 * time. The block tools add, move and remove blocks without resending the
 * layout. Same gates as the other site tools: the tool's checkbox, then the
 * key's `find`, `create` or `update` on the collection.
 */

type FieldRow = {
  name: string
  type: string
  required?: true
  hasMany?: true
  relationTo?: string | string[]
  options?: string[]
  defaultValue?: unknown
  description?: string
  fields?: FieldRow[]
  blocks?: string[]
}

const isRecord = (value: unknown): value is Doc => typeof value === 'object' && value !== null

/** Hidden, unless it is a write-only input (the `markdown` siblings are virtual and hidden). */
const isInternal = (field: Field): boolean =>
  Boolean((field.admin as { hidden?: boolean } | undefined)?.hidden) &&
  !('virtual' in field && field.virtual === true)

const optionValues = (field: Field): string[] | undefined =>
  'options' in field && Array.isArray(field.options)
    ? field.options.map((option) => (typeof option === 'string' ? option : option.value))
    : undefined

const blockSlugs = (field: Field): string[] | undefined =>
  field.type === 'blocks'
    ? [
        ...(field.blocks ?? []).map((block) => block.slug),
        ...(field.blockReferences ?? []).map((ref) => (typeof ref === 'string' ? ref : ref.slug)),
      ]
    : undefined

const fieldRow = (field: Field & { name: string }): FieldRow => {
  const description = (field.admin as { description?: unknown } | undefined)?.description
  const { defaultValue } = field as { defaultValue?: unknown }
  const nested = 'fields' in field ? describe(field.fields) : undefined
  return {
    name: field.name,
    type: field.type,
    ...('required' in field && field.required ? { required: true as const } : {}),
    ...('hasMany' in field && field.hasMany ? { hasMany: true as const } : {}),
    ...('relationTo' in field ? { relationTo: field.relationTo } : {}),
    ...(optionValues(field) ? { options: optionValues(field) } : {}),
    ...(defaultValue !== undefined && typeof defaultValue !== 'function' ? { defaultValue } : {}),
    ...(typeof description === 'string' ? { description } : {}),
    ...(nested?.length ? { fields: nested } : {}),
    ...(blockSlugs(field) ? { blocks: blockSlugs(field) } : {}),
  }
}

/** The authorable fields as stored: unnamed tabs, rows and collapsibles flattened, named tabs as groups. */
export function describe(fields: Field[]): FieldRow[] {
  return fields.flatMap((field): FieldRow[] => {
    if (field.type === 'ui' || isInternal(field)) return []
    if (field.type === 'tabs') {
      return field.tabs.flatMap((tab) =>
        'name' in tab && tab.name
          ? [{ name: tab.name, type: 'group', fields: describe(tab.fields) }]
          : describe(tab.fields),
      )
    }
    if (!('name' in field) || !field.name) {
      return 'fields' in field ? describe(field.fields) : []
    }
    return [fieldRow(field as Field & { name: string })]
  })
}

/** The fields directly under a field: a tab set's tabs, a group's or row's own. */
const childFields = (field: Field): Field[] => {
  if (field.type === 'tabs') return field.tabs.flatMap((tab) => tab.fields)
  if (field.type === 'blocks') return []
  return 'fields' in field ? field.fields : []
}

/** Every block config reachable from these fields, nested ones included, by slug. */
export function blocksIn(fields: Field[], found = new Map<string, Block>()): Map<string, Block> {
  for (const field of fields) {
    for (const block of field.type === 'blocks' ? (field.blocks ?? []) : []) {
      if (found.has(block.slug)) continue
      found.set(block.slug, block)
      blocksIn(block.fields, found)
    }
    blocksIn(childFields(field), found)
  }
  return found
}

const DESCRIBABLE = [...BLOCK_COLLECTIONS, ...BLOCK_GLOBALS, 'media'] as const

const describeFields: SiteTool = {
  name: 'describeFields',
  description:
    "The fields a document or a block holds, so you can write `data` for createDocument and updateDocument or a `block` for insertBlock: name, type, required, options, relationTo (send ids), defaults and the field's own guidance, nested fields included. A `blocks` field lists the block types it takes; send one as `blockType` to describe that block. Rich text takes Lexical JSON unless a write-only `markdown` sibling is listed beside it.",
  parameters: {
    collection: z.enum(DESCRIBABLE).describe('The collection, or the `home` global, by slug.'),
    blockType: z
      .string()
      .optional()
      .describe("A block's slug, from a `blocks` field's list. Omit to describe the collection."),
  },
  handler: async (args, req) => {
    const { collection, blockType } = args as {
      collection: (typeof DESCRIBABLE)[number]
      blockType?: string
    }
    if (!keyAllows(req, collection, 'find')) return cannot('find', collection)
    const fields =
      req.payload.collections[collection as CollectionTarget]?.config.fields ??
      req.payload.globals.config.find((global) => global.slug === collection)?.fields ??
      []
    if (!blockType) return json({ collection, fields: describe(fields) })
    const blocks = blocksIn(fields)
    const block = blocks.get(blockType)
    if (!block) {
      return text(
        `Error: ${collection} has no block "${blockType}". Its blocks: ${[...blocks.keys()].join(', ')}.`,
      )
    }
    return json({ collection, blockType, fields: describe(block.fields) })
  },
}

const dataParam = z
  .record(z.string(), z.unknown())
  .describe('The fields to save, as describeFields lists them. Relationships take ids.')

/** A short receipt instead of the whole document: what was saved, by the fields that were sent. */
const receipt = (collection: Target, saved: Doc, sent: Doc) => ({
  collection,
  id: saved.id,
  _status: saved._status,
  ...(typeof saved.slug === 'string' ? { slug: saved.slug } : {}),
  saved: Object.fromEntries(Object.keys(sent).map((key) => [key, saved[key]])),
})

const createDocument: SiteTool = {
  name: 'createDocument',
  description:
    'Create a page, post or work from plain JSON (describeFields lists the fields). Omit `slug`: it is generated from the title. Saves a draft unless `draft` is false, which publishes. Returns the new id, slug and status. A refused save names each problem by path: fix those and resend.',
  parameters: {
    collection: collectionParam,
    data: dataParam,
    draft: draftParam,
  },
  handler: async (args, req) => {
    const {
      collection,
      data,
      draft = true,
    } = args as { collection: CollectionTarget; data: Doc; draft?: boolean }
    if (!keyAllows(req, collection, 'create')) return cannot('create', collection)
    try {
      const saved = (await req.payload.create({
        collection,
        data: withStatus(data, draft) as never,
        depth: 0,
        draft,
        overrideAccess: false,
        req,
        user: req.user,
      })) as unknown as Doc
      return json(receipt(collection, saved, data))
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const updateDocument: SiteTool = {
  name: 'updateDocument',
  description:
    'Change top-level fields of a page, post, work or the `home` global (title, hero, intro, relationships, the post body, and the rest describeFields lists) without resending the document. Each field sent replaces the stored one whole, so send a complete group or array. Edit blocks with patchBlock, insertBlock, moveBlock and removeBlock, not by resending `layout`. Saves a draft unless `draft` is false, which publishes the document with any other unpublished edits it holds; send `"_status": "draft"` with `draft: false` to unpublish. Returns the saved fields.',
  parameters: {
    ...targetParams,
    data: dataParam,
    draft: draftParam,
  },
  handler: async (args, req) => {
    const {
      collection,
      id,
      data,
      draft = true,
    } = args as { collection: Target; id?: string | number; data: Doc; draft?: boolean }
    if (!keyAllows(req, collection, 'update')) return cannot('update', collection)
    if (Object.keys(data).length === 0) return text('Error: send at least one field in `data`.')
    try {
      const saved = await saveTarget(req, collection, id, data, draft)
      return json(receipt(collection, saved, data))
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const parentParam = z
  .string()
  .optional()
  .describe(
    "A Section block's id to put the block inside it. Omit for the document's top level (`layout`).",
  )

const indexParam = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Position in the list, 0 first. Omit to put it last.')

type BlockArgs = {
  collection: Target
  id?: string | number
  parentId?: string
  index?: number
  draft?: boolean
}

/** Saves a reshaped `layout` and answers where the block landed. */
async function saveLayout(
  req: PayloadRequest,
  { collection, draft = true }: BlockArgs,
  doc: Doc,
  next: Doc,
  blockId?: string,
) {
  const saved = await saveTarget(
    req,
    collection,
    doc.id as string | number,
    { [LAYOUT_FIELD]: next[LAYOUT_FIELD] },
    draft,
  )
  const row = blockId ? findBlock(saved, blockId) : null
  return { saved, row }
}

const noParent = (collection: Target, doc: Doc, parentId?: string) =>
  text(`Error: no Section with id "${parentId}" in ${collection} ${doc.id}`)

const insertBlock: SiteTool = {
  name: 'insertBlock',
  description:
    "Add one block to a page, post, work or the `home` global: at the top level, or inside a Section by the Section's id. `block` needs its `blockType` (describeFields with that blockType lists its fields); leave out `id`, the server assigns one. Saves a draft unless `draft` is false, which publishes. Returns the new block's id and path.",
  parameters: {
    ...targetParams,
    block: z
      .record(z.string(), z.unknown())
      .describe('The block, with `blockType` and its fields.'),
    parentId: parentParam,
    index: indexParam,
    draft: draftParam,
  },
  handler: async (args, req) => {
    const params = args as BlockArgs & { block: Doc }
    const { collection, id, block, parentId, index } = params
    if (!keyAllows(req, collection, 'update')) return cannot('update', collection)
    if (typeof block.blockType !== 'string') return text('Error: `block` needs a `blockType`.')
    try {
      const doc = await readTarget(req, collection, id)
      const container = containerPath(doc, parentId)
      if (!container) return noParent(collection, doc, parentId)
      const { id: _ignored, ...fresh } = block
      const next = withInserted(doc, container, fresh, index)
      const { saved } = await saveLayout(req, params, doc, next)
      const rows = valueAt(saved, containerPath(saved, parentId) ?? container)
      const list = Array.isArray(rows) ? (rows as Doc[]) : []
      const at = index === undefined ? list.length - 1 : Math.min(index, list.length - 1)
      const created = list[at]
      return json({
        _status: saved._status,
        path: `${containerPath(saved, parentId) ?? container}.${at}`,
        id: isRecord(created) ? created.id : undefined,
        blockType: isRecord(created) ? created.blockType : block.blockType,
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const moveBlock: SiteTool = {
  name: 'moveBlock',
  description:
    "Move one block of a page, post, work or the `home` global by its id: to another position, into a Section (by the Section's id), or out to the top level. Saves a draft unless `draft` is false, which publishes. Returns the block's new path.",
  parameters: {
    ...targetParams,
    blockId: z.string().describe('The block id from outlineDocument or locateBlock.'),
    parentId: parentParam,
    index: indexParam,
    draft: draftParam,
  },
  handler: async (args, req) => {
    const params = args as BlockArgs & { blockId: string }
    const { collection, id, blockId, parentId, index } = params
    if (!keyAllows(req, collection, 'update')) return cannot('update', collection)
    try {
      const doc = await readTarget(req, collection, id)
      const row = findBlock(doc, blockId)
      if (!row) return text(`Error: no block with id "${blockId}" in ${collection} ${doc.id}`)
      if (parentId && findBlock(row.block, parentId)) {
        return text('Error: a block cannot move inside itself.')
      }
      if (parentId === blockId) return text('Error: a block cannot move inside itself.')
      const without = withoutBlock(doc, row.path)
      const container = containerPath(without, parentId)
      if (!container) return noParent(collection, doc, parentId)
      const next = withInserted(without, container, row.block, index)
      const { saved, row: moved } = await saveLayout(req, params, doc, next, blockId)
      return json({ _status: saved._status, path: moved?.path, id: blockId })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

const removeBlock: SiteTool = {
  name: 'removeBlock',
  description:
    'Remove one block from a page, post, work or the `home` global by its id, nested blocks with it. Only when the user asks. Saves a draft unless `draft` is false, which publishes, so the live page keeps the block until then. Returns what was removed.',
  parameters: {
    ...targetParams,
    blockId: z.string().describe('The block id from outlineDocument or locateBlock.'),
    draft: draftParam,
  },
  handler: async (args, req) => {
    const params = args as BlockArgs & { blockId: string }
    const { collection, id, blockId } = params
    if (!keyAllows(req, collection, 'update')) return cannot('update', collection)
    try {
      const doc = await readTarget(req, collection, id)
      const row = findBlock(doc, blockId)
      if (!row) return text(`Error: no block with id "${blockId}" in ${collection} ${doc.id}`)
      const { saved } = await saveLayout(req, params, doc, withoutBlock(doc, row.path))
      return json({
        _status: saved._status,
        removed: { id: blockId, blockType: row.blockType, path: row.path },
      })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

/** The key's own media-authoring switch (`uploadMedia` in `mcp.ts`). */
const mayAuthorMedia = (req: PayloadRequest): boolean =>
  Boolean((req.context.mcpApiKey as { uploadMedia?: boolean } | undefined)?.uploadMedia)

const updateMedia: SiteTool = {
  name: 'updateMedia',
  description:
    "Set an image or video's alt text and caption by its media id. `caption` is Markdown, converted on save; it overwrites an existing caption only with `replace: true`. Needs the key's Upload media capability. The file itself is never touched: new files go through `pnpm cms:upload`.",
  parameters: {
    id: z.number().describe('The media id.'),
    alt: z
      .string()
      .nullable()
      .optional()
      .describe('What the image shows, for screen readers and search.'),
    caption: z.string().optional().describe('Markdown for the caption.'),
    replace: z.boolean().optional().describe('true overwrites a caption that already has content.'),
  },
  handler: async (args, req) => {
    const { id, alt, caption, replace } = args as {
      id: number
      alt?: string | null
      caption?: string
      replace?: boolean
    }
    if (!mayAuthorMedia(req)) return cannot('update', 'media')
    if (alt === undefined && caption === undefined) return text('Error: send `alt` or `caption`.')
    try {
      const saved = (await req.payload.update({
        collection: 'media',
        id,
        data: {
          ...(alt !== undefined ? { alt } : {}),
          ...(caption !== undefined ? { markdown: caption, replace } : {}),
        } as never,
        depth: 0,
        overrideAccess: false,
        req,
        user: req.user,
      })) as unknown as Doc
      return json({ id: saved.id, alt: saved.alt, caption: saved.caption })
    } catch (error) {
      return text(errorText(error))
    }
  },
}

export const documentTools: SiteTool[] = [
  describeFields,
  createDocument,
  updateDocument,
  insertBlock,
  moveBlock,
  removeBlock,
  updateMedia,
]
