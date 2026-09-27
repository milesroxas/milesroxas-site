# Composer and editorial roadmap: sas-site parity without a Content Hub

Status: proposed 2026-09-27. Nothing below has shipped. Audit numbers come from the local Docker copy of production (`payload` on `127.0.0.1:54330`), pulled with the dev TUI; re-pull before any content step.

Goal: give this site the same editorial experience as `~/SITES/sas-site` (referred to below as `sas:`), so that Work pages are composed from Sections and the shared block run, Posts compose like sas-site Lab Pages, the same Ask feature answers visitors, the same Studio shader plugin drives effects in heroes and media slots, and every ported block keeps its exact animation. All of it lands without losing a single existing document, block row, or version.

Not in scope, on purpose: the Content Hub (case studies, lab projects, story beats, asset libraries, organizations, taxonomy collections), newsletters, the MCP server, the takeover menu, route transitions and hero landing, the AEO plugin (`llms.txt`), Sentry. Figures (chart, diagram, bespoke) are optional (Phase 8).

Agents: read this before touching blocks, themes, heroes, or migrations in this repo. It plays the role `sas:docs/blocks-reorg-roadmap.md` plays there. Read that file too before porting: it records why the block system is shaped the way it is.

---

## 0. Rules that hold for every phase

- **Expand, migrate, contract.** Every phase up to 5 is additive: new tables, new columns, new blocks. No slug, `dbName`, enum value or column is renamed or dropped before Phase 7, and Phase 7 runs only after content has moved and soaked.
- **Every deploy renders production identically** until the explicit content step (Phase 6). New blocks exist in the drawer; nothing is re-authored by a deploy.
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

- **No visitor theme toggle.** `<html>` carries no `data-theme`. The light palette is `:root`; `[data-theme="dark"]` is stamped per block (`ClientBlockWrapper`, block components, `HighImpact` hero, the work title strip) and swaps the whole palette inside that subtree. So today `dark` means "forced dark palette here", and `light`/`system` mean "page palette". That maps cleanly onto sas-site bands (Section 5).
- **Five legacy blocks carry `theme` with enum values `system | light | dark`** (content, mediaBlock, archive, slider, tabs, plus nested slider groups). sas-site's `themeField()` is `light | dark | neutral | brand`. Same field name, different enum: a ported block cannot share a slug with one of these (Section 4).
- **`RenderBlocks` is an async server component** (`src/blocks/RenderBlocks.tsx`): it resolves protected works inside Content columns (`processLayoutBlocks`) and wraps every block in `div.block-wrapper` inside `AnimatedBlocksContainer`, which animates only on `/`.
- **The hero group is shared** by Pages, Posts and Works (`src/heros/config.ts`): `type`, `showContent`, `richText`, `links`, `media` (required for highImpact / mediumImpact / home). `HighImpact` receives the card-to-page FLIP clone (`docs/SiteFrame.md`) and needs an `img` or `video` inside it.
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
| Closing band (Footer global + per-page Closing tab) | optional (Phase 8, D4) | The Footer global was removed on purpose; re-adding it is a product call |
| Takeover menu, `MenuAsk`, `ClosingAsk` | not ported | Ask mounts at `/ask` plus a Header nav entry (D10) |
| Visitor light/dark toggle, `InitTheme`, `ChromeTheme` | not ported | The site stays light; bands give per-section contrast (Section 5) |
| Route transitions (View Transition API), hero landing, page intro | not ported | `SiteFrame` and the card FLIP transition stay as they are |
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
| D4 | The Closing tab and Footer global are **not** part of the core port. | Removed here in July on purpose. Listed under Phase 8 for when it is wanted |
| D5 | Posts keep `content` (made optional) and gain `layout`. The route renders hero → intro → content → composition → related. Moving existing bodies into Sections is a Phase 6 script with dry-run and snapshot, or a manual re-author (6 posts). | No content is touched by schema work |
| D6 | Works keep `layout` required and keep every legacy block in the drawer under its group, relabelled where a ported block takes the same name (`tabs` becomes "Tab slider", `mediaBlock` stays "Media"). | Zero re-authoring pressure; Phase 7 retires legacy blocks from the drawer only after Phase 6 |
| D7 | The Studio plugin (Phase 2) lands **before** the block run (Phase 3). | The run's block configs spread `blockVisualSlotFields`, whose `studio` relationship needs the `streak-looks` collection. Porting the configs twice (plain upload, then slot) would generate two migrations on the same tables. Phases 1 and 2 can run in parallel Conductor workspaces |
| D8 | The `link()` field stays milesroxas's (`reference | custom`, appearance `default | outline`). Ported blocks that ask for the `text` appearance (Rich text Actions) are configured with `['default', 'outline']`. | Adding `text` is an `ADD VALUE` on every `*_link_appearance` enum (14 of them plus `_v` twins) for one toolbar block |
| D9 | Figures (chart, diagram, bespoke) and the figures plugin are optional, Phase 8. | They pull `elkjs`, `recharts`, `zod` spec schemas and a `beforeChange` validator; not asked for |
| D10 | Ask mounts at `/ask` (AskWidget) and as a Header nav item. A drawer in the SiteFrame bottom bar is a Phase 8 nicety. | No takeover menu and no footer closing band here |
| D11 | Docker image becomes `pgvector/pgvector:pg17` (not pg18). | Neon production is Postgres 17 (`MIGRATIONS.md`); `docker-compose.yml` records a drizzle-kit issue with PG 18 named constraints. Ask needs `CREATE EXTENSION vector` |
| D12 | The existing hero group stays; `hero.media` becomes a visual slot (`heroVisualSlotFields`) so an effect can ground the opening band. `HighImpact` keeps the FLIP clone pickup and already fades the clone out when there is no `img`/`video`. | Keeps the SiteFrame transition; adds the shader where sas-site has it |
| D13 | Remove the dormant shader dependencies and Turbopack loader rules in Phase 7. | Nothing imports them; the ported effects are inline GLSL |
| D14 | The fluid type scale, grid gap token, `text-stack`, `stack-binds-opener`, band tokens and `BlockGrid` are added **beside** the current tokens, not in place of them. Existing components keep their classes. | The ported blocks read `text-heading-2`, `text-display`, `gap-grid`, `text-stack`, `font-mono`; nothing else does yet |

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
| `callout` | ours only | 1 | keep, group Statements |
| `storyBeats`, `labStorySection`, `labFacts`, `labRelatedProjects`, `labMediaShowcase`, `caseStudy*`, `featuredWork`, `industryWork`, `audienceTabs`, `dynamicAudience`, `testimonialsMarquee`, `newsletterSignup`, `featureStatementGrid` (carries `source`), `scrollGallery` | | | **not ported** (hub, taxonomy or newsletter dependencies). `scrollGallery`, `featureStatementLinks`, a plain `mediaShowcase` are Phase 8 candidates |

Every ported block that lives in more than one collection uses the function `dbName` exactly as sas-site does. Tables land per parent: `pages_section`, `works_section`, `posts_section`, `works_full_media`, `posts_rich_text`, and so on, plus `_v` twins. No existing table is renamed.

---

## 5. Theme model: bands, not modes

sas-site's rule (`sas:src/blocks/shared/section.tsx`): a block's `theme` picks a **surface within the visitor's theme**. `light` is the page surface, `dark` a low-luminance band (`--tertiary`), `neutral` a quiet stripe (`--neutral`), `brand` the accent surface (`--brand`). Sections expose the same idea as `inherit | secondary | accent | inverted`, mapped in `sas:src/blocks/section/shared.ts`.

Here the site has no visitor theme, so "within the visitor's theme" collapses to "within the light page". The translation is exact:

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

---

## 6. Phases

### Phase 0: preflight

- [ ] Land or shelve `chore/update-deps`; start every phase branch from a clean `main`.
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
| Tabs `featureTabs` | `feature/Tabs/` | Interactive | `intro` | | per-tab visual slot; drop `source` on tab rows |
| Insight list `insightList` | `insight-list/` | Lists | `intro` | | SVG marks via CSS mask; picker filter `mimeType` svg only |
| Columns `content` (ours) | | Custom | none (own wrapper) | | closes every list; nested in Sections too |

Rich text sub-blocks (Lexical only, no tables): `sas:src/blocks/rich-text/{insights, pill-list, actions}`. With them come the field factories `sas:src/fields/{contentLexical.ts, markdownInput.ts}` and `sas:src/fields/lexical/textStyle/*` (the Split and Split narrow body editor; the write-only Markdown sibling an agent can author through). The Actions toolbar block is configured with `appearances: ['default', 'outline']` (D8).

**Runs** (`src/blocks/shared/section-blocks.ts`, mirrors sas-site with figures and story beats removed):
```ts
export const sectionNestableBlocks: Block[] = [
  RichTransition, FeatureHeadingOffset,                                   // Section heading
  FullMedia, MediaContentSplit, SplitContentNarrow, ImagePair, SplitImageOffset, // Media and content
  FeatureImageStatement, Caption, YouTube,                                // Media
  RichTextBlock, Code,                                                    // Text
  Faq, Carousel, FeatureTabs,                                             // Interactive
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

### Phase 4: page furniture (additive schema)

Turns a composed Work or Post into the sas-site page shape.

- **Opening**: `hero.media` wrapped with `heroVisualSlotFields` (D12) on the shared hero group (Pages, Posts, Works all gain it in one change). `HighImpact` and `MediumImpact` render `HeroGround` behind their copy when the slot chose an effect; the FLIP clone pickup keeps its `img`/`video` query and its no-media fallback.
- **Intro band**: `pageIntroField()` (`sas:src/fields/pageHero.ts`) on Posts and Works, minus the override toggle (D1): `eyebrow`, `title`, `body` (richText). Rendered by a port of `sas:src/sections/WorkIntro` (`Section.client.tsx` bespoke entrance built on the shared gate).
- **Contents button**: `sas:src/features/contents/*` (floating index, `clip-path` reveal from the button circle, `@starting-style` on `--ease-out-quint`). Opt-in per document via `showContents` (Posts Content tab, Works and Pages Composition tab). Headings come from the rendered Section openers.
- **Related rail on Posts**: `hideRelatedPosts` checkbox; the existing `RelatedPosts` block stays the renderer.
- **Routes**: `posts/[slug]` = hero → intro → `content` (if non-empty) → `RenderBlocks(layout)` → related. `works/[slug]` = hero → title strip (existing `page.client.tsx`) → intro → `RenderBlocks(layout)`.
- Preview map (`generatePreviewPath`) unchanged.

Schema added: `hero_visual_type` + `hero_shader_*` columns on pages, posts, works and `_v` twins; `intro_*` columns on posts and works; `show_contents` and `hide_related_posts` booleans. Answer sheet: Appendix A, Phase 4.

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

### Phase 6: content migration (manual first, script as fallback)

Nothing before this phase changes what production renders. This phase is where editors, or a script, move copy onto the new blocks. Work in draft, check live preview, publish once per document.

**Works (10 documents, about 130 rows).** sas-site did this by hand and kept `sas:scripts/wrap-sections.ts` as the fallback; do the same. Constraint: Payload admin cannot move a block between fields, so a wrap is Add Section → recreate the block inside → delete the original → drag into place. Mapping from the legacy blocks:

| Legacy | Becomes | Section settings |
|---|---|---|
| `content` column `sectionHeading` | Standard (`richTransition`), layout Offset or Left | theme dark → Customize on, Inverted; light/system → defaults |
| `content` column `text` | Rich text | same Section as its heading |
| `content` column `media` | Caption or Stacked (with copy) | Loose band for full-bleed media |
| `content` column `work` / `post` | stays a Columns block (no run equivalent; Archive covers lists) | |
| `mediaBlock` | Caption (`size` full / inset / small from `fullWidth` + `aspectRatio`) | Loose |
| `slider` | Carousel | Loose |
| `tabs` | Tabs (`featureTabs`) when each tab is copy + one image; else stays Tab slider | |
| `archive`, `cta`, `formBlock`, `callout` | unchanged, top level | |

Script fallback: port `wrap-sections.ts` with this mapping, `--dry-run`, snapshot to `scripts/snapshots/`, `--restore`. Rehearse on the local pull before considering production.

**Posts (6 documents).** Two routes, pick per post:
1. Manual: paste the body into Rich text blocks under Sections, one Section per h2, with a Prose Standard heading opening each. Clear `content` after publishing.
2. Script `scripts/posts-to-sections.ts`: split `content` at every `h2` node; each split becomes a Section holding a Standard (`layout: 'prose'`, `headingLevel: 'h2'`, heading = the h2 text) followed by a Rich text block with the nodes up to the next h2; inline `code` nodes become Code blocks, inline `mediaBlock` nodes become Caption blocks, `banner` stays inside the body (Phase 3 added it to the Rich text editor). Writes `layout` as a draft and leaves `content` untouched; the route prefers `layout` when it is non-empty. `--dry-run`, snapshot, `--restore`.

**Home** (`pages/home`): no wrap needed; its 6 `work` columns stay Columns. Add Sections only if the editor wants to.

Checklist:
- [ ] Re-pull production, back up, re-run the inventory.
- [ ] Rehearse the works script on the local pull; diff a dry run against the Phase 0 snapshot.
- [ ] Wrap works in admin (or run the script against production with `.env.production.pulled` and `PAYLOAD_DB_PUSH=false`, after a Neon backup).
- [ ] Posts: manual or script, one at a time, publish after live-preview check.
- [ ] `_v` history keeps the flat shape; restorable until Phase 7 drops columns.

### Phase 7: contract and normalize (one PR per bullet, each with its own migration, after Phase 6 has soaked)

- [ ] Theme enums on the five legacy blocks: `UPDATE ... WHERE theme = 'system'` → `light`, then recreate as `light | dark | neutral | brand`; components read `sectionThemeClass`; `useBlockTheme.ts` and `ClientBlockWrapper.tsx` deleted; hardcoded `data-theme` on heroes, CallOut and the work title strip become band classes. Prompt: none (enum recreate); hand-check normalize-before-cast; `pnpm check:migrations`.
- [ ] Retire legacy blocks from the drawer once no document uses them (config only, no schema). Tables stay until a later drop.
- [ ] Posts `content`: drop the field only if every post has moved; otherwise leave it optional forever.
- [ ] Remove dormant dependencies and config (D13): `glslify`, `glslify-import`, `glslify-loader`, `glsl-canvas-js`, `glsl-noise`, `glsl-easings`, `glsl-fast-gaussian-blur`, `raw-loader`, `shader.d.ts`, the Turbopack `.glsl/.vert/.frag` rules, `src/hooks/useHoverShader.ts`, `useImageCropMaterial.ts`, `src/utilities/texturePreloader.ts`, `calculateMeshScale.ts`, `src/animations/*` (unused), `swiper`, `next-view-transitions`, `payloadcms-lexical-ext`, `hamo`, `split-type`, `leva` (no demo playgrounds here).
- [ ] Delete `src/blocks/YouTube` (done in Phase 3) and the orphan `src/global.d.ts` import of `./r3f/components/CardPlane/PlaneWithImage`.

### Phase 8: optional, in any order

- Figures (`chart`, `diagram`, `bespokeFigure`) with `sas:src/plugins/figures` and `sas:src/features/figures` (adds `elkjs`, `recharts`, `zod`). Joins the run under Figures.
- `scrollGallery` (WebGL, pinned, `self` reveal), `featureStatementLinks` (`self`, own `ScrollReveal`), a plain `mediaShowcase` (sas Lab Media showcase minus the record).
- Closing band: re-add a Footer global with `sas:src/fields/closing.ts` and the per-page Closing tab; `ClosingAsk` then has a home.
- Ask in the SiteFrame bottom bar as a drawer (`vaul` is installed).
- `/demo/transitions` reveal tuner (`sas:src/widgets/transition-demo`) for retuning the two reveals on this site's type scale.
- A visitor light/dark theme (`sas:src/providers/Theme/*`, `InitTheme`); the bands are already built for it.

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
| Content loss during Phase 6 | Additive-first sequencing; Neon backup plus Phase 0 JSON snapshot; dry-run diff; per-document publish; `_v` history until Phase 7 |
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
| O2 | Re-add the Footer global for the Closing band? | Later (Phase 8). It was removed on purpose |
| O3 | Ask entry points beyond `/ask` and the nav | A SiteFrame bottom-bar drawer once the widget is in |
| O4 | Jev (TypeSafe) on for Ask? | Off at first (`ASK_JEV` unset); turn on shadow after a week of questions |
| O5 | Add the `text` link appearance (D8)? | Not now; revisit when the Actions block is wanted with text links |
| O6 | Figures in the run? | Phase 8, if long-form technical posts need charts |
| O7 | Band token values | Start from sas-site's oklch values; retune against IBM Plex and the orange accent on `/demo`-style stories before Phase 3 ships |
| O8 | Work Details tab (industry, role, deliverables) as a hero facts row like `CaseStudyHero`? | Yes, in Phase 4, read from the existing text fields; no schema |

---

## Appendix A: expected `migrate:create` answer sheets

Never run without asking. Every phase below is additive, so **no create/rename prompt is expected**; `migrate:create` should write the file without questions. If it asks, the answer is **create** for anything named here, and a **rename** offer against an existing table means a `dbName` collided: abort, re-run `pnpm check:migrations:drift`, compare its table list to the phase's list.

- **Phase 2** `pnpm migrate:create streak-studio`: `streak_looks`, `streak_looks_texts`, `_streak_looks_v`, `_streak_looks_v_texts`, `enum_streak_looks_effect`, `enum_streak_looks_status`, `enum__streak_looks_v_version_effect`, `enum__streak_looks_v_version_status`, `payload_locked_documents_rels.streak_looks_id`. All create.
- **Phase 3** `pnpm migrate:create sections-and-run`: `{pages,works,posts}_section` and every per-parent run table listed in Phase 3 with `_v` twins, their enums, FKs and indexes; `posts` gains no column (`layout` is rows in `posts_section` and the run tables). Expect several hundred `CREATE TYPE` / `CREATE TABLE` statements and zero `DROP`, zero `ALTER ... RENAME`, zero `ADD VALUE`.
- **Phase 4** `pnpm migrate:create opening-intro-contents`: `hero_visual_type` enums and `hero_shader_*` columns on `pages`, `posts`, `works` and `_v`; `intro_eyebrow`, `intro_title`, `intro_body` on `posts`, `works`; `show_contents` on `pages`, `posts`, `works`; `hide_related_posts` on `posts`. All create; no prompt.
- **Phase 5** `pnpm migrate:create ask`: hand-add `CREATE EXTENSION IF NOT EXISTS vector;` as the first statement of `up()`; `ask_embeddings` with its unique, btree and HNSW indexes; `ask_questions`, `ask_questions_sources`, `ask_questions_rels`; `inquiries` and `inquiries_rels`; `site_info`; locked-documents rels columns; the `payload_jobs` task-slug enum gains `askQuestionRetention` (an `ADD VALUE`: keep it in this migration only if nothing in the same `up()` uses the label, otherwise split it into its own migration; `pnpm check:migrations` decides).
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

**Docs to copy into `docs/`** (trim to what ships): `blocks-reorg-roadmap.md` (history), `block-grid-roadmap.md`, `animations.md`, `cms-naming.md`, `streak-field.md`, `streak-field-studio.md`, `studio-effects.md`, `immersive-effects.md`, `src/features/ask/README.md`, `editorial/voice.md` (adapt the voice to this site).

---

## Appendix C: dependency changes

Add: `radix-ui`, `tw-animate-css`, `lite-youtube-embed`, `ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `@shadcn/react`, `@tabler/icons-react`, `zod`. Optional: `@typesafe-ai/sdk`, `botid`, `elkjs`, `recharts` (figures), `@playwright/test` (poster script).

Already here and reused: `gsap`, `@gsap/react`, `lenis`, `three`, `@react-three/fiber`, `embla-carousel-react`, `geist`, `prism-react-renderer`, `sharp`, `posthog-js`, `posthog-node`, `vaul`, `zustand`, `tailwind-merge`, `clsx`, `class-variance-authority`.

Version notes: `three` 0.186 here vs 0.182 there (R3F 9.8 supports both; the scenes use `ShaderMaterial`, instancing and render targets only); Payload 3.90 vs 3.88 (admin hooks used by the Studio components are unchanged between the two).

Remove in Phase 7: see D13.
