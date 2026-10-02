import { sql } from '@payloadcms/db-vercel-postgres'
import type { PayloadRequest } from 'payload'
import { transactionDB } from './transaction'

export type LookUse = {
  /** The collection or global, as the admin labels it. */
  content: string
  title: string
  url: string
  /** Only the document's unpublished draft uses the field so far. */
  draft: boolean
  /** Only retained versions use it: the document and its latest draft have moved on. */
  historical: boolean
}

type Root = { label: string; url: string; global: boolean }
type Row = Record<string, unknown>
type Tables = Record<string, Record<string, unknown> | undefined>

/** Every collection and global by its table name: where a chain of block parents ends. */
function rootTables(req: PayloadRequest) {
  const tableOf = (slug: string) =>
    req.payload.db.tableNameMap.get(slug.replaceAll('-', '_')) ?? slug.replaceAll('-', '_')
  const roots = new Map<string, Root>()
  for (const collection of req.payload.config.collections) {
    roots.set(tableOf(collection.slug), {
      label:
        typeof collection.labels.plural === 'string' ? collection.labels.plural : collection.slug,
      url: `/admin/collections/${collection.slug}`,
      global: false,
    })
  }
  for (const global of req.payload.config.globals) {
    roots.set(tableOf(global.slug), {
      label: typeof global.label === 'string' ? global.label : global.slug,
      url: `/admin/globals/${global.slug}`,
      global: true,
    })
  }
  return roots
}

/** The uses one slot column holds, joined up to its owner; `null` when no owner is reached. */
function usageQuery(
  reference: Row,
  edges: Row[],
  roots: Map<string, Root>,
  tables: Tables,
  id: number,
) {
  const joins = []
  let table = String(reference.source)
  let alias = 'r0'
  let depth = 0
  // The versions table on the way up carries `latest`: the newest draft.
  let versions = tables[table]?.latest ? alias : null
  while (!roots.has(table) && depth < 8) {
    const parent = edges.find(
      (row) => row.source === table && ['_parent_id', 'parent_id'].includes(String(row.field)),
    )
    if (!parent) break
    const next = `r${++depth}`
    joins.push(
      sql`JOIN ${sql.identifier(String(parent.target))} AS ${sql.identifier(next)} ON ${sql.identifier(next)}.id::text = ${sql.identifier(alias)}.${sql.identifier(String(parent.field))}::text`,
    )
    table = String(parent.target)
    alias = next
    if (!versions && tables[table]?.latest) versions = alias
  }
  const root = roots.get(table)
  if (!root) return null
  const title = tables[table]?.title ? sql`${sql.identifier(alias)}.title` : sql`${root.label}`
  const latest = versions ? sql`COALESCE(${sql.identifier(versions)}.latest, false)` : sql`false`
  // A bare parameter in a UNION comes back as text, and the string 'false' is
  // truthy: the flags are cast so they arrive as booleans.
  return sql`SELECT ${root.label} AS content, ${title} AS title, ${root.url} AS base_url, ${root.global}::boolean AS is_global, ${String(reference.source).startsWith('_')}::boolean AS versioned, ${latest} AS latest, ${sql.identifier(alias)}.id::text AS document_id FROM ${sql.identifier(String(reference.source))} AS r0 ${sql.join(joins, sql` `)} WHERE r0.${sql.identifier(String(reference.field))} = ${id}`
}

const rank = (use: LookUse) => (use.historical ? 0 : use.draft ? 1 : 2)

/** One use per document: its strongest claim. */
function strongestUses(rows: Row[]) {
  const uses = new Map<string, LookUse>()
  for (const row of rows) {
    const url = row.is_global ? String(row.base_url) : `${row.base_url}/${row.document_id}`
    const known = uses.get(url)
    const use: LookUse = {
      content: String(row.content),
      title: String(row.title ?? row.content),
      url,
      draft: Boolean(row.versioned) && Boolean(row.latest),
      historical: Boolean(row.versioned) && !row.latest,
    }
    if (!known || rank(use) > rank(known)) uses.set(url, use)
  }
  return [...uses.values()]
}

/**
 * Where a look is used: every visual slot stores it in a `…studio_id` column,
 * so the foreign keys are the index. Each one is followed up through its block
 * parents to the collection or global that owns it. A document counts once, by
 * its strongest claim: the document itself, else its latest draft, else its
 * retained versions.
 */
export async function lookUsage(req: PayloadRequest, id: number): Promise<LookUse[]> {
  // Inside a delete this runs in the delete's transaction, so it reads what that write reads.
  const db = await transactionDB(req)
  const edges = await db.execute(sql`
    SELECT c.conrelid::regclass::text AS source, c.confrelid::regclass::text AS target, a.attname AS field
    FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f' AND ((c.confrelid = 'streak_looks'::regclass AND a.attname LIKE '%studio_id') OR a.attname IN ('_parent_id', 'parent_id'))`)
  const roots = rootTables(req)
  const tables = req.payload.db.tables as Tables
  const queries = []
  for (const reference of edges.rows.filter((row) => String(row.field).endsWith('studio_id'))) {
    const query = usageQuery(reference, edges.rows, roots, tables, id)
    if (query) queries.push(query)
  }
  if (!queries.length) return []
  const result = await db.execute(
    sql`SELECT DISTINCT * FROM (${sql.join(queries, sql` UNION ALL `)}) AS usages LIMIT 200`,
  )
  return strongestUses(result.rows)
}
