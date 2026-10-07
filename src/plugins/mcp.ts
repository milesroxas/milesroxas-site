import { type MCPPluginConfig, mcpPlugin } from '@payloadcms/plugin-mcp'
import type { CollapsibleField, CollectionSlug, Field, GroupField, Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { ASK_QUESTION_RETENTION_DAYS } from '@/features/ask/retention'
import { withMcpDeleteConfirmation } from '@/plugins/mcp-delete-confirmation'
import { MCP_INSTRUCTIONS } from '@/plugins/mcp-instructions'
import { mcpSiteTools } from '@/plugins/mcp-tools'
import { withMcpWriteChecks } from '@/plugins/mcp-write-checks'
import { LOOKS_SLUG } from '@/plugins/streak-studio/components/paths'
import { CONTENT_SURFACES } from '@/shared/content/surfaces'

/**
 * The portfolio's MCP server at /api/mcp, registered in clients as
 * `milesroxas-cms` (docs/mcp.md). Ported from sas-site's `sas-cms`.
 *
 * Agents authenticate with per-key Bearer tokens (admin → System → API Keys).
 * Every tool call runs through Payload access control (`overrideAccess: false`)
 * as the user linked to the key, and each operation below must ALSO be
 * switched on per key: the checkboxes default to off, so a new key can do
 * nothing until an admin grants it capabilities.
 *
 * Every authorable collection and global in the config is listed below. The
 * exceptions are structural, not oversights:
 *
 * - `users` and the MCP API-keys collection: the auth and capability control
 *   plane. A key that could write either would be able to mint an admin or
 *   widen its own capabilities.
 * - `search` (rebuilt by plugin hooks, so writes are clobbered) and Payload's
 *   internals (`payload-jobs`, `payload-kv`, `payload-folders`,
 *   `payload-locked-documents`, `payload-preferences`, `payload-migrations`):
 *   infrastructure, and the migration ledger is CI's.
 *
 * Studio looks are authorable as drafts only. A look is published from the
 * Studio, where the editor's browser renders its posters, and the collection's
 * own hook refuses any other publish.
 *
 * Deletes are never one call: `mcp-delete-confirmation.ts` makes every
 * delete-enabled collection below answer the first call with what it would
 * delete and a token, and only the second call, carrying the token, deletes.
 *
 * Visitor-sourced rows are exposed read-only, never for authoring: they carry
 * contact PII (`inquiries`, `form-submissions`) or visitor questions
 * (`ask-questions`, redacted on write with no IP or visitor id). Reading what
 * people ask, what the site cannot answer, and who is waiting on a reply is
 * exactly the job an agent is for. Like everything here, a key still needs the
 * capability ticked before it can read them.
 */

type McpCollectionEntry = NonNullable<NonNullable<MCPPluginConfig['collections']>[CollectionSlug]>

/** Full authoring: agents may draft, edit, and (when granted) delete. */
const AUTHORING = { create: true, delete: true, find: true, update: true } as const

/** Reference data agents may read but never mutate. */
const READ_ONLY = { find: true } as const

/** What each public surface is, beyond its URL. */
const SURFACE_NOTES: Record<string, string> = {
  pages: 'The home page is the one with slug `home`.',
  works:
    'Case studies of client and personal work. `isProtected` hides a work behind an access link: treat it as confidential and never quote it in public copy. `fallbackWork` is the public work shown in its place.',
  posts:
    'Long-form writing. The body is `content` (rich text); `layout` holds extra blocks. `source: external` is an article published elsewhere: `external.url` (https) is the original, `intro.body` is the note that introduces it, and `content`/`layout` stay empty because the page links out instead.',
}

/** Site plumbing behind the published pages. */
const OPERATIONS: Record<string, string> = {
  categories: 'Post categories (nested). Posts link to them by id',
  clients: 'Clients a work was made for. A work links to one by id in `client`',
  forms:
    'Form definitions (fields, confirmation behaviour, emails) that pages embed. Submitted data lives in `form-submissions`',
  redirects: 'URL redirects: a source path pointing at a document or an external URL',
}

/** Visitor-submitted records. Read-only: every one of these carries contact PII or visitor text. */
const VISITOR_RECORDS: Record<string, string> = {
  'ask-questions': `Every turn in the site Ask box (redacted question and answer, sources with similarity, outcome, rating, handoff; no visitor ids; deleted after ${ASK_QUESTION_RETENTION_DAYS} days). \`outcome: no_sources\` marks questions the site had no content for. Read-only`,
  'form-submissions':
    'Data submitted through site forms, including whatever contact details the form collects. Read-only',
  inquiries:
    'Contact-form and Ask handoff inquiries: name, email, message, and triage state for each lead. Read-only',
}

const entries = (records: Record<string, string>, enabled: McpCollectionEntry['enabled']) =>
  Object.entries(records).map(([slug, description]) => [slug, { description, enabled }] as const)

const collections: MCPPluginConfig['collections'] = Object.fromEntries([
  // Publishing surfaces with public URLs. Draft-enabled; agents are
  // instructed to author as drafts and publish only on explicit request.
  ...CONTENT_SURFACES.map(
    (surface) =>
      [
        surface.collection,
        {
          description: [
            `${surface.title}: published under ${surface.urlPrefix || '/'}.`,
            SURFACE_NOTES[surface.collection] ?? '',
          ]
            .join(' ')
            .trim(),
          enabled: AUTHORING,
        },
      ] as const,
  ),
  ...entries(OPERATIONS, AUTHORING),
  ...entries(VISITOR_RECORDS, READ_ONLY),
  // Drafts only: the collection refuses a publish that does not come from the
  // Studio, where the posters are rendered.
  ...entries(
    {
      [LOOKS_SLUG]:
        "Studio looks: authored visual effects (streak field, light leak) that a visual slot references by id in its `studio` field. Draft one with a title, an `effect` and a `recipe` whose `deltas` hold only the parameters that leave their default. You cannot see a look and cannot publish it here: say so, and ask the user to open it in the admin Studio, check it and publish. Set `archived` to retire a look that is still in use. A slot only accepts a published look of the slot's own effect, so a page only publishes with one",
    },
    AUTHORING,
  ),
  // Media stays read-only: MCP tools cannot send binary uploads. Images come in
  // through `pnpm cms:upload` (`uploadMediaCapability` below).
  ...entries(
    {
      media:
        'Uploaded images and videos. Read-only over MCP: reference existing documents by id. New images go through `pnpm cms:upload`',
    },
    READ_ONLY,
  ),
])

const globals: MCPPluginConfig['globals'] = {
  'contact-page': {
    description:
      'The copy on /contact: form heading, lead, placeholder, the sent state, and SEO. Reply time and email address live in Site Info',
    enabled: { find: true, update: true },
  },
  header: {
    description: 'The dock: `navItems`, the links shown as its tabs (at most 6)',
    enabled: { find: true, update: true },
  },
  'site-info': {
    description:
      'Site-wide facts the Ask assistant answers from (name, tagline, description, contact), the inquiry promises, and the Ask switch',
    enabled: { find: true, update: true },
  },
  'works-index': {
    description:
      'The works landing page at /works: its heading, lead and SEO. The list of works is automatic (published works in collection order)',
    enabled: { find: true, update: true },
  },
}

const CONTROLS_COMPONENT = '@/components/McpCapabilityControls'

/**
 * Matches the plugin-generated capability fields: a sidebar collapsible
 * wrapping a single named group whose label is the literal configType
 * ('collection' | 'global'), the source of the odd type hierarchy in the
 * sidebar.
 */
type CapabilityGroup = Extract<GroupField, { name: string }>

const capabilityGroup = (field: Field): CapabilityGroup | null => {
  if (field.type !== 'collapsible' || field.fields.length !== 1) return null
  const [group] = field.fields
  if (group.type !== 'group' || !('name' in group)) return null
  return group.label === 'collection' || group.label === 'global' ? group : null
}

/** One section without its group heading or checkbox descriptions, led by its own "Select all". */
const restyledSection = (
  field: CollapsibleField,
  group: CapabilityGroup,
  ops: string[],
  label: string,
): Field => ({
  ...field,
  admin: { ...field.admin, className: 'mcp-capability-section' },
  label,
  fields: [
    {
      ...group,
      fields: [
        {
          name: 'toggleAll',
          type: 'ui',
          admin: {
            components: {
              Field: {
                clientProps: { ops, section: group.name },
                path: `${CONTROLS_COMPONENT}#SectionToggleAll`,
              },
            },
          },
        },
        ...group.fields.map(
          (f): Field =>
            f.type === 'checkbox' ? { ...f, admin: { ...f.admin, description: undefined } } : f,
        ),
      ],
      label: false,
    },
  ],
})

/**
 * Restyles the generated capability sections and adds bulk controls:
 * - drops the redundant 'collection'/'global' group heading and the
 *   per-checkbox "Allow clients to…" descriptions (labels carry the meaning)
 * - prepends a tri-state "Select all" checkbox to each section
 * - inserts a toolbar above the sections with select-all / deselect-all
 *   across every capability plus an enabled count
 */
const withCapabilityControls = (fields: Field[]): Field[] => {
  const sections: { label: string; ops: string[]; path: string }[] = []

  const transformed = fields.map((field): Field => {
    const group = capabilityGroup(field)
    if (!group || field.type !== 'collapsible') return field

    const ops = group.fields.flatMap((f) => (f.type === 'checkbox' && 'name' in f ? [f.name] : []))
    const label = typeof field.label === 'string' ? field.label : group.name
    sections.push({ label, ops, path: group.name })
    return restyledSection(field, group, ops, label)
  })

  const firstSectionIndex = fields.findIndex((field) => capabilityGroup(field) !== null)
  if (firstSectionIndex === -1) return transformed

  transformed.splice(firstSectionIndex, 0, {
    name: 'capabilitiesToolbar',
    type: 'ui',
    admin: {
      components: {
        Field: {
          clientProps: { sections },
          path: `${CONTROLS_COMPONENT}#CapabilitiesToolbar`,
        },
      },
      position: 'sidebar',
    },
  })

  return transformed
}

/**
 * The one capability that is not an MCP tool. MCP cannot carry a binary, so
 * media is added through `POST /api/agent/media` (`endpoints/agentMedia.ts`)
 * with the same key, and that endpoint reads this checkbox. It is its own
 * field rather than `create` on the media entry above because that would
 * register a create tool that can never receive a file. Off by default, like
 * every capability.
 */
const uploadMediaCapability: Field = {
  name: 'uploadMedia',
  type: 'checkbox',
  label: 'Upload media',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: 'Allow `pnpm cms:upload` with this key.',
  },
}

/**
 * The plugin registers a custom tool's checkbox with `defaultValue: true`, the
 * opposite of every collection capability. Off, like the rest: a key gets a
 * site tool when a team member ticks it.
 */
const withToolsOffByDefault = (fields: Field[]): Field[] =>
  fields.map((field): Field => {
    if (field.type !== 'collapsible' || field.label !== 'Tools') return field
    return {
      ...field,
      fields: field.fields.map(
        (group): Field =>
          group.type === 'group' && 'name' in group && group.name === 'payload-mcp-tool'
            ? {
                ...group,
                fields: group.fields.map(
                  (f): Field => (f.type === 'checkbox' ? { ...f, defaultValue: false } : f),
                ),
              }
            : group,
      ),
    }
  })

/** Every collection a key can be granted `create` or `update` on: the ones the copy checks guard. */
const writable = new Set(
  Object.entries(collections ?? {}).flatMap(([slug, entry]) =>
    entry?.enabled &&
    typeof entry.enabled === 'object' &&
    (entry.enabled.create || entry.enabled.update)
      ? [slug]
      : [],
  ),
)

const writableGlobals = new Set(
  Object.entries(globals ?? {}).flatMap(([slug, entry]) =>
    entry?.enabled && typeof entry.enabled === 'object' && entry.enabled.update ? [slug] : [],
  ),
)

/** Every collection a key can be granted `delete` on: the ones the confirmation guards. */
const deletable = new Set(
  Object.entries(collections ?? {}).flatMap(([slug, entry]) =>
    entry?.enabled && typeof entry.enabled === 'object' && entry.enabled.delete ? [slug] : [],
  ),
)

const server: Plugin = mcpPlugin({
  collections,
  globals,
  mcp: {
    serverOptions: {
      serverInfo: { name: 'Miles Roxas Portfolio CMS', version: '1.0.0' },
      instructions: MCP_INSTRUCTIONS,
    },
    tools: mcpSiteTools,
  },
  // The plugin's own key lookup, kept; the key document is put on the request
  // so the site tools can check the collection capabilities it carries, the
  // way the generated tools are gated at registration.
  overrideAuth: async (req, getDefaultMcpAccessSettings) => {
    const key = await getDefaultMcpAccessSettings()
    req.context.mcpApiKey = key
    return key
  },
  // The key collection is the capability control plane: only team members may
  // see or manage keys. Without this it falls back to Payload's default
  // `Boolean(req.user)` access, which would let any authenticated principal,
  // including an MCP key itself via REST API-key auth, read keys or escalate
  // its own capabilities.
  overrideApiKeyCollection: (collection) => ({
    ...collection,
    access: {
      create: authenticated,
      delete: authenticated,
      read: authenticated,
      update: authenticated,
    },
    admin: { ...collection.admin, group: 'System' },
    fields: [
      ...withToolsOffByDefault(withCapabilityControls(collection.fields)),
      uploadMediaCapability,
    ],
  }),
})

export const mcp: Plugin = (config) =>
  server(
    withMcpWriteChecks(withMcpDeleteConfirmation(config, deletable), writable, writableGlobals),
  )
