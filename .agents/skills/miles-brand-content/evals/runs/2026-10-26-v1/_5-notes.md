# Notes for 5-build-story-ask.md

**Job:** write, website post (build story shape), for hiring teams and fellow builders. Afterwards they know how Ask turns a question into an answer or a handoff, and why each piece took its shape. Chat only. Nothing was saved to the CMS.

**Shape:** build story, about 1,180 words, 6 sections: index boundary, publish trigger, retrieval floor, judge, judge cost, logging and retention. The opening is the stake. The point and the headline result come in paragraph 3. It closes on the principle the decisions add up to.

## Needs checking

1. **Who did what on Ask.** The post says you designed how Ask behaves and directed the build, reviewing each change. Nothing records this, so it is marked `[check: ...]` inline. Replace it with your own split, or cut the sentence and keep only the repo-wide commit figure.
2. **The opening's reason.** "An assistant on a portfolio does harm the moment it guesses" and "Much of Ask's design is about that last case" are my framing of the design, not facts from the notes. Confirm they match why you built it this way.
3. **Floor and passage judge on milesroxas.com.** The notes say only the *turn* judge is off here (`ASK_JEV`). The post gives 0.3 as the floor and 0.2 as the floor with the judge on, measured on Suits & Sandals. Confirm which floor this site uses today, and whether the passage check is off as well.
4. **Shadow mode.** The post says it "comes next" without saying what it is. Add a line if you want readers to know what it will measure.
5. **The existing Ask post draft.** The notes come from an Ask post draft. Decide whether this replaces that draft or stays separate.

## Inferences made (from the notes, not stated in them)

- "Payload, the CMS behind the site": inferred from "declared in Drizzle beside Payload's schema" and "nothing outside the CMS writes to it".
- locateBlock is "the tool that finds the block an edit request points at": inferred from the FAQ example.
- The earlier daily cron "was meant to clear expired rows": inferred from where the notes place it, next to the 90-day retention.
- "Taking a page down takes it out of Ask in the same step": follows from "an unpublish deletes its rows".

## Choices

- Model names (text-embedding-3-small, gpt-5-mini, jev-1.13.0) each appear once, inside the mechanism or measurement, never as the point. Cut them if you'd rather keep the post tool-agnostic.
- The commit figure is phrased as "an AI co-author line", without the model name.
- The judge results are scoped to the Suits & Sandals site every time they appear. The post says the judge is off on milesroxas.com and that whether it earns its place here is still open.
- Left out: the findContent measurement (24 passages judged in 366 ms, 14,696 input tokens). It's an authoring-tool number, and the post already uses locateBlock for the Choice vs Noul point.
- Title alternatives: "How I built Ask, the assistant on this site" or "Ask answers from my pages or not at all".

## Lint

`node .agents/skills/miles-brand-content/scripts/check-voice.mjs --kind article --format text`: 0 errors, 0 warnings, 2 info.
- Info: "90 days" is a claim. Source: the notes (src/features/ask/retention.ts, commit "nothing on a schedule", 2026-10-17).
- Info: the `[check: ...]` marker on the split of the work (item 1 above).
- The first pass warned about two semicolons in paragraph 4. Fixed with periods.
- No em dashes.

## Claim ledger (all from evals/files/ask-notes.md unless noted)

| Claim | Source | Status |
| --- | --- | --- |
| Answers only from published milesroxas.com, lists pages, under 120 words | Ask post draft | verified |
| ⌘K anywhere, Ask tab in the dock | Ask post draft | verified |
| "ask Miles" handoff opens a short form | Ask post draft | verified |
| Built first for Suits & Sandals, ported here | Ask post draft | verified |
| Drafts and protected work never indexed; indexer reads as anonymous visitor | Ask post draft | verified |
| `ask_embeddings`, pgvector, Drizzle beside Payload's schema, only the CMS writes | Ask post draft | verified |
| afterChange on Pages, Works, Posts, Site Info; drafts and autosave skipped; unpublish deletes | Ask post draft | verified |
| 2,000-character passages split on headings; vectors reused by exact text | Ask post draft | verified |
| Full rebuild 12 s, 19 documents, 70 passages | Ask post draft | verified |
| 1,536-dimension embedding; follow-up embedded alone and joined | Ask post draft | verified |
| 12 nearest above 0.3 cosine, HNSW; at most 4 pages × 3 passages | Ask post draft | verified |
| Floor miss on a first question: card, no writing model | Ask post draft | verified |
| Handoff tool, five reasons, card copy in code | Ask post draft | verified |
| 52 → 57 of 57 right cards; 6 → 23 no-writer turns; 2026-09-19, jev-1.13.0, 19 × 3 | Ask post draft | verified |
| Jev typed questions, code owns thresholds; turn and passage requests; 0.45 / 0.55; floor 0.3 → 0.2 | Ask post draft | verified |
| locateBlock 0.46 Choice, 0.02 Noul | Ask post draft | verified |
| 3,490 → 4,655 ms; 1,542 ms with minimal reasoning; card-only 2,669 → 365 ms | Ask post draft | verified |
| Turn judge behind ASK_JEV, off; shadow mode next | Ask post draft | verified |
| 5 to 6 s end to end, about 1,650 in / 300 out tokens | Ask post draft | verified |
| Redacted logging, no IP or visitor id | Ask post draft | verified |
| 90-day retention; nothing on a schedule since 2026-10-17; earlier cron never ran | retention.ts, commit 2026-10-17 | verified |
| Outcome set by code; content-gaps filter | Ask post draft | verified |
| 261 of 486 commits carry an AI co-author line | git log, 2026-10-26 | verified |
| Miles designed behaviour, directed, reviewed Ask | none | needs checking |
