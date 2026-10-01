/**
 * The ground rules every MCP client receives when it connects to /api/mcp, and
 * the one place they live: docs/mcp.md points here instead of restating them.
 *
 * Only rules that cut across tools belong here. A rule for one collection is
 * that collection's `description` in `mcp.ts`, which the plugin turns into the
 * description of its tools, so it arrives with the tool.
 *
 * Claude Code keeps the first 2048 characters of server instructions and drops
 * the rest without a warning (found on sas-site, 2026-09-21).
 * `mcp-instructions.test.ts` holds the limit.
 */
export const MCP_INSTRUCTIONS_LIMIT = 2048

export const MCP_INSTRUCTIONS = [
  "Content authoring server for Miles Roxas's portfolio site: Pages, Works (case studies) and Posts, plus Site Info, the Header and the Contact page.",
  'Author as drafts (draft: true); publish only when the user explicitly asks.',
  'Find where the site talks about something with findContent (published copy, judged on the server). Edit one block: locateBlock or outlineDocument finds it, getBlock and patchBlock take its id. A whole-document update must keep every block `id`: blocks sent without ids replace the rows.',
  'Relationship fields take document ids: look them up with a find tool.',
  'Omit `slug` and `generateSlug`; if a create tool requires one, send a short URL-safe value.',
  "Rich text takes Lexical JSON, except a field with a write-only `markdown` sibling (a Rich text block's `body`): send Markdown there. It refuses syntax the field cannot hold and replaces existing content only with `replace: true`.",
  'Charts and diagrams are `chart` and `diagram` blocks with a JSON `spec` (see the tool schema); every figure needs a `textAlternative`. Never send `geometry`: it is computed on save.',
  'A refused save names each problem by path: fix those and resend.',
  "A visual slot's `studio` field takes a Studio look id: the streak-looks tools explain looks.",
  'A work with `isProtected` is client work behind an access link: never quote it in public copy.',
  'Delete only when the user asks; prefer a reversible step (unpublish, or `archived` on a look). A delete takes two calls: do what the first answers.',
  'Add images with `pnpm cms:upload` (docs/mcp.md).',
  'Inquiries, form submissions and Ask questions hold visitor contact details: read them for analysis and triage only, and never copy them into content or send them outside this workspace.',
  'House style for all copy: plain and specific, no hype, never an em dash. A save with an em dash is refused, by path.',
].join(' ')
