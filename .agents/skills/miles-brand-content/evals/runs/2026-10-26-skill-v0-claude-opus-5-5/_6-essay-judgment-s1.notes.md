Job: write, website, a short bylined essay/post body (chat draft, not saved). Reader: hiring teams at product organizations and fellow builders. Goal: they come away seeing that Miles's design judgment, not the agents, decides what ships. Pillar: Building and learning.

About 728 words (without the check markers), title as an h1, four short h2 sections. I didn't save anything to the CMS.

## Needs checking

- **Who did what on Ask.** The Ask section gives Miles the behavior decisions: answering only from published pages, the handoff card written in code, adding the judge. Nothing records how design, direction, review and code were split on Ask. Marked inline.
- **Why the handoff card is written in code.** The reason I gave ("a visitor asking for an estimate reads words I chose, not words a model improvised") is my inference, not a sourced reason. Marked inline.
- **"Agents write most of the code."** This is your own claim from the request. The evidence I have is narrower: 261 of the repo's 486 commits (about 54%) carry a Co-Authored-By: Claude line (git log, 2026-10-26). A co-author line doesn't measure who wrote the lines, so confirm you're comfortable with "most".
- **The Ask numbers come from the unpublished Ask post draft.** These are: 57 of 57 vs 52 handoff cards, 23 vs 6 turns with no writing-model call, and median first output going from 3,490 to 4,655 to 1,542 ms (rounded in the essay to 3.5, 4.7 and 1.5 s). They were measured on the Suits & Sandals site on 2026-09-19 with jev-1.13.0. Confirm they still stand, and decide whether this essay should go out before or after that post.
- **Judge status.** The essay says the judge is off on milesroxas.com behind the ASK_JEV switch, with shadow mode next. That's true as of the draft, so check it before you publish.

## Ledger (verified)

| Claim | Source |
| --- | --- |
| 58 commits from 14 workspaces on Oct 7; agent drove most while Miles reviewed | Published parallel post |
| Three to six workspaces open; limit is attention | Published parallel post |
| Task lines (carousel tab, capabilities taxonomy, mask speed) | Published parallel post |
| Ask answers from published content only, lists pages, under 120 words; drafts and protected work never indexed; "ask Miles" handoff form | Ask post draft |
| Five handoff reasons; every word on the card written in code | Ask post draft |
| Outcome set by code, so the content-gaps list is real | Ask post draft |
| Judge classifies each turn; Miles's code owns every threshold | Ask post draft |
| Built first for Suits & Sandals; test of 19 questions x 3 runs | Ask post draft |
| Four scripts; guards took longer than the scripts, each written after a bug | Published parallel post |
| Rename created a second DB and archive dropped the wrong one; orphaned dev server held a port | Published parallel post |
| Pre-push hook allowlists schema files so nobody learns to bypass it | Published parallel post |
| "The workspace does the setup and the landing. I do the review and the release." | Published parallel post (figure caption) |

## Lint

`node check-voice.mjs --kind body --format text 6-essay-judgment.md` gave 0 errors, 0 warnings and 2 info. The 2 info rows are the two `[check: ...]` markers above.

## Notes

- I kept model and product names out on purpose: no gpt-5-mini, embedding model, Jev, Claude or Conductor. Following the guide, AI shows up as "a coding agent" and "a second model". The tools serve the argument; they aren't the point.
- I used the commit count once, as context, and the essay doesn't lean on it. This matches the parallel post's own line that the count isn't the point.
- The parallel post's live URL slug ends in `...as-a-solo-engineer`, which uses the engineer label the guide says not to lead with (its title already reads "how I work in parallel"). It's worth renaming the slug, with a redirect.
- Title alternatives: "The code got cheap. Deciding didn't." or "Agents write the code. I still decide what it does."
