# Notes for the Ask post

**Job:** Write. Website post, a build story (`references/articles.md`). Readers are hiring teams and people who build things. Afterwards they should know how Ask turns a question into an answer, why it answers only from published pages, and what the judge changed and cost. Pillar: Tools and systems, with Building and learning.

**Shape:** Build story. The opening is the admission (5 of 57 wrong cards). The point and the section preview come in paragraph 3. Then four decision sections and an ending on the implication. About 1,070 words, five sections. Nothing was saved to the CMS.

## Needs checking

1. **Why Ask exists.** The notes say what Ask does but not why you built it. Paragraph 2 has a marker where your reason should go, in one sentence of your own.
2. **Split of the work on Ask.** The notes say 261 of 486 commits are co-authored by a coding agent, but not how design, direction, review and code were split on Ask. One sentence on what you owned and what the agents built goes after the commit line.
3. **Why the daily cron never ran.** The post says it never ran and what replaced it, but gives no reason. Add one if you want it on the page, or delete the marker.
4. **locateBlock.** The post explains it as "the tool that finds which block an edit means". That wording comes from the website reference, not the Ask notes. Confirm it is right, or cut the paragraph. The Choice/Noul point still holds without it.
5. **Same date for both measurements.** The post says both the 52-card baseline and the 57-card result were measured on September 19 (the notes give one date for the whole measurement). Confirm the baseline was not run on an earlier day.

## Claim ledger

| Claim | Source | Status |
| --- | --- | --- |
| Built first for Suits & Sandals, then ported here | ask-notes (Ask post draft) | verified |
| ⌘K or the dock's Ask tab; under 120 words; published pages only; lists the pages it used | ask-notes | verified |
| Says "ask Miles" and opens a short form | ask-notes | verified |
| The writing model chose the handoff before the judge; wrong card in 5 of 57 (52 right) | ask-notes: handoff tool + 52 before / 57 with judge | verified (5 = 57 − 52) |
| 19 questions × 3 runs, Suits & Sandals site, 2026-09-19 | ask-notes | verified (model jev-1.13.0, left out of the copy) |
| text-embedding-3-small, 1,536 dimensions, follow-up embedded alone and joined to the previous question | ask-notes | verified |
| pgvector, 12 nearest passages, cosine 0.3, HNSW | ask-notes | verified |
| At most four pages, three passages each | ask-notes | verified |
| Nothing clears the floor on a first question: card, no model runs | ask-notes | verified |
| gpt-5-mini writes from passages only | ask-notes | verified |
| Handoff tool with five reasons; card words written in code | ask-notes | verified |
| `ask_embeddings` table in Drizzle; nothing outside the CMS writes to it | ask-notes | verified |
| afterChange hook on Pages, Works, Posts and Site Info; drafts and autosave skipped; unpublish deletes rows | ask-notes | verified |
| Indexer reads as an anonymous visitor; protected work fails the read | ask-notes | verified |
| 2,000-character passages split on headings; vectors reused by exact text | ask-notes | verified |
| Full rebuild 12 s, 19 documents, 70 passages | ask-notes | verified |
| Jev is TypeSafe's System One model; Choice, Noul, Score; code owns thresholds | ask-notes | verified |
| Turn classes, plus the own-project and names-my-work questions | ask-notes | verified |
| Passage relevance 0.45, evidence 0.55; floor dropped from 0.3 to 0.2 | ask-notes | verified |
| locateBlock: Choice 0.46, Noul 0.02, answered none | ask-notes | verified (the description of the tool comes from `references/website.md`, see Needs checking 4) |
| No-writer turns 6 to 23 | ask-notes | verified |
| First output 3,490 to 4,655 ms; minimal reasoning brought it to 1,542 ms; card-only turns 2,669 to 365 ms | ask-notes | verified |
| Judge behind `ASK_JEV`, off on this site; shadow mode next | ask-notes | verified |
| 5 to 6 s end to end, about 1,650 input and 300 output tokens | ask-notes | verified |
| Redaction rules; no IP address or visitor id | ask-notes | verified |
| Outcome set by code; the content-gaps filter | ask-notes | verified |
| 90-day retention; daily cron never ran; nothing on a schedule since 2026-10-17 | ask-notes (retention.ts, commit "nothing on a schedule") | verified |
| 261 of 486 commits co-authored by an AI coding agent | ask-notes (git log, 2026-10-26) | verified |
| Why Ask was built; how the work on Ask was split; why the cron failed | none | needs checking (marked inline) |

## Lint

`check-voice.mjs --kind article`: 0 errors, 0 warnings, 4 info. Three info rows are the `[check: ...]` markers. The fourth flags "90 days", which the ledger covers (retention.ts). The SEO suggestions below lint clean as `metaTitle` and `metaDescription`. If this goes to the CMS, take the three markers out of the saved draft and keep them in this list. A `--target cms` run fails while they are in.

## Other notes

- **Left out on purpose:** the findContent timing (24 passages in 366 ms, 14,696 tokens), because it belongs to a different tool and would pull focus. Also left out: the Jev model version, and why you built Ask, since the notes don't give a reason.
- **Model names** (text-embedding-3-small, gpt-5-mini, Jev) each appear once, inside the pipeline and after the problem. The guide's rule is that they are never the point, and here they are detail. If you'd rather keep the post vendor-neutral, cut them; the mechanism still reads.
- **Shadow mode** is named but not explained, because the notes don't say what it will measure. Add a clause if readers outside engineering should follow it.
- **Two speed measures** sit in "What the judge cost": time to first output on Suits & Sandals with the judge, and end-to-end time on this site without it. They are labelled separately. They aren't the same measure, so don't compare them.
- **Suggested SEO** (not saved):
  - `meta.title`: How I built Ask to answer only from my work (43 characters; the template adds " | Miles Roxas")
  - `meta.description`: How Ask, the answer box on milesroxas.com, answers only from published pages, keeps its index in step with publishing and decides when to hand off. (147 characters)
