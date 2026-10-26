# Benchmarks

How to tell whether a change to this skill, or to the brand guide, makes Miles's copy better. Each case is a real request with an evidence pack. The grader scores each output on six layers. Code checks what code can check. Jev, TypeSafe's System One model, makes the judgments a regex cannot. Compare reports between skill versions and keep a change only when the numbers hold or improve.

## Contents

- [What gets measured](#what-gets-measured)
- [The Jev questions](#the-jev-questions)
- [Cases](#cases)
- [Anchors and the judge self-test](#anchors-and-the-judge-self-test)
- [Run a benchmark](#run-a-benchmark)
- [Read the scores](#read-the-scores)
- [Refine the skill](#refine-the-skill)
- [Results log](#results-log)
- [Limits](#limits)

## What gets measured

| Layer | Points | What it checks | How |
| --- | --- | --- | --- |
| lint | 15 | The brand guide's hard rules: em dashes, banned phrases, length limits, point of view, hashtags, and the article rules (question headings, one-line paragraphs, recap endings) | `check-voice.mjs`. Any error scores 0; each warning costs a fifth |
| shape | 15 | Articles only. Median sentence 12 to 22 words, 8 to 30% short sentences, median paragraph 25 to 75 words, at most 20% one-line paragraphs, no question or long headings | Code, with bands from `docs/article-voice-study.md` |
| structure | 20 | The opening starts inside the work (5), the point arrives in the first two paragraphs (5), the ending states an implication (6), the title is descriptive or a claim (4) | Jev |
| substance | 25 | Mean specificity of every paragraph (13), at least one decision against an alternative (5), at least one cost, failure or open question (4), the AI split stated where AI did work (3) | Jev |
| tone | 10 | How promotional each paragraph is, averaged | Jev |
| grounding | 15 | The share of factual claims the evidence pack supports, as (supported + 0.9) / (factual + 1) so one verdict cannot swing a short piece to 0. Any contradiction caps the layer at 50. A claim flagged with `[check: ...]` (its own sentence or the one before the marker) is not counted; a piece with no unflagged claims skips the layer | Jev, one question per claim, a second literal check before a contradiction counts |

A layer that does not apply is left out and the rest rescale to 100: a CV bullet has no shape or structure, and a case with no evidence pack has no grounding. Weights, bands and thresholds are constants at the top of `scripts/bench.mjs`. Change them there, never in the questions.

Flags are listed under each output and matter more than the total: a contradicted claim, an opening outside the work, no decision, an ending that recaps, a borrowed line from the study's source, a length outside the case's range.

## The Jev questions

Jev returns typed answers with probabilities and cannot write text. The grader asks it narrow questions over small pieces of state and does everything else in code, following TypeSafe's guidance for jev-1.13 and later: literal questions, criteria that carry the boundary cases, no counting or arithmetic in the model, little unrelated state.

| Question | Primitive | State | Used for |
| --- | --- | --- | --- |
| opens_on_work | Noul | The first two paragraphs | structure |
| point_early | Noul | The first two paragraphs | structure |
| ending, ending_before | Choice: recap, implication, engagement, moral, pointer or detail | The last paragraph and the one before it | structure. A pointer after an implication counts as an implication |
| title | Choice: teaser, descriptive, claim, hype | The title | structure |
| specificity | Score, 3 levels | One paragraph or list | substance |
| selling | Score, 3 levels | One paragraph or list | tone |
| decision, setback | Noul | One paragraph or list | substance (presence anywhere in the piece) |
| ai_did_work, ai_split | Noul, asked only where AI is mentioned | One paragraph | substance |
| grounding | Choice: supported, contradicted, missing, no_facts | One claim, the sentence before it (so "it" resolves), the writer's name, and the six evidence chunks that share the most terms with them | grounding |
| conflict | Noul, asked only after a contradicted verdict | The same state | A contradiction counts only when this agrees; otherwise the claim is listed as not in evidence |

A Noul at or above 0.5 reads as yes. A grounding answer under 0.6 confidence is listed as unsure for a person to read. A full article costs about 50,000 input tokens (well under a cent at jev-1.14 prices) and grades in one to two seconds.

## Cases

Cases live in `evals.json`. Each has the prompt, an `expected_output`, `expectations` a reader can check, and `bench` settings: the lint kind, the evidence files, the word range, and whether AI helped build the subject. Evidence packs are in `evals/files/`, each line naming its source.

| Id | Name | Tests | Evidence | Graded by |
| --- | --- | --- | --- | --- |
| 1 | rewrite-summaries-live | Edit on live works | The CMS | Expectations, by hand (writes CMS drafts) |
| 2 | linkedin-ask | LinkedIn post | `ask-notes.md` | bench + expectations |
| 3 | plan-home-siteinfo | Plan mode | The CMS | Expectations, by hand (reads the CMS) |
| 4 | cv-linear-application | CV bullets and an application answer | Brand guide | bench + expectations |
| 5 | build-story-ask | Article: build story | `ask-notes.md` (holds the retention trap) | bench + expectations |
| 6 | essay-judgment | Article: essay | `ask-notes.md`, `parallel-post.md` | bench + expectations |
| 7 | edit-parallel-open-close | Edit mode, keep every fact | `parallel-post.md` | Expectations |
| 8 | review-ask-draft | Review mode | `ask-draft.md` (holds the retention error) | Expectations |
| 9 | case-study-buzlee | Article: case study, thin evidence | `buzlee-notes.md` | bench + expectations |
| 10 | linkedin-parallel | LinkedIn post from a published post | `parallel-post.md` | bench + expectations |
| 11 | titles-ask | Titles and SEO fields | `ask-draft.md` | Expectations and the lint |

Two traps are built in. The Ask draft says "a daily job deletes rows after 90 days", but since 2026-10-17 nothing on the site runs on a schedule and retention runs after each stored question; case 5 should never repeat it, and case 8 should catch it. The Buzlee pack has no numbers, dates or launch status, so case 9 should mark gaps instead of filling them.

## Anchors and the judge self-test

`evals/anchors/` holds known-good and known-bad outputs. Each bad anchor names, in its front matter, the layers it was written to fail:

| Anchor | Fails on purpose at |
| --- | --- |
| `ask-agency.md` | lint, structure, substance, tone |
| `ask-broetry.md` | shape, structure (true facts, wrong shape) |
| `ask-invented.md` | grounding (the good anchor's shape with invented and contradicted facts) |
| `linkedin-bad.md` | lint, structure, tone |

`--self-test` grades them and passes only when every good anchor beats its bad ones on each named layer. Run it before trusting a benchmark, and again after changing a question, a threshold, a weight or the Jev version. On 2026-10-26 with jev-1.14.0 it passed 14 of 14 checks on every run. All eleven invented sentences in the invented anchor were flagged, five or six of them as contradictions, including the daily-job retention line and "the judge is live for every visitor".

When the grader gets something wrong on a real output, turn that output into an anchor before fixing the grader, so the fix stays fixed.

## Run a benchmark

All commands run from the repo root. `.env` holds `TYPESAFE_API_KEY`. In a worktree, point `--env-file` at the main checkout's `.env`.

1. **Check the judge.**

   ```bash
   node --env-file=.env .agents/skills/miles-brand-content/scripts/bench.mjs --self-test
   ```

2. **Generate outputs.** For each case, start a fresh Claude Code session (a fresh session per case keeps one answer from leaking into the next) and send:

   > Use the miles-brand-content skill. Do not use the CMS. [the case's prompt]. Write only the finished copy to `.agents/skills/miles-brand-content/evals/runs/<YYYY-MM-DD>-<label>/<id>-<name>.md` and everything else (Needs checking, lint result) to `_<id>-notes.md` in the same folder. Do not read `evals/anchors`, `evals/runs`, `evals/benchmarks.md`, `evals/evals.json` or `scripts/bench.mjs`.

   To compare against an older skill, check that version out into a scratch folder and point the session at its `SKILL.md`. To compare with and without the skill, the `skill-creator` skill's eval runner reads the same `evals.json`.

3. **Grade.** Files starting with `_` are skipped, and the report lands in the run folder.

   ```bash
   node --env-file=.env .agents/skills/miles-brand-content/scripts/bench.mjs .agents/skills/miles-brand-content/evals/runs/2026-10-26-v2
   ```

   `--no-jev` grades lint and shape only, offline. `--case 5 file.md` grades any file as a case, which is how to score a draft Miles wrote himself.

4. **Compare.**

   ```bash
   node .agents/skills/miles-brand-content/scripts/bench.mjs --compare .agents/skills/miles-brand-content/evals/runs/2026-10-26-before/report.json .agents/skills/miles-brand-content/evals/runs/2026-10-26-v2/report.json
   ```

5. **Check the expectations** of every case you ran, by reading the output against `expectations` in `evals.json`. Count passes. The cases bench cannot grade (1, 3, 7, 8, 11) are scored this way only.

## Read the scores

- **Totals compare versions; they are not grades.** A model writes differently each run, so one run per case is a sample of one. Run each case two or three times before keeping or reverting a change, and treat a difference under about 5 points as noise.
- **The judge has a little noise of its own.** Graded four times on 2026-10-26, the good Ask anchor scored 94 every time; the bad anchors moved by up to 9 points, almost always because one claim flipped in a piece with only one or two claims. Short pieces swing more.
- **Read every flag.** "CONTRADICTS evidence" means the copy says something the evidence says otherwise: always a fix. "Not in evidence" is a claim to check. Often it is a fair inference the skill should have marked `[check: ...]`; sometimes it is a paraphrase Jev read literally.
- **Read low layers on the output itself.** The report's `perUnit` list shows each paragraph's specificity, selling, decision and setback, so a low substance score points at the paragraphs that caused it.
- **A short pointer paragraph scores low on specificity.** That is expected and costs little.
- **Known false readings.** A general statement that sums up a mechanism ("A Choice always picks something") can read as contradicted. A number derived by arithmetic ("5 of 57", from 52 of 57) reads as not in evidence, because Jev does not calculate. A paraphrase that adds a consequence ("taking a page down takes it out of Ask") reads as not in evidence. Confirm each by eye; when one recurs, add it to an anchor.

## Refine the skill

1. Grade a baseline of the current skill, two or three runs per article case.
2. Find the weakest layer across cases, then read the flagged outputs.
3. Change the part of the skill that owns that layer, and only that part:

   | Weak layer | Where to change it |
   | --- | --- |
   | lint | The rule's reason in `SKILL.md`, or the example pair in `references/examples.md` that shows it |
   | shape | "Paragraphs and sentences" and "Sections and headings" in `references/articles.md` |
   | structure | "Open", "Close" and "Titles" in `references/articles.md` |
   | substance | "Pick the shape", "Evidence" and "Honesty" in `references/articles.md` |
   | tone | "The stance" in `references/articles.md`; the voice section of the brand guide |
   | grounding | "The claim ledger" in `SKILL.md` |

4. Rerun. Keep the change when its layer improves and no other layer drops by more than 5 points; otherwise revert it.
5. Add a row to the results log.

The best test data is Miles's own editing. When he rewrites a generated draft before publishing, save his version as a good anchor and the generated one as a bad anchor that names the layers he fixed. Over time the anchors become a record of his taste, and the self-test checks the grader against it.

## Results log

| Date | Skill version | Run | Cases | Totals | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-26 | judge only | anchors, several runs | 6 anchors | Ask: good 94, agency 32 to 42, broetry 36 to 43, invented 76 to 78. LinkedIn: good 78 to 85, bad 14 to 23 | Self-test 14 of 14 on jev-1.14.0, every run |
| 2026-10-26 | n/a | live copy | Ask draft as case 5; parallel post, no case | Ask draft 64; parallel post 91 | Ask draft: opening outside the work, daily-job retention contradicted, 6 of 19 paragraphs one sentence |
| 2026-10-26 | before (commit 4d76a3b, no articles.md) | `runs/2026-10-26-before`, 1 run each | 5, 6, 9 | 93, 96, 77 (mean 89) | The voice was already strong. Case 5 opened on the feature (structure 75); case 9 flagged nearly every claim, and the one left read as an inference |
| 2026-10-26 | v1: `articles.md` added | `runs/2026-10-26-v1`, 1 run each | 5, 6, 9 | 88, 91, 84 (mean 88) | Structure up, grounding down: the honesty moves pushed writers to infer costs and an open question ("What I haven't settled is scale") |
| 2026-10-26 | v2: honesty and decision moves need a source | `runs/2026-10-26-v2`, case 9 twice | 5, 6, 9 | 95, 91, 83 and 91 (mean 91) | Grounding back (93 to 99), structure 100 on every case. The essay's substance (81) and tone (87) sit below the old skill's (94, 94): the next thing to look at |

Every row was regraded with the final grader. Each skill row is one sample per case (two for case 9 in v2), so the v2 gain is a direction, not a result: run each case two or three more times before treating it as settled.

## Limits

- Jev judges pieces, not the whole: openings, endings, paragraphs and claims one at a time. Whether the argument holds together and whether it sounds like Miles still need a read.
- Claim extraction is a regex (numbers, names, what I or we did, status and scope words such as live, every or only) that collects too much on purpose; Jev sets aside sentences with no checkable fact. Evidence retrieval is lexical, the six chunks sharing the most terms. A claim whose support uses different words can read as "missing".
- The model is pinned to `jev-1.14.0` and every report records the model that answered. Before moving to a newer Jev, run the self-test on both and compare.
- The bands in shape come from one team's long-form. They describe a register, not a law: an essay can sit outside them and still be right.
