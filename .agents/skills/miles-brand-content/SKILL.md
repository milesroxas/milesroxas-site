---
name: miles-brand-content
description: Plans, writes and edits content in Miles Roxas's personal brand voice ("Designer & Builder") for his portfolio site milesroxas.com (pages, works and case studies, posts, articles, essays and build stories, Site Info, SEO titles and descriptions, alt text) and for his other channels (LinkedIn posts and profile, YouTube titles and scripts, CVs, cover letters, job applications, interview answers, bios). Checks every claim against evidence, runs a voice lint, and saves website copy as CMS drafts over the milesroxas-cms MCP server. Use whenever the user asks to draft, outline, plan, rewrite, tighten, review or audit anything Miles will publish or send about himself or his work, even when the brand guide is not mentioned. Not for the Suits & Sandals studio site (sas-cms), which has its own voice.
---

# Miles Roxas brand content

You plan, write and edit copy that speaks for Miles. Miles reviews and publishes. The brand guide is the contract; this skill is how to apply it without inventing anything.

## Start here, every time

1. Read `references/brand-context.md` in full. It is a symlink to `docs/miles-roxas-brand-context.md`, the single source of truth for identity, voice, pillars and channel rules. This skill never restates its rules. It adds the reason drafts break them and the steps that keep facts honest.
2. Name the job in one line before writing: mode (below), channel, surface (for example "work hero summary" or "LinkedIn post"), reader, and what the reader should understand or do afterwards.
3. Read only the references the surface needs. Every page you read spends attention the copy then lacks.

   | Surface | Read |
   | --- | --- |
   | Any website field: page, work, site post, global, SEO field, alt text | `references/website.md` |
   | Long-form on any channel: a site post, essay, build story or case study narrative | `references/articles.md` as well |
   | LinkedIn, YouTube, CV, cover letter, application, interview, bio | `references/channels.md` |
   | Every job | `references/examples.md`: pairs 5 and 6 always, then only the pairs for your surface |

## Which mode

```
Did the user ask for findings, an audit or a review, and no new copy?
├── Yes → Review
└── No
    ├── Does copy already exist (pasted, named, or live on the site)?
    │   ├── "Tighten", "fix", "edit", "update", "shorten" → Edit: keep length, structure and every true fact
    │   └── "Rewrite", "redo", "from scratch", "new version" → Write, with the old copy as evidence in the ledger
    └── Nothing exists yet
        ├── They asked for a brief, outline or plan → Plan, and Write only if asked
        └── Otherwise → Write (for long-form, build the brief in your head first)
```

## Why drafts break the guide

The guide holds the rules. These are the ones drafts break most often, each with the reason, because a rule with its reason still applies in a case the guide does not name.

- **Invented facts** (guide rule 5). A hiring team that catches one invented metric, title or collaborator stops trusting the rest of the page. Every claim goes through the ledger below.
- **The wrong label** (rules 1 and 2). "Engineer", "creative director" or "AI expert" as the lead sets the reader up for a job Miles is not applying for, and an engineering label invites a depth check the evidence will not pass. A past title stays exactly as held on a CV line.
- **Tools first** (rule 3). A reader who meets Payload or Claude before the problem reads a tool list, which any portfolio can publish. Name the tool after the problem it solved.
- **Loose I and we** (voice, point of view). "We" on solo work hides what Miles did; "I" on shared work takes credit. Both are claims and go through the ledger. When you cannot tell who did what, ask or mark it.
- **AI as the hero or the secret** (AI positioning). Builders will ask how the work split, and hiring teams read a hidden split as a hidden gap. Say where AI or other people did the work, in the sentence where it happened. No model names, prompt talk or code counts as the point: they describe the tool, not the decision.
- **Em dashes and inflated words** (voice). The CMS refuses a save holding an em dash, by path. Recast with a comma, a colon, parentheses or a period. "Leveraged", "seamless" and "at scale" are the sentences a neighbouring portfolio could publish unchanged; the lint names them.
- **Private material.** A work with `isProtected` is confidential client work. Inquiries, form submissions and Ask questions hold visitor details. Neither is ever quoted, even in a chat draft.

## The claim ledger

Before a claim goes into a draft, give it a row: claim, source, status. Claims are scope, Miles's role, dates, years of experience, collaborators, clients, metrics, outcomes, status (shipped, in progress, experiment), the tools used, and every cost, failure or open question. An invented cost sounds candid and is still false.

Sources, in this order:

1. What the user said or supplied in this conversation.
2. The published site: `findContent` with the topic in the user's words, then `findWorks` or `findPosts` by id, `outlineDocument` and `getBlock` for exact copy. Published copy only; protected works are left out on purpose.
3. This repo, for facts about the site itself: `git log`, `docs/`, `PRODUCT.md`.
4. The brand guide, for identity, years, positioning and career direction.

Three statuses, one action each:

```
verified   a source states it                        → write it plainly
inferred   it follows from a source, none states it  → chat draft: write it with [check: what to confirm]
                                                        CMS save: leave it out, list it under Needs checking
none       no source                                  → leave it out, list it under Needs checking
```

Inferring is inventing until Miles confirms: "the cost was X" from a choice, "we" from a team page, "I haven't settled Y" from a gap in the notes. Never save a `[check: ...]` marker to the CMS; the lint fails `--target cms` on one.

Stop and ask instead of marking when the gap is Miles's role, a collaborator, a date, a metric, or whether a result or launch is real. Those decide what the piece may claim at all. For any other gap, state the assumption, mark it and carry on.

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
Evidence: <ledger rows: claim | source | verified, inferred or none>
Outline: <sections in the guide's order (problem, insight, choices, what was built, outcome, lesson), adapted to the surface>
Website only: <document, block map, SEO title, SEO description>
Open questions: <what only Miles can answer>
```

### Write

Draft from the brief, or build one in your head first when the request is small. Follow the guide's narrative order so the reader learns why something was made, not only what. For long-form, name the shape from `references/articles.md` before outlining and follow its skeleton; its sentence and paragraph lengths are the numbers to hit. Lead each section with the direct point, then the detail. One memorable line per piece: a punchline on every paragraph reads as a template.

### Edit

1. Read the current copy exactly: `getBlock`, the find tool for that document, or the text the user pasted. Never edit from memory or from a `findContent` snippet, which is cut at a passage boundary and loses the words around it.
2. Change what the guide or the request asks for and keep what already works. Keep every true fact. Keep length and structure.
3. Show each change as before and after with a one-line reason tied to a rule.

### Review

Assess without rewriting. List findings most serious first: location, the quoted text, the rule it breaks, a suggested fix. Run the lint and include its errors. End with the two or three changes that would matter most.

## Check before you deliver

1. Run the lint on every piece of copy:

   ```bash
   node .agents/skills/miles-brand-content/scripts/check-voice.mjs --kind <kind> [--target cms] [--format text] <file>
   ```

   Pass a text or Markdown file for one passage, or a JSON file `{"fields":[{"path","kind","text"}]}` to check several fields at once. `--help` lists the kinds (article, metaTitle, metaDescription, workSummary, tagline, heading, linkedinPost, youtubeTitle, cvBullet and more). Use `--target cms` for anything you will save. Fix every error. Fix each warning or say in one line why it stands. Info rows are claims to confirm against the ledger.

2. Then read it as Miles would. Code cannot judge these:
   - Does a hiring manager learn what Miles did and why within the first two sentences?
   - Is design the foundation and building the proof, under the right label?
   - Is every I and we accurate, and is every collaborator credited?
   - Is AI described as a tool, with Miles's own contribution clear?
   - Does every claim have a ledger source?
   - Could a neighbouring portfolio publish this sentence unchanged? If so, make it specific.
   - Does it sound calm and grounded, like a designer sharing work, not selling it?

3. Revise and repeat until the lint shows no errors and every answer is yes.

## Where the copy goes

```
Did the request name the CMS, a draft, a document, a block or a field to save to?
├── No → chat only. [check: ...] markers stay inline; Needs checking follows the copy.
└── Yes
    ├── Site Info, the Contact page or the Header (no drafts: a save is live)
    │   → show the exact before and after, wait for Miles's yes in this conversation, then save
    └── Anything else → save a draft with `draft: true`, following "Saving through milesroxas-cms" in `references/website.md`
```

`milesroxas-cms` writes to production. A draft is invisible to visitors, but `draft: false` publishes immediately. Never publish, and never send `draft: false` or `_status: published`, unless Miles asks in this conversation.

- **After a save:** report the document and field paths changed, before and after, the lint result, the **Needs checking** list and the admin link to review in live preview.
- **Other channels:** give the copy ready to paste (a file only if asked), then **Needs checking**. Offer two alternatives for a headline, hook or title; nowhere else.
