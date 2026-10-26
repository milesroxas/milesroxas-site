# Notes for case 6: essay on design judgment

**Job:** Write. Website post, essay shape (references/articles.md: common belief, where it falls short, one story from Miles's work, the choice it leads to). Reader: hiring teams at product organizations and peers who build. Goal: they come away seeing that when agents do the typing, Miles's work is deciding what a feature should do and judging whether it's right, shown through Ask and the parallel-workspace loop. Pillar: Building and learning.

**Length:** 680 words, not counting the title and the check marker. Two label/claim headings, which fits "few or no headings".

**Title alternative:** "Agents write the code, so judgment is the job" (claim form, 45 characters).

## Needs checking

- **Who did what on Ask.** The essay says "I designed how it behaves and directed the build with coding agents." The evidence doesn't record how design, direction, review and code were split on Ask. This line carries the inline marker.
- **"Most of my code."** This is the claim as you made it in the request. The only number behind it is commits: 261 of 486 (54%) carry a Claude co-author line (git log, 2026-10-26). That proves agents co-authored just over half the commits, not what share of the code they wrote. If you want the essay to say "most", the commit count holds up. If you want a stronger share, it needs a different measure.
- **Shadow mode gloss.** The evidence says only "shadow mode comes next." The essay defines it inline as "judges real questions without acting on them", which is the usual meaning but my wording. Confirm that's what you plan.
- **"Most of the design sits in that handoff."** This is a point of view, not a fact from the evidence. Confirm it matches how you'd describe Ask.

## Claim ledger

| Claim | Source | Status |
| --- | --- | --- |
| Agents write most of the code | Your request; 261 of 486 commits co-authored (ask-notes, git log 2026-10-26) | Verified as you stated it; see note above |
| Ask answers only from published pages, lists them, under 120 words; ⌘K on any page | ask-notes (Ask post draft) | Verified |
| When the answer is "ask Miles" it says so and opens a short form | ask-notes | Verified |
| Built first for Suits & Sandals, then ported | ask-notes | Verified |
| Handoff tool with five reasons (estimate, project, person, contact details, no answer) | ask-notes | Verified |
| 52 of 57 right cards before the judge, 57 of 57 with it; 19 questions, three runs; measured on Suits & Sandals | ask-notes (2026-09-19 run) | Verified |
| Judge sorts each turn into five classes; scores each passage; code owns thresholds 0.45 relevance, 0.55 evidence | ask-notes | Verified |
| Every word on the handoff card is written in code | ask-notes | Verified |
| Turns with no writing-model call: 6 before, 23 with the judge | ask-notes | Verified |
| Median first output 3,490 ms to 4,655 ms; 1,542 ms with minimal reasoning; card-only 2,669 ms to 365 ms | ask-notes | Verified |
| Turn judge is off on milesroxas.com; shadow mode next | ask-notes | Verified (the gloss is mine) |
| Miles's split of work on Ask | none | Needs checking |
| October 7: 58 commits from 14 workspaces, most driven by an agent while Miles reviewed | parallel-post (published) | Verified |
| Example task lines; reviewing previews with real content; three to six open at once | parallel-post | Verified |
| Guards written after bugs hit once: DB keyed on a renamed workspace, port held by another repo's dev server | parallel-post | Verified |

## Lint

`node .agents/skills/miles-brand-content/scripts/check-voice.mjs --kind article --format text 6-essay-judgment.md`

0 errors, 0 warnings, 1 info. The info row is the `[check: ...]` marker on the Ask work split, which is listed above. No em dashes.

## Notes

- **No model names.** Jev, gpt-5-mini and Claude aren't named. The judge is "a separate judge" and the writer is "the writing model", so the decision is the point, not the stack.
- **The judge's results are from Suits & Sandals.** The essay says the numbers are from Suits & Sandals and that the turn judge is switched off on this site. That keeps the measured result and the live status separate.
- **The essay admits a miss.** The workspace guards came after the bugs, so it doesn't present your judgment as flawless.
- **The close points to Ask (⌘K), which is live here.** It doesn't link the Ask post, because that's still a draft.
- **Chat only.** Nothing was saved to the CMS.
