# Notes for Miles: Buzlee case study narrative (chat draft, not saved)

**Job:** Write. Website, Buzlee work page (work 15) case study narrative: problem, insight, choices, what was built, outcome, lesson. Reader: a hiring team at a product organization skimming the work, plus assistants that quote one section at a time. Afterwards they should know what Buzlee is, what you owned, and why it took the shape it did.

**Shape:** Case study narrative (`references/articles.md`), in the order from `references/website.md`. Each section opens with its claim under a short label heading. Nothing was written to the CMS.

## Claim ledger

| Claim | Source | Status |
| --- | --- | --- |
| Buzlee is a digital bulletin board for small towns | work 15 intro | verified |
| One feed and one map for what is on this week | work 15 intro and summary | verified |
| Posted by local businesses, approved by a person | work 15 intro | verified |
| No ads, no ratings or reviews, no ranking algorithm | work 15 intro and summary | verified |
| You worked with the founder to shape the MVP, then designed and built the mobile apps and supporting systems | work 15 intro | verified (founder unnamed) |
| Features: map-based discovery, business flyers, human moderation | work 15 SEO description | verified |
| Concept to working applications | brand guide, Buzlee evidence | verified |
| The problem: who had it, where events lived before, why it mattered | none | needs checking |
| The bulletin board as the insight, and whose it was | none (the metaphor is sourced, its role as the insight is not) | needs checking |
| The three MVP choices were made together with the founder | inferred from "worked with the founder to shape the MVP" | needs checking |
| What each choice replaced and what it cost | none | needs checking |
| Platforms, what the supporting systems are, AI's part, other contributors | none | needs checking |
| Status, towns, stores, any result | none ("no usage numbers, launch date, store ratings or team size are published") | needs checking |
| The lesson | none | needs checking |

## Needs checking

1. **The founder's name**, so the founder is credited wherever "we" appears.
2. **The problem in your words.** Who had it, where people in town looked for events before Buzlee, and what went wrong there. The notes describe the product's answer, not the problem. The Problem section is the thinnest part of the draft.
3. **The insight.** Was the bulletin board the idea that shaped the approach? Was it yours, the founder's or shared? If something else shaped it, what did you notice?
4. **Who made which call.** The draft says you and the founder made the three MVP choices together. Say which were yours.
5. **What each choice beat.** How the feed is ordered without ranking (by date?), and what human approval replaced (open posting, automated filtering, something else).
6. **What the choices cost.** For example, the time approval takes and how Buzlee pays its way without ads. The draft states no cost because none is in the evidence.
7. **The build.** iOS, Android or both; what the supporting systems are (business posting, the approval queue, anything else); whether AI-assisted development was part of it and how that split; whether anyone besides you and the founder worked on it.
8. **Status and result.** Is Buzlee live, in which town or towns, in which stores? Any result you can share (businesses posting, events listed), with the period it covers. Until then, Outcome says only what shipped and who it is for.
9. **The lesson.** The one thing you would keep or change. The section is a single question for now, so the draft has no ending yet. Once you answer, it should close on what the work implies, not a recap.

## Lint

`check-voice.mjs --kind article` (target chat): 0 errors, 0 warnings, 12 info. Every info row is a `[check: ...]` marker, listed above. The first pass warned about uniform sentence length inside the Lesson marker; I shortened it. The six headings and the title, linted as `heading`: 0 errors, 0 warnings. Before any of this goes to the CMS, each marker has to be resolved or the claim dropped, since `--target cms` fails on markers.

## Notes

- The title line reuses the live work title in sentence case, "Buzlee: local events without the noise". Changing the stored title was not part of the request; the live one stays "Local Events Without the Noise".
- The opening repeats your role in one sentence ("shape the MVP, then designed and built it") so the Problem section stands on its own when an assistant quotes it. If it sits right under the work's intro on the page, you can cut that sentence.
- The draft says "designed and built", not "engineered", even though the work's `role` field reads "Product, Design, Engineering". The role field is untouched.
- "What was built" will need media: the feed, the map, a flyer and the approval view would each show one choice. Write the captions from the actual screenshots, saying what to look at.
- On the page this maps to one Standard heading block per section, with the Choices list in a Rich text block or `featureTabs`.
