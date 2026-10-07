# MCP: agent authoring (`milesroxas-cms`)

The site runs a [Model Context Protocol](https://modelcontextprotocol.io) server at **`/api/mcp`** so
agents (Claude Code, Codex, Cursor) can author and manage CMS content through Payload's access
control instead of raw REST calls. Clients register it as **`milesroxas-cms`**; the server calls
itself "Miles Roxas Portfolio CMS".

Ported from sas-site's `sas-cms` (its `docs/mcp.md` and `docs/typesafe-mcp-roadmap.md`), with one
tool that sas-site's roadmap had left as the next step: `findContent`.

| Piece | Where |
| --- | --- |
| Plugin config: what is exposed, key collection, capability controls | [`src/plugins/mcp.ts`](../src/plugins/mcp.ts) |
| Server instructions every client receives (2,048 characters at most) | [`src/plugins/mcp-instructions.ts`](../src/plugins/mcp-instructions.ts) |
| Site tools: `findContent`, `outlineDocument`, `locateBlock`, `getBlock`, `patchBlock` | [`src/plugins/mcp-tools/`](../src/plugins/mcp-tools/index.ts) |
| Copy checks on every MCP write | [`src/plugins/mcp-write-checks.ts`](../src/plugins/mcp-write-checks.ts) |
| Two-call delete | [`src/plugins/mcp-delete-confirmation.ts`](../src/plugins/mcp-delete-confirmation.ts) |
| Image upload with an MCP key | [`src/endpoints/agentMedia.ts`](../src/endpoints/agentMedia.ts), `pnpm cms:upload` |
| Admin UI for key capabilities | [`src/components/McpCapabilityControls`](../src/components/McpCapabilityControls/index.tsx) |

Built on `@payloadcms/plugin-mcp`, pinned to the Payload release line (`3.90.2`) and patched
([Versions and the vendored patch](#versions-and-the-vendored-patch)).

## Connecting a client

`milesroxas-cms` names one site at a time. **Until `dev` ships to `main`, it points at the `dev`
branch deployment**, `https://milesroxas-git-dev-roxas.vercel.app` (the branch alias, stable across
deploys). At cutover it moves to production, `https://milesroxas.com`.

Keys are rows in a database, and each deployment has its own: a key made in the dev deployment's
admin works only there, and production needs its own key.

1. In that deployment's admin, **System → API Keys → Create**. Link it to your user, turn on
   **Enable API Key**, and tick the capabilities the agent needs. Everything is off by default,
   the site tools included: a new key can do nothing.
2. **Preview only:** preview deployments sit behind Vercel Authentication, which answers an MCP
   client with a redirect to `vercel.com/sso-api`. In Vercel, **Project Settings → Deployment
   Protection → Protection Bypass for Automation**, create a secret, and send it as
   `x-vercel-protection-bypass`. Production needs no bypass.
3. Register the server:

```bash
# Claude Code, while dev is the working site
claude mcp add milesroxas-cms --transport http https://milesroxas-git-dev-roxas.vercel.app/api/mcp \
  --header "Authorization: Bearer <dev-api-key>" \
  --header "x-vercel-protection-bypass: <bypass-secret>"

# Claude Code, after cutover: remove the dev entry, then register production
claude mcp remove milesroxas-cms
claude mcp add milesroxas-cms --transport http https://milesroxas.com/api/mcp \
  --header "Authorization: Bearer <production-api-key>"

# Codex (CLI and the ChatGPT desktop app share ~/.codex/config.toml)
codex mcp add milesroxas-cms --url https://milesroxas-git-dev-roxas.vercel.app/api/mcp \
  --bearer-token-env-var MILESROXAS_CMS_MCP_KEY
# then, for dev, add the bypass header to that server's entry in ~/.codex/config.toml
```

`pnpm cms:upload` reads the same entry, bypass header included, so uploads land in the database the
agent drafts in. Local dev serves the endpoint at `http://localhost:3000/api/mcp` against the
Docker database (keys made in the local admin).

## Authentication and the capability model

- Every tool call runs **as the user linked to the key**, with `overrideAccess: false`, so the
  collection access rules apply as they do in the admin.
- On top of that, every operation (find, create, update, delete, per collection or global) and
  every site tool must be ticked on the key. The plugin ships custom tools on by default;
  `withToolsOffByDefault` in `mcp.ts` flips them off like everything else.
- The key collection itself is team-only (`authenticated` on read, create, update and delete).
  Without that override, Payload's default `Boolean(req.user)` would let a key read other keys or
  widen its own capabilities over REST.

## What is exposed

The source of truth is `mcp.ts`; this table mirrors it.

| Group | Collections / globals | Capabilities offered |
| --- | --- | --- |
| Public surfaces | Every `CONTENT_SURFACES` collection: `pages`, `works`, `posts` | Full authoring |
| Operations | `categories`, `clients`, `forms`, `redirects` | Full authoring |
| Assets | `streak-looks` | Full authoring, **drafts only**: a look is published from the Studio |
| Assets | `media` | **Read-only**. New images go through `pnpm cms:upload` |
| Visitor records | `inquiries`, `form-submissions`, `ask-questions` | **Read-only** |
| Globals | `site-info`, `header`, `contact-page`, `works-index` | Find and update |

A new surface added to `CONTENT_SURFACES` is exposed automatically. Any other new collection or
global is **not** exposed until it is listed in `mcp.ts`, and the capability columns it adds need a
migration.

**Deliberately excluded:** `users` and `payload-mcp-api-keys` (the auth and capability control
plane), `search` (a derived index its hooks rebuild), and Payload's internal collections.

**Protected works.** A work with `isProtected` is client work behind an access link. The key's user
can read and edit it like any work, but `locateBlock` never sends it to TypeSafe, it is never in the
Ask index that `findContent` searches, and the server instructions forbid quoting it in public copy.

**Visitor records** carry contact details. They are there for analysis and triage (what people ask,
what the site cannot answer, who is waiting on a reply). The server instructions forbid copying
them into content; the email half of that rule is enforced (below).

## Site tools

The generated tools move whole documents: `find*` returns the page, `update*` resends the whole
`layout` as the client model's output tokens. The site tools move one block, or a handful of
snippets, instead. Each needs its checkbox on the key, plus `find` (or `update` for `patchBlock`) on
the collection it touches.

| Tool | Does | Judged by |
| --- | --- | --- |
| `findContent` | Where the published site talks about a topic: passages best first, with collection, document id, url, section heading, snippet, and how much of the passage is about the topic | Vector search, then Jev per passage |
| `outlineDocument` | One row per block, nested blocks included: path, id, type, name, child count, first 200 characters | Code |
| `locateBlock` | Which block an editing instruction means: `found`, `unsure` or `none`, and the likely blocks with a probability each | Jev |
| `getBlock` | One block by id, exactly as stored | Code |
| `patchBlock` | Merges a partial block on the server and saves a draft (publishes only with `draft: false`) | Code |

The intended flow for "change what the site says about X": `findContent` (which documents) →
`locateBlock` on each with the user's words (which block) → `getBlock` → `patchBlock`. No page
reaches the client's model.

### How TypeSafe is used

Both judgments run on the server with TypeSafe's Jev, the same key and pinned model
(`jev-1.13.0`) as the Ask judge. The client never pays for them and never sees the pages they read.
Code owns every threshold (`LOCATE_THRESHOLDS`, `FIND_THRESHOLDS`); Jev answers typed questions.

- **`locateBlock`** is TypeSafe's line-by-line search cookbook, ported unchanged from sas-site
  (10 of 10 on its eval). Code tags each outline row and joins them into one state. In one request
  a Choice over the tags answers *which* block, and a Noul answers *whether any* block fits,
  because a Choice always crowns something. `found` needs both the Noul and the Choice's confidence
  at 0.5 or more.
- **`findContent`** is the RAG-passage and re-ranking cookbooks. Code retrieves the 24 nearest
  chunks from the Ask index (`ask_embeddings`: published copy only, protected works never in it)
  with a low similarity floor, then sends **one request per chunk**, in parallel, because a state
  full of unrelated passages costs Jev accuracy. Each request asks two independent questions: a
  Noul (`mentions`: does the passage touch the topic at all, by name or in other words) keeps or
  drops, and a Score (`focus`: passing, part, or all of it) orders what is kept. Rows sort by the
  Score's level, then the Noul; the Score's expectation is never used as a fine-grained number,
  which jev-1.13's docs warn against. The topic is redacted before it leaves the server.

Measured locally on 2026-09-29 with `jev-1.13.0` over all 62 chunks of the site's published copy
(no embedding step), so every chunk was judged:

| Topic | Kept | Notes |
| --- | --- | --- |
| Webflow | 4 | All 4 chunks that name it; 2 `subject`, 2 `part` |
| design systems | 11 | The design-systems case study first |
| no-code website builders | 3 | Codalyn and the low-code work, neither says "no-code" |
| managing a team of designers | 5 | "I lead a team of strategists…", the studio post |
| pricing, Buzlee, scuba diving | 0 | None is on the site |

About 600 Jev input tokens a passage, 250 to 550 ms a query. In production a query judges at most
24 passages, about 15K tokens: under a tenth of a cent. `locateBlock` on the home page answered
"change the headline at the top" `found` (0.99) and "fix the FAQ about pricing" `none` (exists
0.02). These are small checks written by the tools' author; real instructions are the next test.

### What each needs on the server

| | `TYPESAFE_API_KEY` | `OPENAI_API_KEY` (Ask index) |
| --- | --- | --- |
| `locateBlock` | Required: without it the tool says so and points at `outlineDocument` | No |
| `findContent` | Optional: without it, rows come back in similarity order, marked `judged: false` | Required, and the index must be backfilled |

## House rules enforced on MCP writes

A `beforeChange` hook on every collection and global a key can write checks copy that arrives over
MCP (`req.payloadAPI === 'MCP'`); saves from the admin, REST and the Local API are untouched.
`patchBlock` goes through it too.

- **No em dash in copy**, rich text included (the rule the Ask prompts also give the writing
  model). A numeric range (`50—100K`) passes; code, specs and identifiers are skipped.
- **No visitor email in copy.** An address in the copy is looked up in `inquiries` and
  `form-submissions`; a match refuses the save.

Only copy that differs from the stored document is checked, so an old em dash in an untouched block
never blocks an edit. A refusal names each problem by path, so the agent fixes it without rereading
the document:

```
Not saved: 1 problem in the copy of pages. Fix each and resend.
layout.0.blockName: em dash in "Hero — test". House style: recast with a comma, a colon, parentheses or a period.
```

## Deleting

Every delete over MCP takes two calls. The first deletes nothing: it answers with the document it
would delete and a token. The agent shows the user and, after an explicit yes, calls again with the
token in `confirm`. The token is an HMAC of the collection, id and `updatedAt` under the Payload
secret, so it names one document in one state and stops working if the document changes. A `where`
delete can never pass.

## Adding images

MCP cannot carry a binary, and a key fails every team-only REST rule, so `POST /api/media` is
closed to it. `POST /api/agent/media` is the narrow door: the same Bearer key, the key's
**Upload media** checkbox, alt text required, the bytes decoded as JPEG, PNG or WebP whatever the
request claims, and the image re-encoded as WebP (compressed, all metadata dropped).

```bash
pnpm cms:upload <file> --alt "<what it shows>" [--caption "<text>"] [--local]
```

The script takes the site, the key and any `x-vercel-protection-bypass` header from Claude Code's
`milesroxas-cms` entry, so an uploaded media id always exists in the database the MCP client drafts
in. `CMS_MCP_API_KEY` (else `MILESROXAS_CMS_MCP_KEY`), `CMS_UPLOAD_SERVER` and
`VERCEL_AUTOMATION_BYPASS_SECRET` override it. A local site needs `--local`.

The endpoint answers `{ id, cloudflareImageId }`. A null `cloudflareImageId` means the file is on
Blob but the Cloudflare Images sync failed (the server log has `[Cloudflare] Upload failed`), and
the script warns on stderr. The sync runs after the storage adapter has written the file, from
`cloudflareMediaSync` in `src/collections/Media/hooks/syncCloudflare.ts`.

## Security: the REST rule

MCP keys authenticate as `req.user` over REST and GraphQL too, not only at `/api/mcp`, and the
per-key checkboxes gate only the MCP endpoint. So:

1. [`authenticated`](../src/access/authenticated.ts) counts only `user.collection === 'users'`.
2. Reads with a public subset use [`authenticatedOr(where)`](../src/access/authenticatedOr.ts):
   Pages and Posts (published), Works (published and not protected).
3. Plugin collections whose writes default to `Boolean(req.user)` (redirects, forms, form
   submission deletes, search) are overridden to `authenticated` in
   [`src/plugins/index.ts`](../src/plugins/index.ts), and so is the Header global.
4. The jobs runner and the draft preview route accept team members only.

**Rule for new code:** team-only access uses `authenticated` or `authenticatedOr(where)`, never
`Boolean(req.user)` or a bare `if (user)`.

## Versions and the vendored patch

`patches/@payloadcms__plugin-mcp.patch` (wired in `pnpm-workspace.yaml` and `package.json`)
changes four files:

- `createRequest.js` stops sending a body on GET and HEAD (unfixed upstream; from sas-site).
- `schemas.js` and `resource/delete.js` add the `confirm` input, hand it to the host on
  `req.context.mcpDeleteConfirm`, and mark delete tools `destructiveHint` (from sas-site). If this
  part is lost, deletes fail closed.
- `convertCollectionSchemaToZod.js` strips the generated schema's TypeScript with Node's
  `module.stripTypeScriptTypes` (Node 22.13 and later), falling back to the compiler. This repo is
  on TypeScript 7, which has no JS compiler API: without the fix every `create*` and `update*` tool
  silently fell back to an empty permissive schema (`Schema conversion failed … reading
  'CommonJS'` in the log), so clients got no field shapes.

Edit it with `pnpm patch @payloadcms/plugin-mcp@3.90.2` (then apply the current patch in the
edit directory, since pnpm opens the pristine package), `pnpm patch-commit`, and fold the new
versioned file back into `patches/@payloadcms__plugin-mcp.patch`. As with the drizzle patch, put
the lockfile's `patchedDependencies` entry back in `{ hash, path }` form before pushing. On a
Payload upgrade, re-apply it and retest `initialize`, `tools/list` (no conversion warnings) and a
first `delete*` call.

## Operational notes

- Capability checkboxes are columns on `payload_mcp_api_keys` (one per operation, one per site
  tool as `payload_mcp_tool_<name>`, plus `upload_media`). Adding or removing an exposed collection,
  global or site tool changes that table: follow the migration workflow in `MIGRATIONS.md`.
  `.githooks/pre-push` counts `mcp.ts` and `mcp-tools/index.ts` as schema files.
- `withCapabilityControls` in `mcp.ts` restyles the key's admin screen to match the plugin's
  generated field shape. After a Payload upgrade, open a key and confirm the toolbar is still there:
  if the shape changed, it disappears without an error.
- `tools/list` for a key with Pages, Works, Posts and Site Info plus the site tools is about 490KB,
  nearly all of it the `create*` and `update*` schemas. Claude Code loads schemas on demand; a
  client that loads every schema pays that per turn, so grant only what an agent needs.

## Next with TypeSafe

From sas-site's roadmap, not built here:

- **`pickMedia`** (a brief to the best media ids): blocked on data. 9 of the 248 local media items
  have alt text, and Jev reads text only. Fill alt text first.
- **Store the Ask judgment on each `ask-questions` row**: `judgeTurn` already computes the request
  kind; storing it costs no extra Jev call and lets an agent filter questions without reading them.
  Needs fields and a migration.
- **A claim check on work copy**: one Noul per sentence with a number, against the work's own
  details, to catch an invented metric before review.
