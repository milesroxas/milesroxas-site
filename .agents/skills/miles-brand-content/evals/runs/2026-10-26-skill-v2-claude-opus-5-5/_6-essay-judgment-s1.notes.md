Job: write, website post, essay shape (common belief, where it falls short, a story from the work, the choice it leads to). Reader: hiring teams at product organizations and builders who use agents. Goal: they see that Miles's part of the work is framing, refusal rules and review, shown through Ask and the parallel workspace setup. Pillar: Building and learning. About 600 words, no headings. Chat only, nothing saved to the CMS.

**Needs checking**

- **Who built Ask.** How the work on Ask was split between you and the coding agents isn't recorded anywhere. The draft says you decided what Ask refuses and where its thresholds sit, and that agents built much of it under your review. Confirm that or correct it (it's marked inline).
- **The commit count.** 261 of 486 commits carry a Co-Authored-By line (git log, 2026-10-26). You said agents write "most of my code". Commits are the only measure on record, and 54% of commits isn't the same as most of the code. So the essay says "more than half the commits". Update the count on the day you publish.
- **Ask status.** The essay says the judge ships switched off on milesroxas.com, with shadow mode next. That comes from the Ask post draft. If shadow mode is already running, change that sentence.
- **The link.** The published post's slug ends in "as-a-solo-engineer". The guide says "engineer" should never be your primary label. Keep the link as it is. If you rename the slug, add a redirect.

**Claim ledger**

| Claim | Source | Status |
| --- | --- | --- |
| 261 of 486 commits list a coding agent as co-author | ask-notes (git log, 2026-10-26) | verified |
| 7 October: 58 commits from 14 workspaces, most driven by an agent while Miles reviewed the one before | published post "Fourteen branches, one afternoon" | verified |
| Three to six workspaces open at a time; the limit is attention | published post | verified |
| Ask answers from published pages only, under 120 words, lists pages, hands off with a short form | Ask post draft (ask-notes) | verified |
| Built first for Suits & Sandals | Ask post draft | verified |
| Wrong handoff card in 5 of 57 turns before the judge, 57 of 57 with it (19 questions, three runs) | Ask post draft, measured 2026-09-19 | verified |
| The judge runs before the writer; code owns every threshold; card words are written in code | Ask post draft | verified |
| Median first output 3,490 ms to 4,655 ms, then 1,542 ms with minimal reasoning on the writer | Ask post draft | verified |
| Judge off on milesroxas.com, shadow mode next | Ask post draft | verified (see above) |
| Miles decided refusals and thresholds; agents built much of Ask under his review | none | needs checking |
| The guards came after bugs: renamed workspace made a second DB, a port held by another repo, a pulled env file pointing at production | published post | verified |
| The pre-push hook checks schema files, not folders, so nobody learns to bypass it | published post | verified |
| A task starts as one line from Miles and lands when he decides it is right | published post ("A day in the loop") | verified |

**Lint**: `check-voice.mjs --kind article`. 0 errors, 0 warnings, 1 info (the `[check: ...]` marker above).

**Notes**

- I left out model and product names (the writing model, the judge model, the agent tools), as the guide says. "A second model" stands in for the judge.
- Other title options: "Cheap code made judgment the job" or "When agents write the code, judgment is the work".
