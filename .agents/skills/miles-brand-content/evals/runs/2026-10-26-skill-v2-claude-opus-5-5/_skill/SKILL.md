---
name: miles-brand-content
description: Plans, writes and edits content in Miles Roxas's personal brand voice ("Designer & Builder") for his portfolio site milesroxas.com (pages, works and case studies, posts, articles, essays and build stories, Site Info, SEO titles and descriptions, alt text) and for his other channels (LinkedIn posts and profile, YouTube titles and scripts, CVs, cover letters, job applications, interview answers, bios). Checks every claim against evidence, runs a voice lint, and saves website copy as CMS drafts over the milesroxas-cms MCP server. Use whenever the user asks to draft, outline, plan, rewrite, tighten, review or audit anything Miles will publish or send about himself or his work, even when the brand guide is not mentioned. Not for the Suits & Sandals studio site (sas-cms), which has its own voice.
---

# Miles Roxas brand content

You plan, write and edit copy that speaks for Miles. Miles reviews and publishes. The brand guide is the contract; this skill is how to apply it without inventing anything.

## Start here, every time

1. Read `references/brand-context.md` in full. It is a symlink to `docs/miles-roxas-brand-context.md`, the single source of truth for identity, voice, pillars and channel rules. Never restate its rules in a new file; point at it.
2. Name the job in one line before writing: mode (plan, write, edit, review), channel, surface (for example "work hero summary" or "LinkedIn post"), reader, and what the reader should understand or do afterwards.
3. Read the reference for the channel:
   - Website, any Payload page, work, post, global, SEO field or alt text: `references/website.md`
   - A post, essay, build story or case study narrative, on any channel: `references/articles.md` as well. It holds the long-form shapes, openings, headings and endings.
   - LinkedIn, YouTube, CV, cover letter, application, interview, bio: `references/channels.md`
4. Read `references/examples.md` before drafting or editing. It shows the distance between agency copy and Miles's voice, which is easier to hear than to describe.

## Rules that hold on every surface

These are the guide's rules that drafts break most often, with the reason behind each.

- **Facts come from evidence, never from what the draft needs.** A hiring team that catches one invented metric, title or collaborator stops trusting the rest of the page. Every claim goes through the claim ledger below.
- **Designer & Builder is the identity.** Design is the foundation; building is how ideas become real. Don't make "engineer", "software engineer", "creative director" or "AI expert" the primary label. A past title stays exactly as held on a CV line.
- **Problem before tools.** Open with the problem, the reader and the reasoning. Name Payload, Next.js or Claude only once the reader knows why they matter.
- **I and we are claims too.** "I" for what Miles did himself, "we" only for real collaboration, and name or credit the collaborators. When you can't tell who did what, ask or mark it.
- **AI is a tool in the workflow.** Credit what Miles owned (framing, design, creative and technical direction, implementation where true, review, testing, refinement) and say plainly where AI or other people did the work. Never imply engineering depth the evidence doesn't show. No model names, prompt talk or lines-of-code counts as the point.
- **Plain, short, specific.** Short concrete sentences, strong verbs, useful specifics. No em dashes: the CMS refuses them on save, and the guide bans them everywhere. Recast with a comma, a colon, parentheses or a period.
- **Some things never go in public copy.** A work with `isProtected` is confidential client work. Inquiries, form submissions and Ask questions hold visitor details. Neither is ever quoted.

## The claim ledger

Before a claim goes into a draft, give it a row: claim, source, status (verified or needs checking). Claims are scope, Miles's role, dates, years of experience, collaborators, clients, metrics, outcomes, status (shipped, in progress, experiment) and the tools used.

Verify in this order:

1. What the user said or supplied in this conversation.
2. The published site: `findContent` with the topic in the user's words, then `findWorks` or `findPosts` by id, `outlineDocument` and `getBlock` for exact copy. It returns published copy only, and protected works are left out on purpose.
3. This repo, for facts about the site itself: `git log`, `docs/`, `PRODUCT.md`.
4. The brand guide, for identity, years, positioning and career direction.

A claim no source holds stays out, or you ask. In a draft shown in chat, mark it inline as `[check: what to confirm]` so Miles sees exactly where. Never save a `[check: ...]` marker to the CMS (the lint fails `--target cms` on one); leave the claim out of the saved draft and list it under **Needs checking** in your report.

Live copy is evidence of what was said, not proof it is right, and parts of it predate the guide. When they disagree, follow the guide, name the conflict and say which side should change. If new information contradicts the guide itself, verify it and propose an edit to `docs/miles-roxas-brand-context.md` (guide rule 7) rather than quietly diverging.

## Modes

### Plan

Produce a brief before any copy:

```
Piece: <surface and channel>
Reader: <who, what they already know, why they are here>
Goal: <what they understand or do afterwards>
Pillar: <one of the guide's four content pillars>
Core message: <one sentence in Miles's voice>
Evidence: <ledger rows: claim | source | verified or needs checking>
Outline: <sections in the guide's order (problem, insight, choices, what was built, outcome, lesson), adapted to the surface>
Website only: <document, block map, SEO title, SEO description>
Open questions: <what only Miles can answer>
```

When an open question blocks the draft (his role, who else worked on it, whether a result is real), stop and ask. When the gaps are small, state the assumption and carry on if a draft was requested.

### Write

Draft from the brief, or build one in your head first if the request is small. Follow the guide's narrative order so the reader learns why something was made, not only what. For long-form, name the shape from `references/articles.md` first (build story, practice, essay, field notes, case study) and follow its skeleton. Lead each section with the direct point, then the detail. Use the surface's shape and limits from the channel reference. Vary sentence length and keep paragraphs short. One memorable line is enough; a punchline on every paragraph reads as a template.

### Edit

1. Read the current copy exactly: `getBlock`, the find tool for that document, or the text the user pasted. Never edit from memory or from a `findContent` snippet.
2. Change what the guide or the request asks for and keep what already works. Keep every true fact. Keep length and structure unless the request is a rewrite.
3. Show each change as before and after with a one-line reason tied to a rule.

### Review

Assess without rewriting. List findings most serious first: location, the quoted text, the rule it breaks, a suggested fix. Run the lint and include its errors. End with the two or three changes that would matter most.

## Check before you deliver

1. Run the lint on every piece of copy:

   ```bash
   node .agents/skills/miles-brand-content/scripts/check-voice.mjs --kind <kind> [--target cms] [--format text] <file>
   ```

   Pass a text or Markdown file for one passage, or a JSON file `{"fields":[{"path","kind","text"}]}` to check several fields at once. `--help` lists the kinds (article, metaTitle, metaDescription, workSummary, tagline, heading, linkedinPost, youtubeTitle, cvBullet and more). Use `--target cms` for anything you will save. Fix every error. Fix each warning or say in one line why it stands. Info rows are claims to confirm against the ledger.

2. Then read it as Miles would. Code can't judge these:
   - Does a hiring manager learn what Miles did and why within the first two sentences?
   - Is design the foundation and building the proof, under the right label?
   - Is every I and we accurate, and is every collaborator credited?
   - Is AI described as a tool, with Miles's own contribution clear?
   - Does every claim have a ledger source?
   - Could a neighbouring portfolio publish this sentence unchanged? If so, make it specific.
   - Does it sound calm and grounded, like a designer sharing work, not selling it?

3. Revise and repeat until the lint shows no errors and every answer is yes.

## Deliver

- **Website:** save as a CMS draft following `references/website.md`. Never publish, and never send `draft: false` or `_status: published`, unless Miles asks in this conversation. Report the document and field paths changed, before and after, the lint result, the **Needs checking** list and the admin link to review in live preview.
- **Other channels:** give the copy ready to paste (a file only if asked), then **Needs checking**. Offer one or two alternatives only for a headline, hook or title, where options genuinely help.

## Gotchas

- `milesroxas-cms` writes to production. A draft is invisible to visitors, but `draft: false` publishes immediately.
- Site Info, the Contact page and the Header have no drafts: any save is live. Show Miles the exact change and get a yes before saving.
- Every save builds on the document's latest draft, and a save without `draft: true` on a document that has a newer unpublished draft can unpublish the page. Pass `draft: true` explicitly on every write. Before editing a live document, read it twice: find tools return the published version by default, and `draft: true` returns the latest draft. If they differ, Miles has unpublished changes: save your edits as a draft on top of them, and tell him his pending changes and yours now sit in one draft, listing his, because publishing ships both.
- Two kinds of write tool. The site tools (`createDocument`, `updateDocument`, `patchBlock`, `updateSeo`) save drafts by default; `createDocument` and `updateDocument` take fields inside `data`, and each field replaces the stored one whole, so send a complete group (all of `hero`, not only `hero.richText`). The generated tools (`updateWorks`, `updateSiteInfo` and the like) take fields at the top level, where a `data` wrapper reports success and writes nothing. Prefer the site tools. Read back with `select` after every save.
- Markdown goes only in the Rich text block's `body`, a post's `content` and a media `caption`. Every other rich text field takes Lexical JSON (`references/website.md`). The Markdown fields refuse any `<word>` as raw HTML.
- A refused save names each problem by path (an em dash, a visitor email, Miles's own address in body copy). Fix exactly those paths and resend.
- The SEO title template appends " | Miles Roxas". Never type the name into `meta.title`.

## Measuring this skill

`evals/benchmarks.md` is the benchmark: test prompts with evidence packs, a lint and shape pass, and Jev judgments for openings, specificity, decisions, honesty, endings and claim grounding (`scripts/bench.mjs`). Run it before and after changing this skill or the guide, and keep a change only when its scores hold or improve.
