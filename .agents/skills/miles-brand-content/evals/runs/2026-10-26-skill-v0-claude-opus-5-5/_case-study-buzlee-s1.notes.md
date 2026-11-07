# Notes for the Buzlee narrative draft

**Job:** Write mode, website, Buzlee work (work 15) case study narrative. Reader: recruiters and hiring teams at product organizations. Afterwards they should know why Buzlee was made, what Miles decided with the founder, and what he designed and built. Chat only, nothing saved to the CMS.

**Sections by heading:** Problem = "What's on this week?", Insight = "A town needs a bulletin board", Choices = "What we left out", What was built = "The apps and the systems behind them", Outcome = "Where Buzlee stands", Lesson = "What I'd keep". The headings vary in form on purpose, so the outline reads like a table of contents.

## Claim ledger

| Claim | Source | Status |
| --- | --- | --- |
| Title "Local Events Without the Noise" | buzlee-notes (work 15) | verified |
| Buzlee is a digital bulletin board for small towns: one feed and one map for what's on this week | buzlee-notes (work 15 intro) | verified |
| Posted by local businesses, approved by a person | buzlee-notes (work 15 intro) | verified |
| No ads, no ratings or reviews, no ranking algorithm | buzlee-notes (work 15 intro and summary) | verified |
| Miles worked with the founder to shape the MVP ("we", "our decisions") | buzlee-notes (work 15 intro) | verified; founder unnamed |
| Miles designed and built the mobile apps and supporting systems ("I") | buzlee-notes (work 15 intro) | verified; build split unknown |
| Map-based discovery, business flyers, human moderation | buzlee-notes (work 15 SEO description) | verified |
| Went from concept to working applications and supporting systems | buzlee-notes (brand guide line) | verified |
| Small towns lack one place to see events; existing places come with ads, reviews, algorithms | inferred from the summary's "without ads, reviews, or algorithms" | needs checking |
| The bulletin board idea, and whose it was | no source | needs checking |
| Feed ordering, who approves posts, the tradeoffs weighed | no source | needs checking |
| Which apps and platforms; what the supporting systems are | no source | needs checking |
| Status, towns, usage numbers | notes say none are published | needs checking |
| The lesson | no source | needs checking |

## Needs checking

1. **Problem:** where local events lived before Buzlee, and whether "plenty going on, no single place to see it" is how you and the founder framed it.
2. **Insight:** whether the bulletin board idea was yours, the founder's or shared.
3. **Founder:** their name, and whether they want to be credited by name.
4. **Feed order:** with no ranking algorithm, how the feed is ordered (by date?).
5. **Moderation:** who does the approving, and the tradeoffs you weighed (for example the time human review costs).
6. **Build credit:** whether anyone else worked on the build, and whether to say it was AI-assisted. The draft says "I designed and built", as the work page does, and does not mention AI.
7. **Apps and systems:** which apps (iOS and Android, or one for residents and one for businesses) and what the supporting systems cover, such as a moderation tool.
8. **Status:** live in the app stores, in a pilot or in testing.
9. **Use:** which town or towns use it, and any numbers you're willing to publish. None are published, so the Outcome section only says what shipped.
10. **Lesson:** the line is inferred from the choices, not from anything you said. Replace it with your own if it doesn't ring true.

## Lint

`check-voice.mjs --kind body` on the draft: 0 errors, 0 warnings, 10 info (the 10 `[check: ...]` markers, all listed above). The six headings as `--kind heading`: 0 errors, 0 warnings, 0 info. Target was chat; a CMS save would fail on the markers, so each marked claim stays out of a saved draft until you confirm it.

## Other notes

- No tools, stack or AI are named: the evidence names none, and the guide puts problem before tools.
- I didn't draft the Summary (`hero.richText`) or `role`, since you asked for the narrative only. The page's existing role ("Product, Design, Engineering") matches what the draft claims.
