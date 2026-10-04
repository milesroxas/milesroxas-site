# Composer and editorial roadmap: sas-site parity without a Content Hub

Status: Phases 1 to 5 built 2026-09-27 on `dev` (notes under each phase). Phase 6's script is built and proven on the local Docker copy of production and on the Neon `preview/dev` branch; its production run is a cutover step (Phase 9). Phase 7: the code-only bullets are done, the three content ones wait for the cutover to soak. Phase 8 closed 2026-10-01: figures, the Carousel split, Carousel tabs and the visitor theme built 2026-09-30; nothing else is planned. Three workstreams landed on `dev` after the phases and are documented where they live, not here: the top bar, dock and Ask panel (`docs/site-chrome.md`, supersedes D10 and O3), the `/contact` inquiry form, and the `milesroxas-cms` MCP server (`docs/mcp.md`). Audit numbers come from the local Docker copy of production (`payload` on `127.0.0.1:54330`), pulled with the dev TUI; re-pull before any content step.

Goal: give this site the same editorial experience as `~/SITES/sas-site` (referred to below as `sas:`), so that Work pages are composed from Sections and the shared block run, Posts compose like sas-site Lab Pages, the same Ask feature answers visitors, the same Studio shader plugin drives effects in heroes and media slots, and every ported block keeps its exact animation. All of it lands without losing a single existing document, block row, or version.

Not in scope, on purpose: the Content Hub (case studies, lab projects, story beats, asset libraries, organizations, taxonomy collections), newsletters, the takeover menu, route transitions and hero landing, the AEO plugin (`llms.txt`), Sentry. Figures (chart, diagram, bespoke) are Phase 8. The `milesroxas-cms` MCP server was out of scope for this plan and shipped on its own (`docs/mcp.md`).

Agents: read this before touching blocks, themes, heroes, or migrations in this repo. It plays the role `sas:docs/blocks-reorg-roadmap.md` plays there. Read that file too before porting: it records why the block system is shaped the way it is.

---

## 0. Rules that hold for every phase

- **Expand, migrate, contract.** Every phase up to 5 is additive: new tables, new columns, new blocks. No slug, `dbName`, enum value or column is renamed or dropped before Phase 7, and Phase 7 runs only after content has moved and soaked.
- **`main` is the cutover branch.** Every phase lands on `dev`. `dev` merges to `main` once, in Phase 9, so production takes one CI migration pass and one content run instead of a deploy per phase. No production deploy carries a half-finished composer.
- **Every deploy renders production identically** until the explicit content step (Phase 9). New blocks exist in the drawer; nothing is re-authored by a deploy.
- **Push in dev, migrations in CI** (`MIGRATIONS.md`). `pnpm migrate:create` only after asking, one migration per phase PR, `pnpm check:migrations` and `pnpm check:migrations:drift` before every push. Expected prompts per phase are in Appendix A; if a **rename** prompt appears where the sheet says none, stop and re-check `check:migrations:drift`.
- **Copy sas-site verbatim where the code is site-neutral; adapt at the seams only.** The seams are listed per phase. A block's fields, layout classes, reveal markers and tuning constants are never "improved" during the port. Parity first, taste later.
- **Legacy blocks keep rendering forever.** `content`, `mediaBlock`, `slider`, `tabs`, `archive`, `cta`, `formBlock`, `callout` keep their slugs, tables, components and `data-theme` wrapper until Phase 7 replaces the wrapper. Editors can keep using them.
- **One entrance per block.** A ported block plays the reveal `sas:src/blocks/shared/reveal-variants.ts` assigns it and nothing else. The homepage fade-up in `AnimatedBlocksContainer` must skip elements that own a GSAP or CSS reveal (Phase 1).
- Naming follows `sas:docs/cms-naming.md`: `Opening` / `Composition` / `Closing` tabs, sentence-case group labels, `theme` means a band surface and never a colour mode, `layout` is the blocks field or an arrangement select.

---

## 1. Ground truth (audited 2026-09-27)

### Documents

| Collection | Published | Draft | Versions | Notes |
|---|---|---|---|---|
| pages | 6 | 0 | 176 | `home`, `works`, `posts`, `contact`, `flint`, `flint-feedback` |
| posts | 4 | 2 | 55 | body is Lexical in `posts.content`; no `layout` field today |
| works | 8 | 2 | 318 | `orderable`, `isProtected` (0 protected today), Work Details tab |
| media | 248 | | | Vercel Blob plus Cloudflare sync, `folders: true` |
| categories | 1 | | | nested-docs |
| forms | 3 | | | form-builder; 3 `formBlock` rows on pages |

### Block rows (live tables, not `_v`)

| Table | Rows | Stored values that matter |
|---|---|---|
| `works_blocks_content` | 61 | theme dark 36, light 14, system 11; 89 columns: text 44, sectionHeading 38, media 5, slider 1, youTube 1 |
| `works_blocks_media_block` | 53 | theme system 21, dark 20, light 12 |
| `works_blocks_slider` | 8 (34 slides) | theme dark 6, light 2 |
| `works_blocks_tabs` | 4 (13 tabs, 73 nested slides) | theme dark 4 |
| `works_blocks_archive` | 6 | |
| `works_blocks_cta` | 1 | |
| `pages_blocks_content` | 3 (10 columns: work 6, sectionHeading 3, text 1) | theme light 2, dark 1 |
| `pages_blocks_archive` | 2 | theme light 2 |
| `pages_blocks_form_block` | 3 | |
| `pages_blocks_callout` | 1 | |
| `pages_blocks_media_block`, `pages_blocks_slider`, `pages_blocks_cta` | 0 | free to change anything |
| `posts` inline Lexical blocks (banner, code, mediaBlock) | 0 found | verify with the query in Phase 0 |

Heroes: works `highImpact` 9, `lowImpact` 1; posts `highImpact` 4, `lowImpact` 2; pages `none` 3, `lowImpact` 2, `home` 1.

Consequence: the real migration surface is about 140 block rows on 10 works and 6 pages, and 6 posts whose bodies are plain rich text. Three block tables have zero rows.

### Code facts that shape the plan

- **No visitor theme toggle** (true on 2026-09-27; Phase 8 added one on 2026-09-30, and `<html>` now carries `data-theme`). `<html>` carried no `data-theme`. The light palette is `:root`; `[data-theme="dark"]` is stamped per block (`ClientBlockWrapper`, block components, `HighImpact` hero, the work title strip) and swaps the whole palette inside that subtree. So today `dark` means "forced dark palette here", and `light`/`system` mean "page palette". That maps cleanly onto sas-site bands (Section 5).
- **Five legacy blocks carry `theme` with enum values `system | light | dark`** (content, mediaBlock, archive, slider, tabs, plus nested slider groups). sas-site's `themeField()` is `light | dark | neutral | brand`. Same field name, different enum: a ported block cannot share a slug with one of these (Section 4).
- **`RenderBlocks` is an async server component** (`src/blocks/RenderBlocks.tsx`): it resolves protected works inside Content columns (`processLayoutBlocks`) and wraps every block in `div.block-wrapper` inside `AnimatedBlocksContainer`, which animates only on `/`.
- **The hero group is shared** by Pages, Posts and Works (`src/heros/config.ts`): `type`, `showContent`, `richText`, `links`, `media` (required for highImpact / mediumImpact / home). `HighImpact` receives the card-to-page FLIP clone (`docs/site-chrome.md`) and needs an `img` or `video` inside it.
- **Posts** have a required `content` richText with `BlocksFeature([Banner, Code, MediaBlock])`, no `layout`.
- **Works** offer `cta, content, mediaBlock, archive, formBlock, slider, tabs`; Pages offer the same minus `tabs` plus `callout`.
- Plugins: redirects (pages, posts), search (posts only), seo, nested-docs (categories), form-builder, Vercel Blob storage. Globals: `Header` only; the Footer global was dropped in `20260702_221932_remove_footer_global`.
- Payload 3.90.2 here, 3.88.0 in sas-site. Next 16.3.6 here, 16.3.4 there. Same adapter (`@payloadcms/db-vercel-postgres`), so the Studio's `transaction.ts` / `usage.ts` and Ask's drizzle schema port without import changes.
- Dormant shader tooling: `glslify*`, `glsl-*`, `raw-loader`, `glslify-loader`, the Turbopack `.glsl/.frag/.vert` rules and `shader.d.ts` have no consumers. sas-site keeps all GLSL inline in `.ts`, so none of it is needed.
- ScrollTrigger runs on the window scroller under `ReactLenis root`; there is no `scrollerProxy`. sas-site's `ScrollReveal` gates on IntersectionObserver, not ScrollTrigger, so it is unaffected.

---

## 2. Translation: what "the same as sas-site" means without a Content Hub

| sas-site | Here | How |
|---|---|---|
| Lab Page (presents a Lab Project) | **Post** | Opening (hero + intro band) → Content (article body, kept) → Composition (Section + run) → Related → SEO. Copy is authored inline; there is no record to resolve against |
| Work Page (presents a Case Study) | **Work** | Opening → Composition (Section + run + legacy blocks) → Work Details (kept) → Status → Access Control → Related & Categories → SEO |
| Pages | Pages | Opening → Composition (Section + run + legacy) → SEO |
| Story beats block, Story section, story `source` / `storyScope` / `storyBeatKey` | not ported | Narrative copy lives in the **Rich text** block. The Lab "one reading column" recipe becomes: Section → Standard (`richTransition`, layout `prose`) → Rich text → media or code |
| `withStoryBeatSource`, `labBlock`, `withCaseStudyScopedMedia`, `publicApprovedMediaWhere` | not ported | Media pickers have no `usageStatus` gate here; filters become plain uploads (D1, D2) |
| Content Source tab, Assets tab (cover asset, downloadable assets) | not ported | Cards keep reading `hero.media` / `meta.image` as today |
| Home global, index globals (`works-index`, `insights-index`) | existing `home`, `works`, `posts` Pages documents | Unchanged. `home` gets the run through the Pages list |
| Site Info global (AEO plugin) | new minimal `site-info` global | Only what Ask reads: `ask.hidden`, `inquiries.responseTime`, `inquiries.scheduleUrl` (Phase 5) |
| Inquiries collection + `/api/inquiries/submit` | new (Phase 5) | Ask's team-form handoff posts here. Team-only PII, Resend notify |
| Closing band (Footer global + per-page Closing tab) | not ported (D4) | The Footer global was removed on purpose; re-adding it is a product call |
| Takeover menu, `MenuAsk`, `ClosingAsk` | not ported | The dock owns Ask: a panel in the bottom dock plus `/ask` (`docs/site-chrome.md`; supersedes D10) |
| Visitor light/dark toggle, `InitTheme`, `ChromeTheme` | not ported | The site stays light; bands give per-section contrast (Section 5) |
| Route transitions (View Transition API), hero landing, page intro | not ported | The site chrome and the card FLIP transition stay as they are |
| `BlocksDrawerTabs` admin provider, `BLOCK_GROUPS`, Section factory, `sectionNestableBlocks`, `content-block-renderer`, `reveal-variants` | ported verbatim | Phase 1 and 3 |
| Streak Studio plugin, `fields/visual.ts`, `features/immersive` (studio, visual, streak field, light leak) | ported | Phase 2. Media-field seams in the publish endpoint |
| Ask (`features/ask`, `endpoints/ask.ts`, `ask-index` plugin, `AskQuestions`, retention job) | ported | Phase 5. Jev/TypeSafe optional |

---

## 3. Decisions taken in this plan

| # | Decision | Reason |
|---|---|---|
| D1 | **Strip the story fields** (`storySourceField`, `featureSourceField`, `storyScope`, `storyBeatKey`, `showOverrides`) from every ported block config. | No record to resolve against. A dead `source` enum column on every block table would still have to be migrated later. Adding it back is additive if a hub ever arrives |
| D2 | Replace `filterOptions: publicApprovedMediaWhere` with no filter on every ported upload field. | Media here has no `usageStatus` |
| D3 | Colliding slugs keep the milesroxas block (Section 4). sas-site's Caption ships as slug **`caption`**; sas-site's Content, Archive, CTA, Form and Banner are not imported. | 61 + 53 + 8 + 4 + 6 rows would otherwise sit under a block whose fields changed underneath them |
| D4 | The Closing tab and Footer global are **not** part of the core port. | Removed here in July on purpose |
| D5 | Posts keep `content` (made optional) and gain `layout`. The route renders hero → intro → content → composition → related. Moving existing bodies into Sections is the Phase 6 posts transform (D15), with dry-run and snapshot. | No content is touched by schema work |
| D6 | Works keep `layout` required and keep every legacy block in the drawer under its group, relabelled where a ported block takes the same name (`tabs` becomes "Tab slider", `mediaBlock` stays "Media"). | Zero re-authoring pressure; Phase 7 retires legacy blocks from the drawer only after Phase 6 |
| D7 | The Studio plugin (Phase 2) lands **before** the block run (Phase 3). | The run's block configs spread `blockVisualSlotFields`, whose `studio` relationship needs the `streak-looks` collection. Porting the configs twice (plain upload, then slot) would generate two migrations on the same tables. Phases 1 and 2 can run in parallel Conductor workspaces |
| D8 | The `link()` field stays milesroxas's (`reference | custom`, appearance `default | outline`). Ported blocks that ask for the `text` appearance (Rich text Actions) are configured with `['default', 'outline']`. | Adding `text` is an `ADD VALUE` on every `*_link_appearance` enum (14 of them plus `_v` twins) for one toolbar block |
| D9 | Figures (chart, diagram, bespoke) and the figures plugin are optional, Phase 8. | They pull `elkjs`, `recharts`, `zod` spec schemas and a `beforeChange` validator; not asked for |
| D10 | ~~Ask mounts at `/ask` (AskWidget) and as a Header nav item.~~ **Superseded 2026-09-29**: Ask is a dock panel plus `/ask`; the dock replaced the Header nav and the SiteFrame (`docs/site-chrome.md`). | No takeover menu and no footer closing band here |
| D11 | Docker image becomes `pgvector/pgvector:pg17` (not pg18). | Neon production is Postgres 17 (`MIGRATIONS.md`); `docker-compose.yml` records a drizzle-kit issue with PG 18 named constraints. Ask needs `CREATE EXTENSION vector` |
| D12 | The existing hero group stays; `hero.media` becomes a visual slot (`heroVisualSlotFields`) so an effect can ground the opening band. `HighImpact` keeps the FLIP clone pickup and already fades the clone out when there is no `img`/`video`. | Keeps the SiteFrame transition; adds the shader where sas-site has it |
| D13 | Remove the dormant shader dependencies and Turbopack loader rules in Phase 7. | Nothing imports them; the ported effects are inline GLSL |
| D14 | The fluid type scale, grid gap token, `text-stack`, `stack-binds-opener`, band tokens and `BlockGrid` are added **beside** the current tokens, not in place of them. Existing components keep their classes. | The ported blocks read `text-heading-2`, `text-display`, `gap-grid`, `text-stack`, `font-mono`; nothing else does yet |
| D15 | Phase 6 is **scripted end to end**. Works, Pages and Posts are converted by `scripts/compose-layouts.ts`; mapping changes go in `scripts/composer/overrides.ts`, never in admin. | Payload admin cannot move a block between fields, so a manual wrap means rebuilding about 130 blocks by hand |
| D16 | Legacy blocks map onto **sas-site's variants**. Legacy presentation fields with no sas-site equivalent are dropped, not emulated or added to the ported configs. | Parity with sas-site is the goal; carrying `textSize`, `captionLayout` or `space` forward would fork the ported blocks. Copy and media are preserved by a check, not by keeping fields |

---

## 4. Slug collision register

Every sas-site block in the run, checked against `src/blocks/*/config.ts` here.

| sas slug | Here today | Rows | Verdict |
|---|---|---|---|
| `section` | none | | **create** (factory, per-collection `dbName`) |
| `richTransition`, `featureHeadingOffset`, `fullMedia`, `mediaContentSplit`, `splitContentNarrow`, `imagePair`, `splitImageOffset`, `featureImageStatement`, `richText`, `faq`, `carousel`, `featureTabs`, `insightList`, `youtube` | none | | **create**, config verbatim minus D1/D2 |
| `mediaBlock` (sas "Caption": media, size, captionOverride, theme) | `mediaBlock` (media, aspectRatio, fullWidth, theme `system|light|dark`, showCaption, captionLayout, richText, textSize, space) | 53 | **keep ours.** Port sas Caption as slug **`caption`**, `dbName: ({tableName}) => \`${tableName}_caption\``, `interfaceName: 'CaptionBlock'`, label "Caption". Ours stays "Media", Media group, top-level only |
| `content` (sas: columns of richText + link, theme) | `content` (theme, containerWidth, space, columns of text / sectionHeading / work / post / media / slider / youTube) | 61 + 3 | **keep ours**, group Custom, label "Columns". It closes every drawer list as sas-site's does. Nested inside Sections too, rendered with its own wrapper (it owns its `space`) |
| `code` (sas: languages ts, tsx, js, css, json, glsl, bash; function `dbName`) | `code` (ts, js, css), Posts Lexical only, no table | 0 | **adopt sas config.** Superset of languages; new `*_code` tables only. The Lexical copy keeps working (values stored as strings) |
| `youtube` | `youTube` block is orphaned (registered nowhere); the Content column `youTube` group is a different thing | 0 | **create** sas `youtube`; delete `src/blocks/YouTube` and its story. The column group is untouched |
| `banner` | identical fields | Lexical only | keep ours |
| `cta` | ours has no `theme` | 1 | keep ours; add `admin.group: BLOCK_GROUPS.forms` and `labels`. No theme column yet (Phase 7 may add the band select) |
| `archive` | ours: theme `system|light|dark`, cardStyle, populateBy, relationTo posts/works | 8 | keep ours, group Lists |
| `formBlock` | ours: form, space, intro | 3 | keep ours, group Forms & CTAs |
| `tabs` (ours) vs `featureTabs` (sas) | different slugs | 4 | both. Ours relabelled "Tab slider", Interactive, top-level only |
| `slider` (ours) vs `carousel` (sas) | different slugs | 8 | both. Ours stays "Slider", Interactive, top-level only |
| `carouselSplit` | ours only, Phase 8 | 0 | **create.** Not in sas-site: a deck beside its copy, the shape a Columns block reached for with a Slider column next to a Section heading column. Media and content group |
| `carouselTabs` | ours only, Phase 8 | 0 | **create.** Not in sas-site: a deck per tab, the shape every Tab slider holds. Interactive group. Shares its trigger strip with `featureTabs` and its deck with `carousel` |
| `callout` | ours only | 1 | keep, group Statements |
| `storyBeats`, `labStorySection`, `labFacts`, `labRelatedProjects`, `labMediaShowcase`, `caseStudy*`, `featuredWork`, `industryWork`, `audienceTabs`, `dynamicAudience`, `testimonialsMarquee`, `newsletterSignup`, `featureStatementGrid` (carries `source`), `scrollGallery` | | | **not ported** (hub, taxonomy or newsletter dependencies) |

Every ported block that lives in more than one collection uses the function `dbName` exactly as sas-site does. Tables land per parent: `pages_section`, `works_section`, `posts_section`, `works_full_media`, `posts_rich_text`, and so on, plus `_v` twins. No existing table is renamed.

---

## 5. Theme model: bands, not modes

sas-site's rule (`sas:src/blocks/shared/section.tsx`): a block's `theme` picks a **surface within the visitor's theme**. `light` is the page surface, `dark` a low-luminance band (`--tertiary`), `neutral` a quiet stripe (`--neutral`), `brand` the accent surface (`--brand`). Sections expose the same idea as `inherit | secondary | accent | inverted`, mapped in `sas:src/blocks/section/shared.ts`.

The site was light only when this was written, so "within the visitor's theme" collapsed to "within the light page". Phase 8 added the visitor theme (2026-09-30) and the bands were already built for it: a band is a surface inside whichever palette `<html data-theme>` selects. The translation is exact either way:

| Legacy value (five blocks) | Renders today | Band after Phase 7 |
|---|---|---|
| `system` | page palette | `light` |
| `light` | forced light palette (identical to page) | `light` |
| `dark` | forced dark palette via `data-theme="dark"` | `dark` (`band-dark`, `--tertiary` ground) |

Work to do, all in Phase 1 unless noted:

1. Add the tokens `--tertiary`, `--tertiary-foreground`, `--neutral`, `--neutral-foreground`, `--brand`, `--brand-foreground` to `:root` **and** to `[data-theme="dark"]` in `src/app/(frontend)/globals.css` (a band can sit inside a legacy forced-dark block until Phase 7). Map them in `@theme inline` as `--color-tertiary` etc. Values: start from sas-site's (`sas:src/app/(frontend)/globals.css` around lines 1086 and 1163) and retune to this palette.
2. Port the `.band-dark` / `[data-band="dark"]` surface-set remap and `.band-neutral` (`sas:globals.css` around lines 1204 and 1272). `band-dark` restates muted, card, secondary, accent, border and input, which is what stops light chips and white hairlines inside a dark band.
3. Port `themeClasses`, `SPACING_SCALE`, `BAND_SPACING`, `STACK_SPACING`, `sectionThemeClass`, `Section` (`sas:src/blocks/shared/section.tsx`) and `themeField()` (`sas:src/blocks/shared/fields.ts`). `Section` spreads `VISUAL_HOST` from the visual contract, which arrives in Phase 2; until then spread nothing.
4. `dark` bands add `[&_.payload-richtext]:prose-invert`; our `RichText` root already carries `payload-richtext`.
5. Phase 7 converts the five legacy enums with `UPDATE ... SET theme = 'light' WHERE theme = 'system'` before the cast, recreates each enum as `light | dark | neutral | brand` (never `ADD VALUE` plus use in one `up()`), and replaces `useBlockTheme` / `data-theme` wrappers with `sectionThemeClass`. `ClientBlockWrapper.tsx` is deleted (nothing imports it today).

Hardcoded `data-theme` on `HighImpact`, `HomeHero`, `CallOut` and the work title strip stay until Phase 7, then become band classes.

**Band themes became roles (2026-10-01).** Ported from sas-site's `band_theme_roles`. Everything above this note describes the model before it. One vocabulary for every block, the Section, the hero select and the five legacy blocks, stated once in `src/blocks/shared/band-theme.ts` and offered by one `themeField()`: `default | inverted | neutral | brand`.

- `default` is the page surface in the visitor's palette. `inverted` paints the other palette: dark on a light visit, light on a dark one. `inverted` is a polarity scope, not a token set, so tokens, `dark:` utilities, prose, posters and figure series all flip with it.
- The polarity model lives in one place, the `dark` custom variant in `src/styles/shadcn-theme.css`. The palettes are the `palette-light` / `palette-dark` utilities in `globals.css`, painted onto `:root`, every `[data-theme]` pin and `.band-inverted`. Script reads a ground from the computed `color-scheme` (`readGround`, `src/utilities/ground.ts`). That replaced `blockSurface`, `.band-dark` and the chrome's `useOverDarkBand` (now `useBandGround`, which stamps the band's polarity, light or dark).
- `[data-band="dark"]` stays the always-dark panel (the code block). It is not a band theme.
- A block nested in a Section hides its own theme select. The Section's theme applies there.

Migration `20261001_232240_band_theme_roles` renames stored values in place across all 148 theme enums, versions included, among them the 8 nested `slider_theme` groups:

| Family | Up | Down |
|---|---|---|
| Blocks (`light, dark, neutral, brand`) | `light` → `default`, `dark` → `inverted` | exact inverse |
| Section (`inherit, secondary, accent, inverted`) | `inherit` → `default`, `secondary` → `neutral`, `accent` → `brand` | exact inverse |
| Legacy (`system, light, dark`) | `system`, `light` → `default`; `dark` → `inverted` | `default` → `system`, `inverted` → `dark`; exact in rendering (`system` drew `light`), not in storage |

A light visit renders as before: legacy `system` and `light` both drew the light palette, and `dark` the dark one. On a dark visit `default` follows the visitor and `inverted` paints the light palette.

---

## 6. Phases

### Phase 0: preflight

- [ ] Land or shelve `chore/update-deps`; start every phase branch from a clean `dev`.
- [ ] Dev TUI → Pull production content → local Docker DB, then Database → Back up local Docker DB. Keep the dump path in the PR description of every phase.
- [ ] Re-run the Section 1 inventory against the fresh pull (queries are plain `count(*)` per block table plus `select theme, count(*) ... group by 1`). Also confirm the Posts inline-block count:
  ```sql
  select b->'fields'->>'blockType', count(*)
  from posts, jsonb_path_query(content, 'strict $.**.children[*] ? (@.type == "block")') b
  group by 1;
  ```
- [ ] Export the `layout` of every page and work and the `content` of every post to `scripts/snapshots/<date>-pre-composer.json` (Local API, `depth: 0`). This is the content-level undo for Phase 6.
- [ ] Visual baseline: `pnpm test:storybook` green; full-page screenshots of the 10 works and `home`, `flint`, `contact`.
- [ ] Confirm `pnpm migrate:status` says every committed migration is applied on production (the ledger must be clean before a phase adds one).

### Phase 1: foundation (zero schema, deploy any time)

Everything the run blocks and their entrances import, ported first so Phase 3 is a pure block port. No collection or block config changes, so no migration.

**Design tokens and utilities** (`src/app/(frontend)/globals.css`, D14):
- band tokens and `band-*` rules (Section 5);
- `--spacing-grid` and the `gap-grid` utility, `--max-width-content-narrow`, `--max-width-content-default`, the `container-narrow` / `container-full` variants (`sas:globals.css` around line 765 and the container block around line 854);
- the fluid type scale `--text-display`, `--text-heading-1..3`, `--text-lead`, `--text-code` (`sas:globals.css` around line 779). Our `container` utility and `--space-*` scale stay;
- `@utility text-stack` and `@utility stack-binds-opener` (`sas:globals.css` around lines 958 and 993);
- `.reveal-section`, `.reveal-stagger-item`, `@keyframes reveal-stagger-fade` (around line 1310) and `.disclosure-body` (around line 1391);
- `--ease-out-quint` and the press tokens the FAQ glyph and Carousel read (`sas:src/styles/shadcn-theme.css`; take the tokens, not the `dark` custom variant).
- Fonts: sas-site sets `--font-mono: var(--font-geist-mono)`. `geist` is already a dependency here; load Geist Mono in `layout.tsx` beside IBM Plex Sans and map `--font-mono`. Headings keep IBM Plex.

**Shared modules** (verbatim unless noted):
- `sas:src/blocks/shared/{groups.ts, section.tsx, grid.tsx, typography.ts, aspect-ratio.ts, numbering.ts, reveal-variants.ts, content-block-renderer.tsx, visual-surface.ts}`. `reveal-variants.ts` keeps only the slugs that ship here (Phase 3 list); `content-block-renderer.tsx` imports arrive with the blocks.
- `sas:src/shared/ui/scroll-reveal/{scroll-reveal.tsx, use-reveal-swap.ts, index.ts, scroll-reveal.test.ts}` and `sas:src/shared/ui/reveal-section/`. These are the two site reveals (`SCROLL_REVEAL_INTRO`, `SCROLL_REVEAL_UNDER_MEDIA`) every block's motion is built on. Do not retune.
- `sas:src/hooks/{use-prefers-reduced-motion.ts, use-mobile.ts, use-hydrated.ts, use-near-viewport.ts}`.
- `sas:src/components/Container/index.tsx` and `sas:src/components/ui/{code-block.tsx, code-block-languages.ts, carousel.tsx, accordion, dropdown-menu, sheet}`. Our `src/components/ui` is shadcn on individual `@radix-ui/*` packages; sas-site's import from the `radix-ui` umbrella. Add `radix-ui` and keep both styles until a later cleanup.
- `sas:src/components/admin/BlocksDrawerTabs/index.tsx`, registered under `admin.components.providers` in `src/payload.config.ts`. This is the "composer" feel: an All / group filter over Payload's blocks drawer. It reads group labels from the DOM, so it needs no wiring.
- `sas:src/components/RichText/text-styles.ts` (class map for the Eyebrow and Small text styles). The field factories that consume it (`contentLexical.ts`, `markdownInput.ts`, `lexical/textStyle/*`) land in Phase 3 with the blocks: `.githooks/pre-push` treats every file under `src/fields/` as schema source and would demand a migration for a phase that has none.

**RichText merge.** Our `src/components/RichText/index.tsx` keeps its converters (banner, mediaBlock, code, cta, formBlock) and gains sas-site's for `youtube`, `insights`, `pillList`, `actions` and the text-style node treatment (`sas:src/components/RichText/index.tsx`). The `code` converter switches to the ported `components/ui/code-block.tsx` surface.

**Media parity spike.** The ported blocks call `<Media resource fill htmlElement={null} imgClassName priority sizes>`. Ours already renders the bare element for `htmlElement={null}` (needed by the media wipe), but its props type has no `sizes` and `ImageMedia` derives its own; add a pass-through `sizes` prop. Fix here, not in the blocks.

**Homepage entrance guard.** `AnimatedBlocksContainer` sets `y: 20, opacity: 0` on every direct child of the blocks container on `/`. Once `home` can hold run blocks, that is a second entrance on top of `ScrollReveal` / `RevealSection`. Change it to skip children that carry `data-scroll-reveal` (add that attribute on the `ScrollReveal` root and the `RevealSection` root in the ported files, a one-line seam each).

**Storybook.** Port `sas:src/blocks/fixtures.ts` builders (`text`, `paragraph`, `heading`, `richText`, `mediaFixture`, `insightMarkFixtures`) into `src/stories/fixtures.ts`. Titles follow sas-site: `Blocks/SectionHeading/*`, `Blocks/MediaAndContent/*`, `Blocks/Media/*`, `Blocks/Text/*`, `Blocks/Interactive/*`, `Blocks/Lists/*`, `Blocks/Section`.

Definition of done: `tsc --noEmit`, `pnpm lint:ci`, `pnpm test:storybook` clean; no file under `src/fields/`, `src/collections/` or a block `config.ts` changed (so the pre-push migration guard stays quiet); site renders byte-identical; a throwaway story renders `Section` in all four bands over `RevealSection` and `ScrollReveal` with the tuning constants unchanged.

**Phase 1 as built (2026-09-27).** `tsc`, `biome ci` (warnings only, all in verbatim class strings), `pnpm test:storybook` (38 files, 143 tests) and the new `pnpm test:unit` are green; `/`, `/works`, a work page, `/posts` and `/contact` render on `pnpm dev`. A compiled-CSS diff against `HEAD` shows every legacy rule unchanged except the three listed under "Visible changes". Where the build departs from the plan above:

- **Tailwind Typography was never loaded here.** `prose` on legacy markup was inert. The plugin is now on for the ported blocks, so the old renderer moved to `components/RichText/Legacy.tsx` (all legacy blocks, heroes and the post body import it). It drops the inert `prose md:prose-md` and the `payload-richtext` marker, which the ported bare rich-text flow keys on. Inert `prose` / `dark:prose-invert` also came off five index pages and the post card. `components/RichText/index.tsx` is sas-site's renderer with this site's block converters.
- **Button and Carousel.** sas-site's primitives sit at `components/ui/button.tsx` and `carousel.tsx` so ported code imports them unchanged; this site's moved to `legacy-button.tsx` and `legacy-carousel.tsx` (CMSLink, Form, Code copy button, pagination, not-found, Slider). Reconcile in Phase 7.
- **`dark` variant keyed on `data-theme`** (`src/styles/shadcn-theme.css`), against "take the tokens, not the variant". Without it Tailwind's default `dark:` follows the visitor's OS setting, so ported primitives would half-darken for OS-dark visitors on a light site. With it they read dark inside a legacy forced-dark block, which is right.
- **Token map** leaves out sidebar, success, warning, error and active (undefined here; mapping them would activate the inert `border-error` safelist). `.band-dark` does not remap `--accent`: this site's accent is the orange ink, not a selected-surface tint.
- **Band values (O7):** `dark` = the legacy forced-dark background, so Phase 7's conversion is visually a no-op; `neutral` a 4% stripe off the page; `brand` the orange with dark ink.
- **Deferred:** `BlocksDrawerTabs` registration to Phase 3 (`payload.config.ts` trips the pre-push guard, and the tabs only mount once blocks carry `admin.group`); `visual-surface.ts` to Phase 2 (imports the immersive visual); the `sectionChildComponents` map, the rich-text toolbar converters and the code converter switch to Phase 3, with the blocks they import; `tw-animate-css` until a consumer needs it (it would also start animating the legacy form Select).
- **Media spike:** `<Media size>` already passed through, so no `sizes` prop was needed. The real gap was the `<picture>` wrapper: a `fill` image sat in a static `picture`. It now takes sas-site's `absolute inset-0` when `fill` is set; legacy `fill` callers keep the same box.
- **Tests:** a `unit` Vitest project (jsdom) runs `src/**/*.test.ts`; `scroll-reveal.test.ts` passes. The Phase 1 story is `Foundation/Section band` (`src/blocks/shared/section.stories.tsx`); `Blocks/Section` stays free for the Phase 3 block.
- **Visible changes:** `font-mono` is Geist Mono (SiteFrame clock and Contact label, legacy code styling); `dark:` utilities no longer follow OS dark mode (Footer, Logo, Badge: nothing visible on the light site); Radix `data-disabled` variant form (same match for Radix attributes).
- **Dependencies:** `radix-ui`, `@tabler/icons-react`, `prismjs` 1.30.0; dev `jsdom`.

### Phase 2: Studio shader plugin (additive schema)

The plugin and the effect engine are one unit (`sas:docs/streak-field-studio.md`, `sas:docs/studio-effects.md`, `sas:docs/immersive-effects.md`). Read those three first.

**Port verbatim**
- `sas:src/plugins/streak-studio/{index.ts, collections.ts, endpoints.ts, hash.ts, hash.test.ts, transaction.ts, usage.ts}` and `components/*` (`Stage`, `Inspector`, `ParameterRow`, `FieldPicker`, `History`, `Usage`, `Thumbnail`, `PublishButton`, `draft.ts`, `store.ts`, `look-store.ts`, `publish.ts`, `parameters.ts`, `paths.ts`, `copy/*`, `studio.css`). Drop `StreakReleases` and `StreakRenders` from `collections.ts` and the legacy `release` relationship from `shaderField` (sas-site keeps them only until a drop migration; we never had them).
- `sas:src/features/immersive/studio/*` (contracts, recipe engine, scenes, preview, capture), `sas:src/features/immersive/visual/*` (descriptor, compose, looks, placement, posters, hooks, capability, rollout, host, `streak-visual.tsx`, `leak-visual.tsx`, motion preference and toggle), `sas:src/features/immersive/ui/{streak-field-runtime, streak-field-scene, streak-field-shader, streak-field-tuning, streak-field, light-leak-runtime, light-leak-scene, light-leak-shader, light-leak-tuning, light-leak-excite, light-leak, failure-boundary}`, `sas:src/features/immersive/{index.ts, presets.ts, resolve-tuning.ts}`. Other effects (text load-ins, refraction, dispersion, floating cards, scroll gallery, backdrop) stay behind.
- `sas:src/lib/webgl/{gpu-budget.ts, gpu-budget.test.ts, use-gpu-lease.ts, canvas-resize.ts, store.ts, components/context-guard}`.
- `sas:src/fields/{visual.ts, visual-validate.ts, visual-refs.ts}` plus tests; `sas:src/components/Visual/index.tsx`; `sas:src/heros/HeroGround.tsx`; `sas:src/utilities/{canonicalJSON.ts, relationshipId.ts}`. sas-site's `getMediaUrl.ts` maps onto our `getMediaURL.ts` (same job, different casing; alias the import rather than adding a second helper).
- `sas:public/images/streak-field/*.webp` and `sas:public/images/light-leak/*.webp` (six looks and two leaks, light and dark faces) and the `images.localPatterns` entries in `next.config.ts`. Regenerating posters needs `sas:scripts/visual-posters.ts` and Playwright; copy the files instead.
- `src/components/ui/{button, input, kbd, toggle-group, tooltip, checkbox, collapsible, label, select, tabs, slider}` where ours differ.

**Seams**
- `endpoints.ts` writes Media with `title`, `alt`, `usageStatus`, `approvedChannels`, `description`, `folder`. Ours has `alt`, `caption`, folders. Keep `alt` and `folder` ("Streak Field Studio" folder created if missing), drop the rest.
- `publicApprovedMediaWhere` on `posterMedia` becomes no filter (D2).
- `sas:src/hooks/use-site-theme.ts` reads `html[data-theme]` through the Theme provider types; here it returns `'light'` unless an ancestor stamps `data-theme="dark"` or `data-band="dark"` (that is what `useGroundSurface` needs to pick the poster face inside a legacy dark block).
- `Section` (Phase 1) now spreads `VISUAL_HOST`.
- Media `beforeChange` / `beforeDelete` poster guards run beside our Cloudflare sync hooks; order is plugin-appended, so nothing to do.
- `pnpm generate:importmap` after registering the plugin first in `src/plugins/index.ts` (it only hydrates collections that exist when it runs).

**Schema added**: `streak_looks`, `streak_looks_texts`, `_streak_looks_v`, `_streak_looks_v_texts`, their enums (`effect`, `_status`), `payload_locked_documents_rels.streak_looks_id`. No slot columns yet; slots arrive with the blocks (Phase 3) and heroes (Phase 4).

Definition of done: a look can be drafted in Admin → Assets → Studio Looks, previewed live, published (two captures land in Media), and `GET /api/streak-looks/:id/usage` answers. `pnpm check:migrations:drift` shows only creates. Answer sheet: Appendix A, Phase 2.

**Phase 2 as built (2026-09-27).** Migration `20260927_171656_streak_studio` (no prompts; creates only, plus one additive `ALTER TYPE enum_payload_folders_folder_type ADD VALUE 'streak-looks'` that nothing in the same `up()` uses, because the looks collection has `folders: true`). `tsc`, `pnpm test:unit` (13 files, 110 tests), `pnpm test:storybook` (45 files, 186 tests), `check:migrations`, `check:migrations:drift` and a Local API create/find/delete of a draft look are green. Where the build departs from the plan above:

- **UI primitives.** sas-site's `checkbox`, `input`, `label`, `select`, `tabs` now sit at their canonical paths for the Studio; this site's moved to `legacy-*.tsx` (form blocks, the legacy Tabs block, search), stories retitled `UI/Legacy/*`. Same pattern as Button and Carousel in Phase 1. New: `collapsible`, `kbd`, `slider`, `toggle-group`, `tooltip`.
- **`tw-animate-css`** is a dependency now, imported only by the admin entry `plugins/streak-studio/components/studio.css`. The site stylesheet still does not load it.
- **Status tokens.** The Studio reads `bg-success`, `bg-warning`, `text-warning`. The shared `shadcn-theme.css` still leaves them out (site safelist stays inert); `studio.css` maps `destructive`, `success`, `warning`, `error`, `active` for itself.
- **Poster URLs.** `posters.ts` prefers the media's `cloudflareImageUrl`, else `getMediaUrl` (this site's `getMediaURL.ts`; no R2 CDN helper here).
- **`next.config.ts` `localPatterns`**: `{ pathname: '/**', search: '' }` keeps every query-less local path optimizable as before, plus the two poster directories with their `?v=` query.
- **`useSiteTheme`** is verbatim: `<html>` carries no `data-theme` here, so it reads light; `useGroundSurface` already reads the nearest `[data-theme]` / `.band-dark` ancestor, so no seam was needed.
- Barrel `features/immersive/index.ts` and `presets.ts` trimmed to the two Studio effects. `StreakReleases`, `StreakRenders`, the slot `release` column and the legacy-release delete guard are gone.
- CSS: the "Visual posters" and "Visual bleed" rules from sas-site's `globals.css`. `Section` spreads `VISUAL_HOST`. Docs copied: `streak-field.md`, `streak-field-studio.md`, `studio-effects.md`, `immersive-effects.md` (they describe sas-site surfaces this site does not ship: the takeover menu, index grounds, MCP, demo playgrounds).

### Phase 3: Sections and the shared run (additive schema)

**Blocks** (config verbatim minus D1/D2; component, stories and motion files verbatim). Reveal is the value `reveal-variants.ts` assigns; it is what "same exact animation" means for each block.

| Block | sas dir | Group / label | Reveal | Motion files beyond the marker | Port notes |
|---|---|---|---|---|---|
| Section | `section/` | Structure | none (band never animates) | | factory; instances `PageSection`, `WorkSection`, `PostSection` |
| Standard `richTransition` | `rich-transition/` | Section heading | `intro` | | `transitionFields()` minus nothing; `prose` layout + `headingLevel` kept (it opens a Rich text passage) |
| Offset `featureHeadingOffset` | `feature/HeadingOffset/` | Section heading | `intro` | | drop `source` |
| Stacked `fullMedia` | `full-media/` | Media and content | `underMedia` | | drop `source`; slot via `blockVisualSlotFields` |
| Split `mediaContentSplit` | `media-content-split/` | Media and content | `underMedia` | | body uses `contentLexical` |
| Split narrow `splitContentNarrow` | `split-content/` | Media and content | `underMedia` | | body uses `contentLexical` |
| Pair `imagePair` | `image-pair/` | Media and content | `underMedia` | | |
| Pair offset `splitImageOffset` | `split-image-offset/` | Media and content | `underMedia` | | |
| Statement `featureImageStatement` | `feature/ImageStatement/` | Media | `underMedia` | | drop `source` |
| Caption `caption` | `MediaBlock/` | Media | CSS reveal | | slug renamed (Section 4) |
| YouTube `youtube` | `youtube/` | Media | CSS reveal | `LiteYouTube.tsx`, `register.tsx`, `lite-youtube.css` | add `lite-youtube-embed` |
| Rich text `richText` | `rich-text/` | Text | `intro` | | body `BlocksFeature([RichTextInsights, RichTextPillList, YouTube, Banner])`; Banner is our addition so Phase 6 can keep post banners inside bodies |
| Code `code` | `Code/` | Text | CSS reveal | | adopts sas config; `Section.tsx` for composition, `Component.tsx` for Lexical |
| FAQ `faq` | `faq/` | Interactive | `intro` | Radix accordion on `.disclosure-body`, plus-to-minus glyph on `--ease-out-quint` | `link()` is ours (D8) |
| Carousel `carousel` | `Carousel/` | Interactive | CSS reveal | `use-carousel-effects.ts` (embla velocity → `quickTo` RGB split), `playback.ts` (poster dissolve), `geometry.ts`, `visual-state.ts`, tests | embla already installed |
| Carousel split `carouselSplit` | `carousel-split/` | Media and content | CSS reveal | renders the Carousel component `bare` in a grid cell | ours, added in Phase 8 |
| Carousel tabs `carouselTabs` | `carousel-tabs/` | Interactive | CSS reveal | `shared/tabs.tsx` trigger strip, the Carousel component `bare` per panel | ours, added in Phase 8 |
| Tabs `featureTabs` | `feature/Tabs/` | Interactive | `intro` | | per-tab visual slot; drop `source` on tab rows |
| Insight list `insightList` | `insight-list/` | Lists | `intro` | | SVG marks via CSS mask; picker filter `mimeType` svg only |
| Columns `content` (ours) | | Custom | none (own wrapper) | | closes every list; nested in Sections too |

Rich text sub-blocks (Lexical only, no tables): `sas:src/blocks/rich-text/{insights, pill-list, actions}`. With them come the field factories `sas:src/fields/{contentLexical.ts, markdownInput.ts}` and `sas:src/fields/lexical/textStyle/*` (the Split and Split narrow body editor; the write-only Markdown sibling an agent can author through). The Actions toolbar block is configured with `appearances: ['default', 'outline']` (D8).

**Runs** (`src/blocks/shared/section-blocks.ts`, mirrors sas-site with figures and story beats removed):
```ts
export const sectionNestableBlocks: Block[] = [
  RichTransition, FeatureHeadingOffset,                                   // Section heading
  FullMedia, MediaContentSplit, SplitContentNarrow, CarouselSplit, ImagePair, SplitImageOffset, // Media and content
  FeatureImageStatement, Caption, YouTube,                                // Media
  RichTextBlock, Code,                                                    // Text
  Faq, Carousel, CarouselTabs, FeatureTabs,                               // Interactive
  InsightList,                                                            // Lists
]
export const sectionChildBlocks = [...sectionNestableBlocks, Content]      // Custom closes the nested list
```

**Per-collection lists** (`src/fields/pageLayoutBlocks.ts`), each leading with its Section, then the run, then the legacy blocks in their groups, `Content` last:

| Surface | Order |
|---|---|
| Pages | `PageSection`, run, `Slider` (Interactive), `CallOut` (Statements), `Archive` (Lists), `CallToAction`, `FormBlock` (Forms & CTAs), `MediaBlock` (Media, legacy), `Content` |
| Works | `WorkSection`, run, `Slider`, `Tabs` (Interactive), `Archive`, `CallToAction`, `FormBlock`, `MediaBlock`, `Content` |
| Posts | `PostSection`, run |

Payload groups the drawer by label in first-appearance order, so the legacy Media block lands in the Media tab beside Statement, Caption and YouTube. Sections never nest inside Sections. A block appears once per `blocks` field.

**Collections**
- Pages: the `layout` field gains `label: 'Composition'`, `labels: { singular: 'Section', plural: 'Sections' }`, the tab is relabelled `Composition`, the hero tab `Opening`.
- Works: same, plus `orderable` and the Work Details, Status and Access Control tabs unchanged.
- Posts: new `Composition` tab holding `layout` (blocks `postLayoutBlocks`, not required); `content` becomes optional and stays in the `Content` tab with `contentsButtonField()` above it (Phase 4 renders the button). The Meta tab is relabelled `Related & Categories` (sas naming; it collided with the SEO tab's `meta` name).

**Renderer** (`src/blocks/RenderBlocks.tsx`): keep the async signature and the protected-works pass, then:
- `section` → `SectionBand` with children rendered through `renderContentBlock(child, key, true, blockComponents)`;
- run blocks → `renderContentBlock(block, key, false, ...)` (GSAP `ScrollReveal` for `intro` / `underMedia`, CSS `RevealSection` otherwise);
- legacy blocks → the existing `div.block-wrapper` branch, untouched, including inside a Section (the wrapper carries their `data-theme`).
Home keeps `AnimatedBlocksContainer` with the Phase 1 guard.

**Routes**: `works/[slug]`, `[slug]` unchanged (they already call `RenderBlocks`). `posts/[slug]` renders `RenderBlocks(post.layout)` after the body; the hero-to-body spacing is the post's own until Phase 4.

**Schema added** (all `CREATE`): `{pages,works,posts}_section`, `*_transition`, `*_blocks_feature_heading_offset`, `*_full_media`, `*_media_split`, `*_split_narrow`, `*_image_pair`, `*_split_offset`, `*_image_statement`, `*_caption`, `*_youtube`, `*_rich_text`, `*_code`, `*_faq` + `_faq_items`, `*_blocks_carousel` + `_slides`, `*_blocks_feature_tabs` + `_tabs` + `_tabs_items`, `*_insight_list` + `_insight_list_items`, each with `shader_*` slot columns where the block has a slot, all `_v` twins, and `posts.layout` rows. Nesting under a Section only changes `_path` semantics; child tables keep their names (sas-site verified this in its Phase B; verify again with `check:migrations:drift` before generating).

Definition of done: an editor can Add Section on a page, work or post, nest any run block, pick a Studio look on a media slot, and publish; existing pages render pixel-identical (Phase 0 screenshots); every ported story renders in Storybook; `pnpm test:storybook` green. Answer sheet: Appendix A, Phase 3.

**Phase 3 as built (2026-09-27).** Migration `20260927_173548_sections_and_run`: no prompts; 138 `CREATE TABLE`, 366 `CREATE TYPE`, indexes and FKs on new tables, and two nullable `works_id` columns on `posts_rels` / `_posts_v_rels` (a Columns block nested in a post Section can hold a work). Zero `DROP`, `RENAME`, `ADD VALUE`; no new name collides with the production catalog, even after Postgres' 63-character truncation. `tsc`, `pnpm test:unit` (18 files, 153 tests), `pnpm test:storybook` (60 files, 316 tests), `pnpm build`, both migration checks green; a throwaway local page with a Section of every run block rendered, and a legacy work page renders as production does. Where the build departs from the plan above:

- **`@payloadcms/drizzle` patch** (`patches/`, `pnpm-workspace.yaml`), copied from sas-site. The Rich text block's write-only `markdown` / `replace` fields are virtual; unpatched, Payload's "identical block" check counts them as missing columns, so a block used both at the top level and in a Section got a second table (`pages_rich_text_2`). A running `pnpm dev` keeps the unpatched module in memory: restart it after `pnpm install`.
- **The old `blocks/YouTube` component was not orphaned**: the Columns block's YouTube column rendered through it. It moved unchanged to `blocks/Content/YouTubeColumn.tsx`; only its unregistered config and story were deleted.
- **`content` is not in `sectionChildComponents`.** `RenderBlocks` renders every legacy block, including a Columns block inside a Section, through the unchanged `block-wrapper` branch; run blocks go through `renderContentBlock`. `processLayoutBlocks` also hides protected works in Columns nested in a Section.
- **Carousel poster** is the video's `cloudflareStreamThumbnailUrl` (sas-site's Media has a generated `poster` upload; this site does not). `Media` gained `autoPlay` (default true) so the Carousel drives playback.
- **Rich text Actions** render sas-site's `Button` directly (this site's `CMSLink` wears the legacy button), with `default` / `outline` (D8). `components/Link/resolve-href.ts` is the one href resolver for `CMSLink`, FAQ and Actions.
- Not ported: `heading-dropdown` and `scramble-text` (only sas-site's IndustryWork uses them). Posts render `content` only when present, then `RenderBlocks(post.layout)`. Works' and Posts' "Meta" tab is "Related & Categories". `vitest.setup.ts` adds sas-site's jsdom stubs for the unit project.

### Phase 4: page furniture (additive schema)

Turns a composed Work or Post into the sas-site page shape.

- **Opening**: `hero.media` wrapped with `heroVisualSlotFields` (D12) on the shared hero group (Pages, Posts, Works all gain it in one change). `HighImpact` and `MediumImpact` render `HeroGround` behind their copy when the slot chose an effect; the FLIP clone pickup keeps its `img`/`video` query and its no-media fallback.
- **Intro band**: `pageIntroField()` (`sas:src/fields/pageHero.ts`) on Posts and Works, minus the override toggle (D1): `eyebrow`, `title`, `body` (richText). Rendered by a port of `sas:src/sections/WorkIntro` (`Section.client.tsx` bespoke entrance built on the shared gate).
- **Contents button**: `sas:src/features/contents/*` (floating index, `clip-path` reveal from the button circle, `@starting-style` on `--ease-out-quint`). Opt-in per document via `showContents` (Posts Content tab, Works and Pages Composition tab). Headings come from the rendered Section openers.
- **Related rail on Posts**: `hideRelatedPosts` checkbox; the existing `RelatedPosts` block stays the renderer.
- **Routes**: `posts/[slug]` = hero → intro → `content` (if non-empty) → `RenderBlocks(layout)` → related. `works/[slug]` = hero → title strip (existing `page.client.tsx`) → intro → `RenderBlocks(layout)`.
- Preview map (`generatePreviewPath`) unchanged.

Schema added: `hero_visual_type` + `hero_shader_*` columns on pages, posts, works and `_v` twins; `intro_*` columns on posts and works; `show_contents` and `hide_related_posts` booleans. Answer sheet: Appendix A, Phase 4.

**Phase 4 as built (2026-09-27).** Migration `20260927_175225_opening_intro_contents`: no prompts; `ADD COLUMN` (nullable, or with a default) on `pages`, `posts`, `works` and their `_v` tables, their enums, indexes and FKs; nothing dropped or renamed. `tsc`, `pnpm test:unit` (19 files, 158 tests), `pnpm test:storybook` (62 files, 324 tests), `pnpm build` and both migration checks green; a throwaway local post with a light-leak hero ground, an intro band, three Sections and the Contents button rendered and indexed its four headings. Where the build departs from the plan above:

- **`hero` is a factory** (`heroField()`), as in sas-site: Payload mutates field configs while sanitizing, and the visual slot must not be shared by three collections. The effect choice shows for High and Medium Impact; the Home hero keeps a plain upload (it draws its own scene), so the upload keeps its own `highImpact | mediumImpact | home` condition.
- **Heroes with no effect render exactly as before.** With one, `HighImpact` adds `isolate bg-background`, blends its media over the ground the way sas-site's does (`-z-20 opacity-85 mix-blend-soft-light`), keeps the media first in the DOM so the FLIP clone still lands on it, and takes a pinned surface for its `data-theme` (dark otherwise). `MediumImpact` grounds through `pinnedOpening`.
- **Intro band**: `intro.eyebrow`, `intro.title`, `intro.body` on Works and Posts (Opening tab), rendered by `sections/WorkIntro` when it has a title, after the work title strip or the post hero.
- **Contents**: `features/contents` verbatim; the takeover-menu focus helper is `utilities/input-modality.ts` and `components/SiteChrome/chrome-scroll.ts` came with it (there is no page frame to freeze here, so it only reads `scrollY`). `--header-height` / `--footer-height` are defined from the SiteFrame bars (8px / 40px on phones, 30px from md, 40px from lg), plus `--radius-menu-card` and `--radius-sheet`. Mounted inside each route's `<article>`.
- **`tw-animate-css` now loads on the site** for the Contents sheet. The legacy form select's shadcn enter/exit classes, inert until now, were removed first so it opens as it always has. Only ported primitives animate; the Dialog story waits for its fade.
- **`cn`** is sas-site's `extendTailwindMerge` (the fluid type tokens are font sizes, tw-animate groups merge), so `text-heading-2` is never dropped as a colour.
- `hideRelatedPosts` sits in the Posts sidebar. O8 (hero facts row) needs nothing: the work title strip already shows industry, role and deliverables.

### Phase 5: Ask (additive schema, new infrastructure)

Source of truth: `sas:src/features/ask/README.md`, then `sas:docs/ask-rag-roadmap.md`, `ask-insights-roadmap.md`, `ask-jev-roadmap.md`.

**Infrastructure first**
- `docker-compose.yml` image → `pgvector/pgvector:pg17` with the inline initdb config `CREATE EXTENSION IF NOT EXISTS vector;` (D11). Update `POSTGRES_DOCKER_IMAGE` in `scripts/dev-tui/constants.ts` and `POSTGRES_IMAGE` in `.conductor/lib.sh`. A new image needs `pnpm db:reset`: back up first, then re-pull production.
- Neon: the migration's `up()` hand-adds `CREATE EXTENSION IF NOT EXISTS vector` before the `ask_embeddings` table (sas-site's `20260714_173641_ask_embeddings.ts` is the pattern). `ask_embeddings` is a drizzle table injected through `beforeSchemaInit` on the adapter (`sas:src/payload.config.ts` around line 125), not a collection.
- `vercel.json` gains the cron `{"path": "/api/payload-jobs/run", "schedule": "*/10 * * * *"}`; jobs access already accepts `Bearer CRON_SECRET`.
- Env: `OPENAI_API_KEY` (required; without it `/api/ask` answers 503), optional `OPENAI_ADMIN_API_KEY`, `OPENAI_PROJECT_ID`, `TYPESAFE_API_KEY`, `ASK_JEV` (`off` by default). Add to `.env.example` and `src/environment.d.ts`.
- Dependencies: `ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `@shadcn/react`, `@tabler/icons-react`, `zod`; optional `@typesafe-ai/sdk`, `botid`.

**Content registry** (`sas:src/shared/content/{surfaces.ts, extract.ts, content-keys.ts, lexicalToMarkdown.ts, options.ts, inquiry.ts}`): `CONTENT_SURFACES` becomes `pages` (`''`, walk), `works` (`/works`, walk), `posts` (`/posts`, richText `content` plus the walk of `layout`). `GLOBAL_SURFACES` is `site-info` only. The search plugin's `collections` grows to the same list so the keyword fallback covers works and pages. Protected works are excluded by construction: the corpus reads every document as an anonymous visitor (`overrideAccess: false`), and `worksReadAccess` hides them.

**Port**
- Collection `sas:src/collections/AskQuestions.ts` and `AskQuestions/components/*` (filters, conversation view, dashboard) with `sas:src/components/admin/{AdminCard, FilterLinks, rest}.tsx`. `topic` relates to `categories`, `plannedContent` to posts and pages: both exist here.
- Plugin `sas:src/plugins/ask-index.ts` (hooks the registry's collections; no options).
- Server `sas:src/endpoints/ask.ts` and `sas:src/features/ask/*` except `storyBrief.ts`, `journeyPages.ts` (case-study and taxonomy specific; stub `resolveStoryBrief` to `null` and `SUBJECT_COLLECTIONS` to `works`). `judge.ts` stays; with `ASK_JEV` unset the endpoint takes the judge-off path.
- Utilities `sas:src/utilities/{afterResponse, emailAddress, posthog, analyticsScope, getGlobals}.ts`. Ours already has `getGlobals.ts` and `posthog-server.ts`; merge `captureServerEvent` into the latter rather than adding a parallel client. `VOICE_PROMPT_LINE` from `sas:src/features/editorial/voice.ts` is one string; inline it in `prompts.ts` with this site's voice.
- Job `sas:src/jobs/askQuestionRetention.ts` (90-day delete, `0 0 5 * * *`).
- Handoff: `sas:src/collections/Inquiries/*` (team-only PII, `askConversation`, `askThread`, Resend notify), `sas:src/blocks/shared/form/{post-inquiry, submit}.ts`, `POST /api/inquiries/submit`. BotID on that route is optional; without it keep the in-memory rate limit.
- Global: new `site-info` with the `ask` group (`hidden`, `rebuildIndex` and `usage` UI fields from `sas:src/features/ask/admin/*`) and `inquiries.responseTime` / `inquiries.scheduleUrl`.
- UI: `AskSession.tsx` in `src/providers/index.tsx`; `AskWidget.tsx` at `src/app/(frontend)/ask/page.tsx`; `messages.tsx`, `Sources.tsx`, `Rating.tsx`, `feedback.tsx`, `HandoffPanel.tsx`, `ContactButton.tsx`, `Composer.tsx`, `SubmitButton.tsx`, `motion.ts`, `useAskChat.ts`; `src/components/ui/{message-scroller, message, bubble, input-group, card, field, input, spinner}.tsx`. `MenuAsk` and `ClosingAsk` are not ported (D10). A Header nav item points at `/ask`.
- PostHog: `ask_questioned`, `ask_rated`, `ask_handoff_clicked`, `inquiry_submitted.from_ask` (server side, `posthog-node` is installed).
- Tests: add a `node` Vitest project beside the Storybook one for `src/**/*.test.ts(x)` and `tests/int/*.int.spec.ts` (`sas:vitest.config.mts` shows `hookTimeout` and `fileParallelism: false`); port `ask.int.spec.ts`, `ask-corpus.int.spec.ts` and the unit tests under `features/ask`.
- Backfill once after deploy: `pnpm tsx --env-file=.env.production.pulled scripts/backfill-ask-index.ts` with `PAYLOAD_DB_PUSH=false`, or Site Info → Rebuild index.

Schema added: `ask_embeddings` (drizzle, HNSW index), `ask_questions` + `_sources` + `_rels`, `inquiries` (+ `_rels`), `site_info`, `payload_locked_documents_rels` columns, the jobs task-slug enum value `askQuestionRetention` (added on its own; check `pnpm check:migrations`). Answer sheet: Appendix A, Phase 5.

**Phase 5 as built (2026-09-27).** Migration `20260927_180824_ask`: `CREATE EXTENSION IF NOT EXISTS vector` hand-added first (Neon offers pgvector 0.8.0 and `neondb_owner` is in `neon_superuser`); `ask_embeddings` with its HNSW index; `ask_questions` (+ `_sources`, `_rels`), `inquiries` (+ `_notes`), `site_info` (+ `_social_profiles`); `ADD COLUMN` on `payload_jobs` (`meta`, for scheduled tasks), `payload_locked_documents_rels`, and `search_rels` (`pages_id`, `works_id`); the task-slug enums gain `askQuestionRetention` by `ADD VALUE`, used by nothing in the same `up()` (`check:migrations` passes). Nothing dropped or renamed. `tsc`, `pnpm test:unit` (33 files, 282 tests, Ask's included), `pnpm test:storybook` (63 files, 340 tests), `pnpm build`, both checks green; locally `/api/ask` answers 503 with no key and the inquiry, Ask-question and Site Info collections round-trip through the Local API. Where the build departs from the plan above:

- **Local image is `pgvector/pgvector:pg17-trixie`**, not `pg17`: the plain tag is Debian 12, the old `postgres:17` image Debian 13, and the glibc change raises a collation version mismatch on the existing volume. Trixie keeps glibc 2.41, so the volume carried over with no `db:reset`; `CREATE EXTENSION vector` was run once by hand and the compose `initdb` config covers fresh volumes.
- **Corpus**: Pages (`home` is `/`), Works (`/works`), Posts (`/posts`, the body plus the walk), and Site Info. No relationship is hydrated (the Content Hub collections do not exist); the works' opening details (`client`, `industry`, `role`, and the `capabilities` list) are text keys. `journeyPages.ts` is ported (its subject pages are works and posts); `storyBrief.ts` is a stub that never returns a brief.
- **Voice**: "Speak for Miles Roxas's design practice ("we")", sas-site's plain-voice rules inlined in `prompts.ts`. Inquiry references read `MR-XXXX`.
- **Inquiries**: sas-site's collection and intake minus the `capabilities` relation and BotID (honeypot and the dedupe window remain). Emails are plain HTML through the Resend adapter (`collections/Inquiries/emails.ts`), to the assigned owner or else Site Info's contact email (default `miles@milesroxas.com`), plus the visitor's receipt.
- **Site Info** is new and trimmed to what Ask reads: name, tagline, description, founding year, contact email, inquiry promises, the Ask group (hide, rebuild index, usage), address, social profiles, notes.
- **Search**: the plugin now indexes pages and works too (the keyword fallback); the `/search` page filters to posts so it lists what it always has. Existing works and pages enter the index when re-saved or reindexed.
- **Cron** is daily (`10 5 * * *`), not every ten minutes: a Hobby plan allows one run a day, and retention is the only task.
- **Header**: an "Ask" entry in the menu, code-owned and hidden with Site Info › Ask › Hide Ask. `AskSessionProvider` wraps the site in `providers/index.tsx`.
- **Storybook**: the handoff plays wait for the form's settle focus and give the receipt five seconds (sas-site never ran them as browser tests). New primitives: `bubble`, `field`, `input-group`, `message`, `message-scroller`, sas-site's `card` and `textarea` (this site's textarea moved to `legacy-textarea.tsx`).
- **Not done here**: `OPENAI_API_KEY` (and optionally `OPENAI_ADMIN_API_KEY`, `TYPESAFE_API_KEY`) must be added in Vercel before `/api/ask` answers; then run the backfill (`pnpm exec tsx --env-file=.env scripts/backfill-ask-index.ts`, or Site Info › Ask › Rebuild index). The int specs (`tests/int/ask*.int.spec.ts`) were not ported: they boot Payload against a database.

### Phase 6: content migration (scripted, no admin re-authoring; the production run is Phase 9)

Nothing before this phase changes what production renders. This phase moves every legacy block onto the sas-site run with one script, `scripts/compose-layouts.ts` (D15). Nobody rebuilds a block in admin. The script writes drafts, so production changes only when `--publish` runs.

Mapping principle (D16): each legacy block becomes the sas-site block and variant that does the same job. Presentation fields with no sas-site equivalent are dropped, not emulated: `space`, column `sizes`, `textSize`, `captionLayout` type sizes, `sectionHeading.size` and `style` (`style` was never rendered), `aspectRatio` on Caption, and the legacy media `fullWidth` inside a column. The ported block's own variants decide the look. Copy and media are never dropped; the preservation check enforces that.

**Audited usage (local pull 2026-09-27, works).** 61 `content` blocks with 89 columns: 38 section headings (all paragraphs, never heading nodes; 26 are over 80 characters, so they are statements, not headings; 17 carry an eyebrow), 44 text columns (paragraphs, h2 and h3 only; 3 contain links; several are empty spacer columns), 5 media, 1 YouTube, 1 slider (the one slider column sits beside a section heading column, so it is the only C6 in production). 53 `mediaBlock`: 24 are videos; 12 show a caption (6 `split-*`, 6 `left`/`right`, 0 `center`); 3 hide caption text behind `showCaption: false`; 7 are full width. 8 `slider` (4 with an intro heading; 6 `default`, 2 `cropped`; no slide links). 4 `tabs` with 13 tabs, every tab a `single` slider (73 slides, no captions). The `archive`, `cta` and `formBlock` rows pass through.

**Grouping into Sections.** Walk each `layout` in order and keep one Section open:
- A new Section opens when a block produces an opener (a Standard, from any rule below), or when the band changes (legacy `dark` against `light`/`system`).

**The section-opener layout.** Every converted section heading is a Standard with `layout: 'prose'` and `headingLevel: 'h2'` (`SECTION_OPENER_LAYOUT` in `rules.ts`), whatever the legacy `align` said. Prose is the only layout that binds an opener to the run it introduces: it sits on the reading column and `SectionBand` closes the gap beneath it, so the heading reads as the title of the blocks under it. The other layouts are page furniture, which left a converted heading floating above its own content. h2 is the level a section opener holds in the page outline; nothing below it emits an h1. Two consequences: legacy `align: 'center'` is not carried over, and Offset (`featureHeadingOffset`) is no longer a conversion target, though it stays available to authors.

A Standard's `body` runs on the **root editor**, which enables no heading feature at all, so every rule that fills one passes its nodes through `headingsAsParagraphs`. Clamping to `h2`/`h3` there, as the Rich text block's body does, would store nodes the field cannot produce or render.
- Band: `dark` → `customize: true`, `theme: 'inverted'`; `light` and `system` → Section defaults (`inherit`). Children keep their default `theme`, because the Section owns the band. Section `spacing` and `stack` stay `default`.
- `archive`, `cta`, `formBlock`, `callout`, and any `content` block that holds a `work` or `post` column pass through untouched at top level and close the open Section. That covers all three `content` blocks on `pages/home`, so Pages need no conversion.

**Rules.** Every rule has an id. The dry-run report prints the rule id and the legacy block id beside each output block.

`content` columns are read left to right. Empty text columns (spacers) are dropped first. Section heading columns go through the H rules, and the columns that remain go through the C and T rules.

| Id | When | Becomes |
|---|---|---|
| H1 | Section heading, first paragraph 80 characters or fewer | Standard (`richTransition`) on the section-opener layout: `eyebrow`, `heading` = first paragraph, `body` = any further paragraphs |
| H2 | Section heading, longer, with an eyebrow | Standard on the section-opener layout: `heading` = the eyebrow, `body` = the statement paragraphs |
| H3 | Section heading, longer, no eyebrow | Rich text: `body` = the statement paragraphs |
| T1 | One text column | Rich text, body as is (`h4` → `h3`, where the Rich text editor stops) |
| T2 | Two or more text columns, each made only of heading-then-paragraphs runs, no links | Rich text, the columns concatenated in order with every heading at `h3`. `runsOf` reads the columns only to recognise the shape; the nodes go through as authored, so inline marks survive. h3 is the level the Insight block rendered a title at, and it nests the runs under the section's h2 opener. The Insights block (`insights`) is no longer a conversion target; it stays available to authors |
| T3 | Two or more text columns, the first a lone heading (one heading node, or one paragraph of 80 characters or fewer) | Standard on the section-opener layout: `heading` = that text, `body` = the other columns in order |
| T4 | Any other set of two or more text columns | Rich text, the columns concatenated in order |
| C1 | One media column plus one text column | Split narrow (`splitContentNarrow`): `imagePosition` from the column order; a leading heading in the text becomes `heading`, and the rest becomes `body` (other headings → `h4`, the only level in the content-column editor) |
| C2 | Two media columns | Pair (`imagePair`): the square or portrait image → `portraitMedia`, the other → `landscapeMedia`, `portraitPosition` from the column order |
| C3 | A media column in any other combination | Caption (`caption`, `size: 'full'`) per media column, then the text columns by T1 to T4 |
| C4 | YouTube column | YouTube (`youtube`): `url`, `size: 'full'` |
| C5 | A slider column with no copy column beside it | Carousel by S1 |
| C6 | One slider column beside only section-heading and text columns | One Carousel split (`carouselSplit`): slides and `slideSize` by S1, `carouselPosition` from the column order, copy from the other columns (the first section heading's eyebrow, a leading heading node or short paragraph as `heading`, the rest as `body` with headings clamped to `h4`). The slider's own intro heading still opens a Standard before it (S2) |

Legacy Media block (`mediaBlock`). A caption counts only when `showCaption` is on and its text is not empty.

| Id | When | Becomes |
|---|---|---|
| M1 | No caption, not full width | Caption (`caption`), `size: 'full'` (the page container, as today) |
| M2 | No caption, full width, `aspectRatio` **not** `original` | Stacked (`fullMedia`): `showContent: false`, `width: 'full-width'` (sas-site's only edge-to-edge media; it crops to 16:9, then 21:9 from `md`). A media authored `original` never cropped legacy-side, so it takes M1 instead: a cropped 3D render loses more than a contained one |
| M3 | Caption, `captionLayout` `left` or `right` | Stacked: `showContent: true`, `body` = caption, `contentPosition` = `left` or `right`, `width` from `fullWidth`, `aspectRatio: '16-9'` when contained |
| M4 | Caption, `split-left` or `split-right` | Split narrow: `body` = caption, `imagePosition` `left` for `split-left` (the media came first) and `right` for `split-right` |
| M5 | Caption, `center` | Caption with `captionOverride` = caption (no rows today) |

Slider and Tab slider:

| Id | When | Becomes |
|---|---|---|
| S1 | Any slider | Carousel (`carousel`): each slide `media` = `slide.image`, `caption` = `slide.caption`; `slideSize` is `full` for `single` and `half` for `default` and `cropped`; `width: 'full-width'` (the legacy Slider ran the window; a contained deck reads as a shrunken one) |
| S2 | Slider with `introContent.heading` | A Standard before the Carousel, opening a Section on the section-opener layout: `heading` = intro heading, `body` = subheading |
| TB1 | Tab slider whose every tab is a slider of two or more slides (all four in production) | One Carousel tabs block (`carouselTabs`), which is a split and owns its copy column, so the heading group travels into it as `eyebrow`, `heading` and `body` rather than becoming a Standard a whole band above the strip. A tab per legacy tab, `title` = tab title and `slides` = that tab's slides. `slideSize` is `full` when every tab slider is `single`, else `half`; `tabSize` is `small` from five tabs, else `default` |
| TB2 | Any other Tab slider (one that mixes copy into its tabs; none in production) | The flattened Section TB1 used to write: the heading Standard, then per tab a Standard (`layout: 'left'`, `heading` = tab title), its Rich text, and a Carousel of its slides. The tabbing is lost, nothing else is |

**Overrides.** `scripts/composer/overrides.ts` maps a legacy block id to another rule id, or to `keep` (leave the legacy block in place). To change a mapping, edit this file and run the script again. Nothing is done in admin.

**Preservation check.** Before any write, the script collects every media id and every non-empty text string from the legacy layout: text nodes, eyebrows, captions, slide captions, intro and tab headings, YouTube URLs. It asserts that each one appears in the output. The declared drops are only these: captions hidden by `showCaption: false` (3 today), empty spacer columns, and inline formatting on text that moves into a plain-text field (a Standard heading, an Insight description). A document that fails the check is skipped and reported, and nothing is written for it.

**CLI** (`scripts/compose-layouts.ts`). The flags, snapshot and restore follow `sas:scripts/wrap-sections.ts`; the transform is new.
- `--dry-run`: per document, the before and after tree with rule ids, the dropped fields, and the warnings. Writes nothing.
- No flag: writes each converted document as a **draft** (`draft: true`), so live pages keep rendering the published legacy layout. Every input `layout` goes to `scripts/snapshots/compose-layouts-<timestamp>.json` first.
- `--publish`: re-reads each converted document's latest draft and publishes it. Revalidation is skipped, as in sas-site, so redeploy afterwards.
- `--restore <snapshot>`: writes the snapshot layouts back.
- `--only <collection>/<slug>`: one document. Documents with no legacy blocks left report `unchanged`, so a second run is a no-op.

Files: `scripts/composer/{transform.ts, rules.ts, lexical.ts, preserve.ts, overrides.ts}` and `transform.test.ts`. The test runs under `pnpm test:unit` against fixtures from the Phase 0 snapshot. It asserts that every work converts, that preservation passes, that no Section nests a Section, and that every output block slug is in its collection's block list.

**Pending draft.** `design-systems-for-organizational-scale` has an unpublished draft from 2026-06-12 that is newer than its published version. The script converts the latest draft and flags the document, so `--publish` would also ship those June edits. Publish or discard that draft before Phase 6. **Resolved 2026-10-01**: published in admin.

**Posts (6 documents).** The same CLI runs a posts transform with the same flags: split `content` at every `h2` node. Each split becomes a Section holding a Standard (`layout: 'prose'`, `headingLevel: 'h2'`, heading = the h2 text) followed by a Rich text block with the nodes up to the next h2. Inline `code` nodes become Code blocks, inline `mediaBlock` nodes become Caption blocks, and `banner` stays inside the body (Phase 3 added it to the Rich text editor). It writes `layout` as a draft and leaves `content` untouched; the route prefers `layout` when it is not empty.

Checklist:
- [ ] Phases 3 and 4 are deployed, so every target block exists in production.
- [x] Resolve the pending draft on `design-systems-for-organizational-scale` (published 2026-10-01).
- [ ] Re-pull production, back up, re-run the inventory, then `--dry-run` locally and read the report. Adjust `overrides.ts` and repeat until the report reads right.
- [ ] Run locally, check every work in live preview, `--publish` locally, and take screenshots.
- [ ] Take a Neon backup. Run against production with `.env.production.pulled` and `PAYLOAD_DB_PUSH=false`, check live preview, then `--publish` and redeploy.
- [ ] `_v` history keeps the legacy shape; it stays restorable until Phase 7 drops columns.

**Phase 6 as built (2026-09-27): the script, proven on the local copy of production. Nothing has been written to Neon.** Production does not have the Phase 3 and 4 tables yet (they are on `dev`), so the production run waits for `main`.

- **Files**: `scripts/compose-layouts.ts` and `scripts/composer/{lexical,rules,transform,preserve,overrides}.ts`, tested by `scripts/composer/transform.test.ts` (every rule, grouping, posts, preservation; plus every work in the newest local snapshot when one exists). Snapshots go to `scripts/snapshots/` (gitignored).
- **Dry run (local pull of production)**: 13 documents convert (9 works, 4 posts), 0 fail preservation; every page is unchanged (the three Columns blocks on `home` hold work cards and pass through, as planned). The rules produced H1-H3, T1-T4, C1-C5, M1-M5, S1, S2 and TB1 on real data. `overrides.ts` is empty.
- **Round trip, local**: drafts written, `--publish` shipped 12 (`prospect-park` was never published and stays a draft), every converted work and post renders; `--restore` put the database back so exactly that a full read of every work, page and post, published and latest, matched the pre-run read field for field. A second run is a no-op.
- **Local and preview, kept (2026-09-27)**: re-run and left in place on the local Docker DB, then on the Neon `preview/dev` branch (`br-dry-sea-a4r6p3me`, endpoint `ep-proud-bird-a4d5j6rh`, a child of `main`). The preview branch holds an older copy of production content (five posts and five pages, works last edited January 2026), so preview shows that content converted: 13 drafted, 12 published, 0 preservation failures. Backups: `.dev-tui/backups/local-2026-09-27-pre-compose-view.dump`, `.dev-tui/backups/preview-dev-2026-09-27-pre-compose.dump`. The script now refuses any database but the local one unless the run passes `--preview` (which also refuses the `PRODUCTION_DB_ENDPOINT` host) or `--production`.
- **Departures from the plan above**:
  - **Snapshots hold whole documents**, the published version and the latest draft, not the layout alone: `--publish` ships a pending draft, and only the whole published document can bring back what was live. `--restore` writes the published version, then the draft over it, and checks both.
  - **Every write is read back.** A save can resolve and still roll back: the search sync failed inside the transaction for posts with a category (the category's id was stored as the search row's primary key, null at depth 0 and duplicated across posts), and Payload only logged it. `src/search/beforeSync.ts` now gives each row an id of its own and reads the titles; the CLI fails loudly when a document does not land.
  - **Posts' body editor keeps `h5`**: one post uses it, and publishing revalidates the body. No schema change.
  - **The post route renders `content` only while `layout` is empty**, so a composed post does not print its article twice.
  - The preservation check follows only the column group a Columns column renders (`content` / `contentType`): the others are leftovers from an earlier choice ("hello" in a hidden text group) that no visitor sees.
  - Legacy `blockName` ("Intro", "My Role") carries onto the first block each legacy block produces.

The production run is Phase 9, step 4.

### Phase 7: contract and normalize (one PR per bullet, each with its own migration, after the Phase 9 content run has soaked)

- [ ] Theme enums on the five legacy blocks. **Enums done 2026-10-01** as band roles (Section 5, "Band themes became roles"): migration `20261001_232240_band_theme_roles`; the components read `sectionThemeClass`; `useBlockTheme.ts` and `ClientBlockWrapper.tsx` are deleted. **Open:** the hardcoded `data-theme` on the heroes, CallOut and the work title strip. These are absolute pins, a scope the polarity model keeps on purpose (a hero over media stays dark in both themes), so convert one only where it should flip with the visitor.
- [ ] Retire legacy blocks from the drawer once no document uses them (config only, no schema). Tables stay until a later drop.
- [ ] Posts `content`: drop the field only if every post has moved; otherwise leave it optional forever.
- [x] Remove dormant dependencies and config (D13), done 2026-09-27 (no consumers, no schema): `glslify`, `glslify-import`, `glslify-loader`, `glsl-canvas-js`, `glsl-noise`, `glsl-easings`, `glsl-fast-gaussian-blur`, `raw-loader`, `shader.d.ts`, the Turbopack `.glsl/.vert/.frag` rules, `src/hooks/useHoverShader.ts`, `useImageCropMaterial.ts`, `src/utilities/texturePreloader.ts`, `calculateMeshScale.ts`, `src/animations/*` (unused), `swiper`, `next-view-transitions`, `payloadcms-lexical-ext`, `hamo`, `split-type`, `leva` (no demo playgrounds here).
- [x] Delete `src/blocks/YouTube` (Phase 3: its config and story; the component lives on as `blocks/Content/YouTubeColumn.tsx`, which the Columns block renders) and the orphan `src/global.d.ts` import of `./r3f/components/CardPlane/PlaneWithImage`, done 2026-09-27.

The first three bullets stay open on purpose: each changes or retires production content, and waits for the Phase 9 content run to have soaked. They are the only phase that ships to `main` on its own, after the cutover.

### Phase 8: optional, in any order (the last code phase before the cutover)

- [x] **Figures** (`chart`, `diagram`) with `sas:src/plugins/figures` and `sas:src/features/figures`, done 2026-09-30. Joins the run under Figures. Notes below; the system is documented in [figures.md](figures.md).
- [x] **Carousel tabs** (`carouselTabs`), done 2026-09-30. A deck per tab, so a Tab slider keeps its tabs through Phase 6 (O9). Joins the run under Interactive. Notes below.
- [x] **Carousel split** (`carouselSplit`), done 2026-09-30. A deck beside its copy, so a carousel can sit next to words as the legacy Columns grid allowed. Joins the run under Media and content, and Phase 6's C6 maps the legacy shape onto it. Notes below.
- [x] **A visitor light/dark theme** (`sas:src/providers/Theme/*`, `InitTheme`), done 2026-09-30. Notes below; the toggle is documented in [site-chrome.md](site-chrome.md).

**Carousel tabs as built (2026-09-30).** `src/blocks/carousel-tabs/{config.ts, CarouselTabs.tsx, Component.tsx, Component.stories.tsx}`, registered in `sectionNestableBlocks` (Interactive, before Tabs) and in `sectionChildComponents`. Fields: `tabs` (two to eight rows of a `title` and that tab's slides), `slideSize`, `showArrows`, `tabSize`, `theme`. Tables `{pages,works,posts}_blocks_carousel_tabs(_tabs)(_slides)` plus `_v` twins.

- **Two extractions, so nothing is stated twice.** `blocks/shared/carousel-fields.ts` holds the slide array, `slideSize` and `showArrows`, and the Carousel block, Carousel split and Carousel tabs all take them (each passes only its own admin description). `blocks/shared/tabs.tsx` holds the trigger strip and the Radix root that Tabs already had, and both tabbed blocks render through it; `tabSizeField()` joined `shared/fields.ts` beside `themeField()`. Both extractions are schema-neutral: the generated schema is identical outside the new tables.
- **A deck per panel, not a copy of one.** Each panel renders `CarouselBlock` `bare` with its gutter off, as Carousel split does. Radix mounts only the active panel, so exactly one embla instance and one per-frame writer is ever live, however many tabs a block has.
- **A client component.** `renderPanel` is a function, and a function cannot cross the server/client boundary into `TabbedPanels`, so this file carries `'use client'` as `FeatureTabs.tsx` does. A server component here renders as a 500, not a warning.
- **Out of `blockRevealVariants`**, for the reason Carousel split is: the deck writes its own per-frame transforms, so the block takes the CSS block reveal instead.
- **Laid out as a split**, copy in columns 1-3 from `lg` and the strip plus the deck in 4-8, stacked below that. It carries its own `eyebrow`, `heading` and `body` (`contentLexical`), which is the one place this block departs from the convention that section headings live in a Standard: a Standard is a band with the run's rhythm around it, and it left the strip 225px below the words introducing it. The strip aligns to the start here rather than centring (`align` on `TabbedPanels`), because it shares a grid row with the copy.
- **Settings are per block, not per tab.** The tabs are alternatives to each other, so a deck that changed size when the reader switched would read as a different component.

**Carousel split as built (2026-09-30).** `src/blocks/carousel-split/{config.ts, CarouselSplit.tsx, Component.tsx, Component.stories.tsx}`, registered in `sectionNestableBlocks` after Split narrow and in `sectionChildComponents`, so every surface that offers the run offers it. Fields: `eyebrow`, `heading`, `body` (`contentLexical`), `slides` (media plus caption, the Carousel's slide fields), `carouselPosition` (`left` / `right`, default right), `slideSize`, `showArrows`, `theme`. No `dbName` function: the slug is short enough that the default per-parent names fit (`{pages,works,posts}_blocks_carousel_split` and `_slides`, plus `_v` twins).

- **The deck is the Carousel block, not a copy of it.** `CarouselSplit.tsx` renders `CarouselBlock` with `bare` and `enableGutter={false}`, so the slide pose, the velocity RGB split and the poster dissolve are one implementation in both blocks. `Carousel/*` is untouched, so a later re-port from sas-site still applies cleanly.
- **Same tracks as Split narrow**: deck 5 columns at `md` and 6 from `lg`, copy the rest, mirrored by `carouselPosition`, stacked below `md` with the deck first. A deck and a single image therefore read as the same layout down the page.
- **No `data-reveal` markers and no `blockRevealVariants` entry.** The deck writes its own per-frame transforms on the slides, so the block takes the CSS block reveal from its renderer exactly as the Carousel block does, and the two move alike.
- **Not ported to sas-site.** It is this site's block; it does not block a later port of anything.

**Visitor theme as built (2026-09-30).** No schema. `providers/Theme/{index.tsx,shared.ts,InitTheme}` ported from sas-site (`types.ts` was already here for `useSiteTheme`), `ThemeProvider` outermost in `providers/index.tsx`, `InitTheme` in the root `<head>`. Stored choice wins, then `prefers-color-scheme`, then light. `tsc`, `pnpm lint:ci`, `pnpm test:unit`, `pnpm test:storybook`, `pnpm build` green; both themes walked in Chrome over `/`, `/works`, a work, a post, `/contact` and the Ask panel. Where it departs from sas-site:

- **No `html { opacity: 0 }` guard.** sas-site hides the document until the bootstrap stamps a theme. The script already runs before the body is parsed, and the guard's failure mode is a permanently invisible site, so it was left out.
- **The toggle is in the top bar**, beside the clock, not in a menu or the footer (neither exists here). It reads `useSiteTheme()` (the attribute) rather than the provider's context, so its mark is right on the first client render with no mount flag, and it still reads correctly in Storybook, which drives the same attribute.
- **Chrome materials follow a dark document too**, not only a dark band: `[data-theme="dark"] [data-chrome]` joins the existing `[data-chrome][data-theme="dark"]`. `--chrome-ink` needed nothing, it reads `--foreground`.
- **Four surfaces used inverted tokens** and so flipped with the theme instead of staying dark: the post article and its "More posts" section (`bg-primary`), the post title (`text-primary-foreground`) and the Related posts rail. They now take `bg-tertiary` / `text-tertiary-foreground`, the dark band ground of whichever palette is on. In the light theme this is a 4% lift off pure black and nothing else. `bg-card` surfaces (CTA, Banner info, Tabs card) state `text-card-foreground` rather than inheriting the page's ink, which they never should have.
- **A subtree pinned `data-theme="dark"` renders identically in both themes** (the stamp restates the whole palette), so the heroes, the work title strip, CallOut and every legacy forced-dark block were unaffected. Phase 7 still converts them to band classes.
- **Known, unchanged**: the top bar and dock read *bands*, not media, so chrome ink over a photo is whatever the band under it says. That was true before the theme and is true in both.

**Figures as built (2026-09-30).** Migration `20260930_140439_figures` (no prompts): 12 `CREATE TABLE` (`{pages,works,posts}_{chart,diagram}` and their `_v` twins), 24 `CREATE TYPE` (each table's `width` and `theme` enums), their indexes and FKs. Zero `DROP`, `RENAME`, `ADD VALUE`. `tsc`, `pnpm lint:ci`, `pnpm test:unit` (45 files, 427 tests), `pnpm test:storybook` (65 files, 365 tests), `pnpm check:migrations` and `check:migrations:drift` green; a throwaway local page rendered a chart at the top level and a diagram plus a chart inside a Section, the diagram's geometry was computed on save (6 nodes, version 1), and a bad spec was refused by path. Where the build departs from the plan above:

- **Bespoke figures are not ported** (`bespokeFigure`, `features/figures/registry/`): its registry holds sas-site's own drawings, so the block would have arrived empty. The plugin, the barrel and the block list carry two kinds instead of three. Adding it later is additive.
- **`figureBlocks`** is exported from `blocks/shared/section-blocks.ts` as sas-site does, so a surface that builds its run by hand takes the same pair. `plugins/figures` finds the collections that offer them by slug.
- **The content walk needed nothing**: `shared/content/extract.ts` already carried `textalternative` as a text key and `spec` / `geometry` as skip keys (they came with Phase 5), so a figure reaches Ask and search through its words.
- **Series colors** are sas-site's, re-checked against this site's grounds rather than assumed: 3.36 to 4.06 on the page ground, 5.12 to 6.47 on the dark band, all over the 3:1 non-text floor. The figures CSS (colors, diagram entrance, chart canvas fade, data disclosure) is verbatim otherwise.
- **`recharts` is 3.10**, not sas-site's 3.8; `elkjs` matches at 0.12. No source change was needed.
- The `@payloadcms/drizzle` patch that Phase 3 already carries covers the figure blocks too (both are offered at the top level and inside a Section).

---

### Phase 9: cutover (merge `dev` to `main`, once, last)

Everything above lands on `dev`. This phase is the only production event: one merge, one CI migration pass, one content run.

1. **Gate.** Phases 1 to 5 deployed nowhere yet, Phase 6's script proven locally and on preview, Phase 8 decided (shipped or dropped, not half-built). `tsc`, `pnpm lint:ci`, `pnpm test:unit`, `pnpm test:storybook`, `pnpm build`, `pnpm check:migrations`, `pnpm check:migrations:drift` green on `dev`. `pnpm migrate:status` clean on production.
2. **Merge.** `dev` to `main` (one PR, the whole composer). Vercel's `pnpm ci` runs `payload migrate`: every migration from `20260927_171656_streak_studio` forward applies in order, all additive. Back up Neon first.
3. **Env.** Add `OPENAI_API_KEY` in Vercel (Phase 5, "Not done here"), then backfill the Ask index (Site Info › Ask › Rebuild index).
4. **Content run.** The Phase 6 script against production:
   1. Decide the pending draft on `works/design-systems-for-organizational-scale` (June edits over the published version): publish or discard it in admin. Otherwise `--publish` ships it. Done 2026-10-01: published.
   2. Back up Neon (a `pg_dump` or a branch), and pull `.env.production.pulled`.
   3. `PAYLOAD_DB_PUSH=false pnpm exec tsx --env-file=.env.production.pulled scripts/compose-layouts.ts --production --dry-run`, read the report. Without `--production` the script refuses any database but the local Docker one (`--preview` targets the Neon preview branch and refuses production).
   4. Same command without `--dry-run`: drafts only, the site keeps rendering the legacy layouts. Check each work in live preview.
   5. `... --publish`, then redeploy (revalidation is skipped). To undo: `... --restore scripts/snapshots/<file>.json`.
5. **MCP.** Re-point `milesroxas-cms` from the dev alias to production and drop the bypass header (`docs/mcp.md`).
6. **Soak**, then Phase 7's three open bullets.

---

## 7. Animation parity

The contract (`sas:docs/animations.md`): one variant per block everywhere, two reveals each owned whole, play-once gates that measure position not visible fraction, no hand-rolled reveal tweens, reduced motion renders the final state.

| System | sas source | Here |
|---|---|---|
| Scroll reveal (GSAP): text drop with blur settle, media clip wipe, `data-reveal-group`, per-track IntersectionObserver gate, `SCROLL_REVEAL_INTRO` (y 28, blur 6, 0.9 s, `power3.out`, stagger 0.12), `SCROLL_REVEAL_UNDER_MEDIA` (y 20, blur 10, 0.6 s, stagger 0.04, media 0.8 s, `mediaScaleFrom` 1, offset 0) | `src/shared/ui/scroll-reveal/scroll-reveal.tsx` | Phase 1, verbatim |
| Block reveal (CSS): whole-block fade-up, optional staggered children | `src/shared/ui/reveal-section/RevealSection.tsx` + `.reveal-section` rules | Phase 1, verbatim |
| Reveal swap: in-place two-half opacity swap for panels | `src/shared/ui/scroll-reveal/use-reveal-swap.ts` | Phase 1 (Tabs and Ask handoff use it) |
| Disclosure: `grid-template-rows` 0fr↔1fr track, inset clip, `inert` when closed | `.disclosure-body` in `globals.css` | Phase 1 (FAQ, Ask sources) |
| Per-block variant map | `src/blocks/shared/reveal-variants.ts` | Phase 1, trimmed to shipped slugs |
| Carousel: velocity-driven RGB split (`quickTo`), poster dissolve | `src/blocks/Carousel/{use-carousel-effects, playback}.ts` | Phase 3 |
| FAQ: accordion glyph quarter-turn on `--ease-out-quint`, 200 ms | `src/blocks/faq/Component.client.tsx` | Phase 3 |
| Contents button: `clip-path` reveal from the button circle, `@starting-style` 300 ms, 200 ms exit | `src/features/contents` | Phase 4 |
| Intro band entrance | `src/sections/WorkIntro/Section.client.tsx` | Phase 4 |
| Ask motion | `src/features/ask/motion.ts` | Phase 5 |
| Streak field / light leak poster crossfade, admission, context loss | `src/features/immersive/visual/*` | Phase 2 |
| Route transitions, hero landing, page intro, takeover menu, marquee, index banner, audience tabs, featured work pin, scroll gallery | | not ported |

Integration rules here:
- `AnimatedBlocksContainer` skips `data-scroll-reveal` roots (Phase 1).
- `SiteFrame` and the card FLIP transition are untouched; `HighImpact` still owns the clone landing.
- `ScrollReveal` gates on IntersectionObserver, so the window scroller under `ReactLenis` needs no proxy. `MediaLoader`'s debounced `ScrollTrigger.refresh` keeps its job for the legacy blocks.
- `usePrefersReducedMotion` returns the final state for every ported system.

---

## 8. Storybook plan

- Phase 1: `Blocks/Section` (theme × spacing matrix, multi-child rhythm, customize on/off) rendered with placeholder children.
- Phase 3: one story file per ported block, retitled to sas-site's taxonomy; `pnpm test:storybook` runs them as browser tests. Visual baseline reset expected once.
- Phase 4: `Sections/WorkIntro`, `Features/Contents`.
- Phase 5: `Features/AskWidget` (with `sas:src/shared/testing/shadcn-helpers/ai-sdk/`).
- `src/stories/Overview.mdx` records what stays unstoried (SiteFrame, HomeHero, HighImpact, R3F runtimes).

---

## 9. Risk register

| Risk | Mitigation |
|---|---|
| Content loss during Phase 6 | Additive-first sequencing; Neon backup plus Phase 0 JSON snapshot; the script's preservation check (every legacy text string and media id must appear in the output, or the document is skipped); drafts before `--publish`; `--restore`; `_v` history until Phase 7 |
| A Phase 6 rule maps a block onto the wrong variant | Rule id per block in the dry-run report; `overrides.ts` re-maps one block without touching the rules; live preview of drafts before `--publish` |
| A ported block's slug collides with a legacy table | Section 4 register; `check:migrations:drift` must show only `CREATE` in Phases 2 to 5; a `rename` prompt aborts the run |
| Double entrance on `home` (AnimatedBlocksContainer + reveal) | Phase 1 guard, verified in Storybook and on `/` |
| Studio publish endpoint writes Media fields we do not have | Seam listed in Phase 2; int test on `/publish` |
| `Media` prop mismatch breaks the media wipe (`htmlElement={null}`) | Phase 1 spike before any block lands |
| pgvector missing on Neon or on a Conductor workspace DB | `CREATE EXTENSION IF NOT EXISTS vector` in the migration and in the compose initdb; `.conductor/lib.sh` creates workspace DBs from the image that carries it |
| PG 18 vs 17 mismatch after the image swap | Stay on 17 (D11); `db:reset` then re-pull |
| Ask cost | `OPENAI_API_KEY` unset in preview keeps `/api/ask` at 503; rate limit per instance; retention job |
| Protected works leak into the Ask corpus | Corpus reads as anonymous; `worksReadAccess` excludes them; add an int test asserting no `ask_embeddings` row for a protected work |
| Enum hazards in Phase 7 | normalize-first `UPDATE`s, one enum change per migration, `pnpm check:migrations` |
| Version-history restores after Phase 7 drops columns | Accepted; documented; snapshot kept |
| Editors confused by two Tabs and two media blocks in the drawer | Distinct labels (Tab slider vs Tabs; Media vs Caption); Phase 7 retires the legacy entries |
| Payload 3.90 vs 3.88 API drift in ported admin components (`useField`, `useDocumentDrawer`, `blocks-drawer__*` class names) | `pnpm generate:importmap`, `tsc`, and a manual admin pass per phase; `BlocksDrawerTabs` degrades to Payload's default drawer if the markup changed |

---

## 10. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| O1 | Keep Posts `content` as the article body long term (sas-site Posts do), or move every post fully into Sections (the Lab Page shape)? | Fully into Sections, since the ask is "posts like Lab pages". Keep the field optional until every post has moved |
| O2 | Re-add the Footer global for the Closing band? | **Settled 2026-10-01**: no. It was removed on purpose |
| O3 | Ask entry points beyond `/ask` and the nav | **Settled 2026-09-29**: the dock Ask panel (`docs/site-chrome.md`) |
| O4 | Jev (TypeSafe) on for Ask? | Off at first (`ASK_JEV` unset); turn on shadow after a week of questions |
| O5 | Add the `text` link appearance (D8)? | Not now; revisit when the Actions block is wanted with text links |
| O6 | Figures in the run? | **Settled 2026-09-30**: chart and diagram are in the run ([figures.md](figures.md)); bespoke figures are not |
| O7 | Band token values | Start from sas-site's oklch values; retune against IBM Plex and the orange accent on `/demo`-style stories before Phase 3 ships |
| O8 | Work Details tab (industry, role, deliverables) as a hero facts row like `CaseStudyHero`? | Yes, in Phase 4, read from the existing text fields; no schema |
| O9 | Tab slider in Phase 6: every tab holds a slider (3 to 12 slides). sas-site's Tabs (`featureTabs`) holds one media per tab, so it would keep 13 of 73 images | **Settled 2026-09-30**: a `carouselTabs` block of our own, a deck per tab. TB1 maps every production Tab slider onto it, so all 13 tabs and 73 slides survive as tabs. The first answer here (flatten each tab into a Standard plus a Carousel) is now the TB2 fallback for a Tab slider that mixes copy into its tabs |
| O10 | Move each work's opening statement (7 of 9 works open with one, 103 to 377 characters) into the Phase 4 intro band? | Not by default. sas-site's intro needs a short statement title, which the legacy data does not have. The statements go through H2 or H3 instead |
| O11 | Visitor theme | **Settled 2026-09-30**: shipped, OS preference honoured, toggle in the top bar |
| O12 | A carousel beside copy: refine the ported `carousel` block, or add one of our own? | **Settled 2026-09-30**: a new `carouselSplit` block. Adding copy fields to `carousel` would drift the ported config from sas-site; the split reuses the same deck component, so nothing is duplicated but the shell |

---

## Appendix A: expected `migrate:create` answer sheets

Never run without asking. Every phase below is additive, so **no create/rename prompt is expected**; `migrate:create` should write the file without questions. If it asks, the answer is **create** for anything named here, and a **rename** offer against an existing table means a `dbName` collided: abort, re-run `pnpm check:migrations:drift`, compare its table list to the phase's list.

- **Phase 2** `pnpm migrate:create streak-studio`: `streak_looks`, `streak_looks_texts`, `_streak_looks_v`, `_streak_looks_v_texts`, `enum_streak_looks_effect`, `enum_streak_looks_status`, `enum__streak_looks_v_version_effect`, `enum__streak_looks_v_version_status`, `payload_locked_documents_rels.streak_looks_id`. All create.
- **Phase 3** `pnpm migrate:create sections-and-run`: `{pages,works,posts}_section` and every per-parent run table listed in Phase 3 with `_v` twins, their enums, FKs and indexes; `posts` gains no column (`layout` is rows in `posts_section` and the run tables). Expect several hundred `CREATE TYPE` / `CREATE TABLE` statements and zero `DROP`, zero `ALTER ... RENAME`, zero `ADD VALUE`.
- **Phase 4** `pnpm migrate:create opening-intro-contents`: `hero_visual_type` enums and `hero_shader_*` columns on `pages`, `posts`, `works` and `_v`; `intro_eyebrow`, `intro_title`, `intro_body` on `posts`, `works`; `show_contents` on `pages`, `posts`, `works`; `hide_related_posts` on `posts`. All create; no prompt.
- **Phase 5** `pnpm migrate:create ask`: hand-add `CREATE EXTENSION IF NOT EXISTS vector;` as the first statement of `up()`; `ask_embeddings` with its unique, btree and HNSW indexes; `ask_questions`, `ask_questions_sources`, `ask_questions_rels`; `inquiries` and `inquiries_rels`; `site_info`; locked-documents rels columns; the `payload_jobs` task-slug enum gains `askQuestionRetention` (an `ADD VALUE`: keep it in this migration only if nothing in the same `up()` uses the label, otherwise split it into its own migration; `pnpm check:migrations` decides).
- **Phase 8 carousel tabs** `pnpm migrate:create carousel-tabs`: `{pages,works,posts}_blocks_carousel_tabs`, `_blocks_carousel_tabs_tabs` and `_blocks_carousel_tabs_tabs_slides`, their `_v` twins, each parent table's `enum_..._slide_size`, `enum_..._tab_size` and `enum_..._theme`, indexes and FKs. All create; no prompt; zero `DROP`, `RENAME` or `ADD VALUE`. The shared-field extraction changes no existing table, so nothing else appears in the diff.
- **Phase 8 carousel split** `pnpm migrate:create carousel-split`: `{pages,works,posts}_blocks_carousel_split` and `_blocks_carousel_split_slides`, their `_v` twins, each split table's `enum_..._carousel_position`, `enum_..._slide_size` and `enum_..._theme`, indexes and FKs. All create; no prompt; zero `DROP`, `RENAME` or `ADD VALUE`.
- **Phase 8 figures** `pnpm migrate:create figures`: `{pages,works,posts}_chart`, `{pages,works,posts}_diagram` and their `__{...}_v_{chart,diagram}_v` twins, each table's `enum_..._width` and `enum_..._theme`, indexes and FKs. All create; no prompt.
- **Phase 7** (per PR): theme enum recreate on `enum_{pages,works}_blocks_{content,media_block,archive,slider}_theme`, `enum_works_blocks_tabs_theme`, the nested slider theme enums, and their `_v` twins: no prompt; hand-check that every `UPDATE ... 'system' -> 'light'` precedes its cast. Column drops (posts `content`, if taken): no prompt, plain `DROP COLUMN` in the diff.

`scripts/migrate-create.exp` takes the same answers if a prompt does appear.

---

## Appendix B: port manifest (source paths relative to `~/SITES/sas-site`)

**Phase 1**
`src/blocks/shared/{groups,section,grid,typography,aspect-ratio,numbering,reveal-variants,content-block-renderer,visual-surface}.ts(x)`, `src/shared/ui/scroll-reveal/*`, `src/shared/ui/reveal-section/*`, `src/hooks/{use-prefers-reduced-motion,use-mobile,use-hydrated,use-near-viewport}.ts`, `src/components/Container/index.tsx`, `src/components/admin/BlocksDrawerTabs/index.tsx`, `src/components/ui/{code-block,code-block-languages,carousel,accordion,dropdown-menu,sheet}.tsx`, `src/components/RichText/{index.tsx (converters), text-styles.ts}`, `src/blocks/fixtures.ts` (builders), the `globals.css` and `shadcn-theme.css` sections named in Phase 1.

**Phase 2**
`src/plugins/streak-studio/**` (minus legacy collections), `src/features/immersive/{index.ts,presets.ts,resolve-tuning.ts}`, `src/features/immersive/studio/**`, `src/features/immersive/visual/**`, `src/features/immersive/ui/{streak-field-*,light-leak-*,failure-boundary}.ts(x)`, `src/lib/webgl/{gpu-budget,use-gpu-lease,canvas-resize,store}.ts`, `src/lib/webgl/components/context-guard/`, `src/fields/{visual,visual-validate,visual-refs}.ts` + tests, `src/components/Visual/index.tsx`, `src/heros/HeroGround.tsx`, `src/utilities/{canonicalJSON,relationshipId,getMediaUrl}.ts`, `public/images/streak-field/*.webp`, `public/images/light-leak/*.webp`, `src/styles/shadcn-theme.css` (tokens), stories and tests listed in the Studio agent map (`studio/preview.stories.tsx`, `visual/*.stories.tsx`, `visual/{compose,descriptor}.test.ts`, `ui/*-scene.test.ts`).

**Phase 3**
`src/blocks/section/*`, `src/blocks/rich-transition/*`, `src/blocks/feature/{HeadingOffset,ImageStatement,Tabs}/*`, `src/blocks/feature/shared.ts` (header fields only), `src/blocks/full-media/*`, `src/blocks/media-content-split/*`, `src/blocks/split-content/*`, `src/blocks/image-pair/*`, `src/blocks/split-image-offset/*`, `src/blocks/MediaBlock/*` (as `caption`), `src/blocks/youtube/*`, `src/blocks/rich-text/**`, `src/blocks/Code/*`, `src/blocks/faq/*`, `src/blocks/Carousel/*`, `src/blocks/insight-list/*`, `src/blocks/shared/{fields.ts (themeField, transitionFields, proseHeadingLevelField), section-blocks.ts, row-visuals.ts, heading-dropdown.tsx}`, `src/fields/{contentLexical,markdownInput}.ts`, `src/fields/lexical/textStyle/*`, `src/fields/pageLayoutBlocks.ts` (shape), `src/blocks/RenderBlocks.tsx` (section branch).

**Phase 4**
`src/fields/pageHero.ts` (`pageIntroField`), `src/fields/pageFields.ts` (`contentsButtonField`), `src/sections/WorkIntro/*`, `src/features/contents/**`, `src/heros/config.ts` (visual slot wiring pattern).

**Phase 5**
Everything under "Files to copy for a port" in the Ask agent map, minus `storyBrief.ts`, `journeyPages.ts`, `MenuAsk.tsx`, `Footer/Closing/*`, `Header/Menu/*`, `ContactPages/*`, `mcp.ts`, `botid/*` (optional).

**Phase 6**
`scripts/wrap-sections.ts` (CLI shape, snapshot and `--restore` only; the transform is new).

**Docs to copy into `docs/`** (trim to what ships): `blocks-reorg-roadmap.md` (history), `block-grid-roadmap.md`, `animations.md`, `cms-naming.md`, `streak-field.md`, `streak-field-studio.md`, `studio-effects.md`, `immersive-effects.md`, `src/features/ask/README.md`, `editorial/voice.md` (adapt the voice to this site).

---

## Appendix C: dependency changes

Add: `radix-ui`, `tw-animate-css`, `lite-youtube-embed`, `ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `@shadcn/react`, `@tabler/icons-react`, `zod`; `elkjs` and `recharts` with the figures (Phase 8, added 2026-09-30). Optional: `@typesafe-ai/sdk`, `botid`, `@playwright/test` (poster script).

Already here and reused: `gsap`, `@gsap/react`, `lenis`, `three`, `@react-three/fiber`, `embla-carousel-react`, `geist`, `prism-react-renderer`, `sharp`, `posthog-js`, `posthog-node`, `vaul`, `zustand`, `tailwind-merge`, `clsx`, `class-variance-authority`.

Version notes: `three` 0.186 here vs 0.182 there (R3F 9.8 supports both; the scenes use `ShaderMaterial`, instancing and render targets only); Payload 3.90 vs 3.88 (admin hooks used by the Studio components are unchanged between the two).

Remove in Phase 7: see D13.
