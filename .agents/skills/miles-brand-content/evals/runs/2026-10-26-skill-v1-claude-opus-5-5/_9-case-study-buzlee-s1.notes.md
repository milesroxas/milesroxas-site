# Notes for Miles: Buzlee case study narrative

**Job:** Write. Website, case study narrative for the Buzlee work page (work 15): problem, insight, choices, what was built, outcome, lesson. Reader: a hiring team at a product organization skimming for what Miles did, why, and what came of it. Chat draft only, nothing saved to the CMS. Shape: case study narrative (`references/articles.md`, order from `references/website.md`).

**Source:** only `evals/files/buzlee-notes.md`, as asked. It covers what Buzlee is, Miles's role and the named features. It holds no reasoning, decisions, status or results, so the insight, choices and lesson are built from what the product visibly refuses and does, and each line of reasoning is marked `[check: ...]` for Miles to confirm or replace.

## Section headings

| Section | Heading |
| --- | --- |
| Problem | Ranked, rated and sponsored |
| Insight | The bulletin board already worked |
| Choices | Decisions and what they cost |
| What was built | Mobile apps and the systems behind them |
| Outcome | Where Buzlee stands |
| Lesson | What I would keep |

The title line uses the live work title, "Local Events Without the Noise", in sentence case as `references/articles.md` asks. The live title is in title case; change it only if you want to.

## Claim ledger

| Claim | Source | Status |
| --- | --- | --- |
| Buzlee is a digital bulletin board for small towns: one feed, one map, what is on this week | Work 15 intro | Verified |
| Posted by local businesses, approved by a person | Work 15 intro | Verified |
| No ads, no ratings, no ranking algorithm | Work 15 intro and summary | Verified |
| Features: map-based discovery, business flyers, human content moderation | Work 15 SEO description | Verified |
| Miles worked with the founder to shape the MVP, then designed and built the mobile apps and supporting systems | Work 15 intro | Verified |
| Concept to working applications and supporting systems | Brand guide | Verified |
| Role: Product, Design, Engineering | Work 15 `role` | Verified (not repeated in the narrative; it sits in the role field) |
| Other event platforms let ads, reviews and algorithms decide what gets attention | Implied by the work summary's contrast, not stated | Needs checking |
| The bulletin board was the insight, and a small town is small enough for human approval | Inferred from the product | Needs checking |
| The three decisions were made together while shaping the MVP | Inferred from "worked with the founder to shape the MVP" | Needs checking |
| Costs of each decision (review time, no personalization, no ad revenue) | Follow from the decisions themselves | Logical consequence; the approval wait needs checking |
| Status, launch date, towns, usage numbers, ratings, team size | None published | Needs checking, left out of the copy |
| Tools, platforms, AI assistance | None in the notes | Needs checking, left out of the copy |

## Needs checking

1. **Problem:** where people in Buzlee's towns found events before, so the opening can name it instead of "a platform".
2. **Founder:** their name, and whether to credit them by name.
3. **Insight:** whether the bulletin board and the town's size were the actual reasoning, whose reasoning it was (yours, the founder's, shared), and roughly how many posts arrive in a week.
4. **Choices:** which of the three decisions were the founder's calls and which were yours. "The founder and I" assumes the MVP decisions were shared.
5. **Approval:** who approves posts (the founder, a moderator, you) and how long a business usually waits.
6. **What was built:** which platforms the apps run on, and what the supporting systems are (a business posting tool, an approval queue, an admin).
7. **Split of the work:** whether anyone else, or AI coding tools, worked on the build. The guide wants that split stated where the work happened.
8. **Outcome:** status (live in the app stores, beta or pilot) and since when, which towns use it, and any number you can share. With nothing published, the section only says what shipped.
9. **Lesson:** the line is a candidate. Replace it with what you would actually keep or change, and confirm whether scale (human approval across many towns) is a real open question.
10. **Something that did not work:** the notes hold no first approach that was dropped. If there was one (a ranked feed, open posting, an automated filter), it would make the choices section stronger than any line here.

## Lint

`node .agents/skills/miles-brand-content/scripts/check-voice.mjs --kind article --format text 9-case-study-buzlee.md`

Result: 0 errors, 0 warnings, 9 info. The 9 info rows are the `[check: ...]` markers, listed above. No em dashes. About 600 words including markers.

## Before it goes to the CMS

- The narrative maps to Standard heading blocks with short bodies, or Rich text blocks, in `layout`. Choices and What was built want artifacts beside them (`mediaContentSplit` or `featureTabs`): the feed, the map, a flyer, and the approval step, with captions that say what to look at.
- Every `[check: ...]` marker must come out before saving; claims that stay unconfirmed come out with them (the lint fails `--target cms` on a marker).
- Nothing was saved. Say the word and I will save it as a draft on work 15.
