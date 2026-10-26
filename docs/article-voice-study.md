---
title: Long-form voice study (Linear, "From the team")
updated: 2026-10-26
purpose: The analysis behind .agents/skills/miles-brand-content/references/articles.md and the article benchmark. Read it to see why a rule exists before changing it.
---

# Long-form voice study

Linear's "From the team" feed (linear.app/now/team) is the clearest public example of a product team writing about its own work without selling it. This study measures how it is written and turns what transfers into rules for Miles's posts, essays and case studies. The brand guide (`docs/miles-roxas-brand-context.md`) still owns identity and voice. This document only covers long-form craft.

## Method

- **Corpus:** all 53 posts in the feed on 2026-10-26, from 2019 to 2026-10-13, about 64,000 words. Extracted to Markdown (headings, paragraphs, lists, captions), then measured with scripts.
- **Measures:** sentence and paragraph length, heading form, pronoun density, contrast and concession markers, quantified claims, hype vocabulary, openings and endings. Rates are per 1,000 words.
- **Close reading:** 14 posts read in full across every shape: essays ("Output isn't design", "Design is more than code", "Settings are not a design failure", "Why is quality so rare?"), build stories ("A calmer interface for a product in motion", "A Linear spin on Liquid Glass", "How we built Linear Agent", "AI coding has made CI a bottleneck, so we reworked ours to keep up", "Styling Linear for the future with StyleX"), practice posts ("Why we committed to a zero-bugs policy", "Quality Wednesdays", "How we hire at Linear") and first-person field notes ("Teaching an agent to auto-fix bugs", "Reviewing code in the agent era", "Five principles for working with Loops").
- **Not reproduced:** no Linear text is copied into the skill. The skill's examples use facts from Miles's own posts.

## The headline: the voice matured, and the mature voice is the model

The feed did not always read this way. Posts from 2019 to 2022 (10 posts, mostly funding news and release round-ups) read like a startup announcing itself. Posts from 2025 and 2026 (30 posts) read like makers explaining decisions. Per 1,000 words:

| Marker | 2019 to 2022 | 2025 to 2026 | Change |
| --- | --- | --- | --- |
| Hype words (excited, powerful, magical, empowering) | 1.70 | 0.43 | 4 times rarer |
| Contrast markers (rather than, instead of, not just) | 0.63 | 1.86 | 3 times more |
| Approximate quantities (roughly, about, nearly + number) | 0.09 | 0.54 | 6 times more |
| Numbers with a unit (seconds, %, PRs, bugs) | 0.36 | 1.09 | 3 times more |
| Admissions (did not work, harder path, skeptical, mistake) | 0.18 | 0.83 | 4.6 times more |
| Credits to named people | 0.09 | 0.20 | 2 times more |

Read together: the newer posts argue by contrast, prove with measured numbers that admit their own imprecision, and earn trust by saying what went wrong. The rules in `articles.md` target the 2025 to 2026 voice only.

## Editorial model

- **A named maker writes each post.** The strongest recent posts are first person by the engineer or designer who did the work, sometimes introduced in one line by an editor. Authority comes from proximity to the work, not from the company. This maps directly onto Miles: one maker, first person.
- **The product is the setting, not the subject.** Posts are about a problem or a practice; the product appears as the place the work happened. Calls to action are one soft line at the end (try it, read the docs, open roles), often in italics. Many posts have none.
- **Six shapes recur.** Of the 53 posts: 14 build stories, 12 essays, 10 practice posts, 10 company news, 5 field notes or guides, 2 post-mortems. Each shape has a stable skeleton (see `articles.md`, "Pick the shape"). Company news is the shape that transfers least.

## Openings

Every recent post opens inside the work or inside a tension, never with an announcement. Four patterns cover nearly all of them:

1. **The observation.** A plain claim about how software or design usually behaves, which the post will complicate.
2. **The scene.** A dated, specific moment: an issue assigned, an offsite exercise, a keynote watched.
3. **The stake.** What people assume or doubt, followed by the commitment anyway.
4. **The admission.** The writer's starting doubt or mistake, stated in the first sentence.

By the second or third paragraph the post states its point, and build stories often preview their sections there, so the headings that follow read as a promised list. Funding posts (the 2019 to 2022 era) are the only ones that open with "we're excited".

## Structure and headings

- **2025 to 2026: 146 headings, none phrased as questions.** All 16 question headings in the corpus are from 2021 to 2024, in interview-style posts. About 74% are short noun-phrase labels, 16% imperatives (principles, in field notes and technical posts), 10% claims with a verb. Median length: five words.
- **Each section opens with its claim.** The first sentence of a section states what the section shows; detail and examples follow. That is also what makes a section quotable on its own by an assistant, so it serves answer engines without question headings.
- **Field notes pair a principle with proof.** A principle heading, then a short "In practice" subsection with one real instance. The pairing keeps advice from floating free of evidence.
- **Essays use few or no headings** and run 450 to 900 words.

## Sentences and paragraphs

- **Not choppy.** Median sentence 18 words (mean 20), with only 11% at eight words or fewer and 15% at 30 or more. Short sentences are placed: they land a turn after a longer build.
- **Essays run shorter and punchier** (mean 12 to 14 words, 22 to 35% short sentences); technical build stories run longer (22 to 27 words).
- **Paragraphs are real paragraphs.** Median 46 words, ninetieth percentile 81. Only 9% are a single short line. No broetry.
- **Plain register.** Little jargon; when a term is needed it is defined once, inline, in a clause.

## The rhetorical engine

- **Contrast defines every choice.** A decision is described against the alternative that was really on the table, with the cost of each. "Rather than" and "instead of" do most of this work, not the template "it's not just X, it's Y".
- **Concession before commitment.** The objection is stated in the writer's own words, then answered: it sounds unreasonable, here is why it is the only thing that makes sense.
- **Measured, honest numbers.** Before and after pairs with units, the method of measurement named, approximations marked. Failure rates are reported as plainly as wins.
- **Admissions as evidence.** The harder path chosen and why, the first attempt that failed, the guilt about a review habit, the moment that was still not convincing. These raise trust more than any claim.
- **One or two outside references, used to frame.** An essay leans on a source or two (an architect's theory of fit, a design-history precedent, a 1920s essay on mass production) to give the argument depth. Never a stack of citations.
- **Grounded analogies.** Everyday comparisons (a habit like brushing your teeth) rather than metaphors of revolution.

## AI in the copy

Recent posts mention AI constantly and never sell it. Three habits:

- **Tools are named matter-of-factly, after the problem.** A coding agent built an internal color tool in a couple of hours; agents answered where a component was used.
- **The split of labor is explicit.** The agent one-shots a well-scoped task and the engineer reviews and merges; a migration had too many edge cases to hand over wholesale.
- **Capability is reported with its failure rate.** An agent lands the right fix about a third of the time on messy tasks, and that is said in the same paragraph as the wins.

This is the brand guide's AI rule, already practised at scale.

## Endings

- **An implication, not a recap.** The last paragraph states what the decisions add up to, or returns to the opening image now that it means more (a post that opened on an unseen animation flaw closes on it).
- **Then, at most, one soft line**: a link to try the feature, read the docs or see open roles.
- No summaries of the sections, no questions to the reader, no inspirational morals in the recent posts.

## Titles

Four forms, all sentence case and literal: "How we X" or "Why we X" (the most common), a claim ("Output isn't design", "Settings are not a design failure"), a cause and effect ("AI coding has made CI a bottleneck, so we reworked ours to keep up"), and a plain label with a subtitle. One numbered title in 53 ("Five principles for working with Loops"), used because the post is literally five principles.

## Translating to Miles

| Linear does | Miles does | Why |
| --- | --- | --- |
| "We" for the company | "I", and "we" only for real collaboration with credit | The guide's point-of-view rule; most of Miles's work is solo or directed AI work |
| Company scale (ARR, customers, team size) | Solo scale, stated plainly (commits, workspaces, test turns) | Never borrow a scale the evidence does not hold |
| About 2 em dashes per 1,000 words | None | The guide bans them; the CMS refuses them |
| Product plug or hiring line at the end | A link to the case study or Ask, or nothing | The portfolio's job is to show the work |
| One outside reference in essays | Only a source Miles actually draws on | An adopted reference reads as borrowed authority |
| Principle headings and "In practice" | Same | Fits field notes and case study choices |
| Funding-era excitement | Never | The 2019 to 2022 voice is the part to avoid |

## What this found in the current skill and content

- **The skill had no long-form guidance** beyond three sentences in `references/website.md`, and its advice to phrase headings as questions contradicts the long-form model for posts. Fixed: `references/articles.md`, a narrower heading rule in `website.md`, and an `article` kind in the lint.
- **The evals had no article case.** Fixed: `evals/benchmarks.md` and seven new cases.
- **"Fourteen branches, one afternoon" already follows most of the model**: an observation opening, the point by the third paragraph, a list of guards each with the bug that caused it, an honest cost list, and an ending that states the implication. One note: its slug ends in "as-a-solo-engineer", an identity label the guide avoids. Changing it needs a redirect, so it is Miles's call.
- **The Ask draft is strong on mechanism and numbers** but opens on the feature rather than the reader's problem, has no section on what did not work, and claims "a daily job deletes rows after 90 days". The repo's rule is that nothing runs on a schedule and Ask retention runs after each stored question, so that sentence needs checking before it publishes. The benchmark uses it as a grounding trap.

## Where each finding lives

| Finding | Rule in `references/articles.md` | Lint (`check-voice.mjs --kind article`) | Benchmark dimension (`scripts/bench.mjs`) |
| --- | --- | --- | --- |
| Openings inside the work | Open | cliche-opener | opens_on_work |
| Point by paragraph three | Open | none | point_early |
| Label or claim headings | Sections and headings | question-heading, long-heading, sections | shape.headings |
| Real paragraphs, placed short sentences | Paragraphs and sentences | one-line-paragraphs, uniform-sentences | shape.* |
| Contrast and decisions | Paragraphs and sentences, Pick the shape | contrast-frame | decision |
| Measured numbers | Evidence | claim-number (info) | grounding |
| Admissions | Honesty | none | setback |
| AI split of labor | Honesty | ai-hype | ai_split |
| Implication endings | Close | recap-ending | ending |
| Calm register | The stance | avoid-phrase, launch-language, exclamation | selling |
