# Articles

How to write long-form for milesroxas.com: posts, essays and case study narrative. The voice is the brand guide's; this file is the craft. Its model is the long-form a product team writes about its own work, studied in `docs/article-voice-study.md` (53 posts, measured). Borrow the moves, never the lines, and never name the source in copy.

## Contents

- [The stance](#the-stance)
- [Pick the shape](#pick-the-shape)
- [Open](#open)
- [Sections and headings](#sections-and-headings)
- [Paragraphs and sentences](#paragraphs-and-sentences)
- [Evidence](#evidence)
- [Honesty](#honesty)
- [Close](#close)
- [Titles](#titles)
- [Before you deliver](#before-you-deliver)

## The stance

A maker explaining a decision to a peer who builds things too. Calm, specific, opinionated where the work earned the opinion. The reader should finish knowing what was made, why it took the shape it did, and what it cost. Nothing is sold: the work is the argument, and a link to it is the only call to action.

## Pick the shape

Name the shape before outlining. Each has a skeleton; sections can merge, but the order holds.

| Shape | Use for | Skeleton | Length |
| --- | --- | --- | --- |
| Build story | A feature, tool or system Miles made ("How I built Ask") | Tension, the result in one paragraph, one section per decision (constraint, options, choice, cost), what did not work, what it changed | 700 to 1,800 words, 4 to 7 sections |
| Practice | A way of working ("How I run parallel workspaces") | The moment it started, the rule stated plainly, how it runs day to day, what it costs, why it stays | 700 to 1,400 words |
| Essay | A point of view ("Why I review agent output instead of reading it") | The common belief, where it falls short, one story from Miles's own work that shows it, the choice it leads to | 450 to 900 words, few or no headings |
| Field notes | Lessons from doing one thing many times | Who Miles is in relation to the topic, then principle headings, each followed by one real instance, then a reframe | 800 to 1,400 words |
| Case study narrative | A work page | The order in `references/website.md` (summary, role, problem, insight, choices, what was built, outcome, lesson) | Per block |

A build story with no decision in it is a changelog. An essay with no story from Miles's work is generic thought leadership. When the evidence has no decision or no story, ask Miles for one before drafting. Never reason one into existence: a skeleton slot with no source stays empty, or holds a `[check: ...]` question in a chat draft.

## Open

The first paragraph earns the second. Use one of four openings, all grounded in the work. The examples below use facts from Miles's published posts; they show the move, not copy to reuse.

- **The observation.** A plain truth about the problem space that the piece will complicate. "Someone building alone is rarely blocked by how fast they can write code. They are blocked by waiting."
- **The scene.** A dated moment from the work. "On October 7 this site's repo took 58 commits."
- **The stake.** What people assume, and why Miles did it anyway. "Running fourteen branches against one schema sounds like a way to break production."
- **The admission.** Where Miles started, including what was wrong. "Without a judge, Ask's writing model decided when to hand a question to me. On the Suits & Sandals site it showed the wrong card in 5 of 57 test turns."

State the point by the end of the second or third paragraph: what the piece shows, the result in numbers if there is one, or the question it answers. A build story often previews its sections in that paragraph ("three scripts, one database per workspace, and the migration gates"), and the headings then follow that order.

Never open with an announcement ("I'm excited to share"), a greeting, a question you then answer, a dictionary definition or a claim about "today's world". The lint catches the common ones.

## Sections and headings

- One job per section. Its first sentence makes the section's claim or answers its implied question, so an assistant quoting the section alone still gets the point.
- Headings are labels ("The judge", "Database per workspace") or claims ("Unchanged text costs nothing", "Access rules do the filtering"). Principle headings in the imperative ("Check ports before use") suit field notes. Not questions, not sentences: about two to six words, eight at most, sentence case.
- Give the outline a visible logic: stages in order, decisions in the order they were made, or principles that build. A reader skimming only the headings should be able to retell the piece.
- Subsections in field notes: a principle heading, then a short "In practice" with one real instance.

## Paragraphs and sentences

- Paragraphs of two to four sentences, about 30 to 70 words. A one-sentence paragraph is a turn in the argument, used a few times per piece, not a rhythm.
- Mostly full sentences of 12 to 25 words, plain verbs, one idea each. After a longer build, a short sentence lands the turn ("Nothing outside the CMS writes to it." "The guards took longer than the scripts.").
- Contrast does the arguing. Define a choice against the alternative that was actually on the table: "rather than", "instead of", "we kept X; Y would have meant Z". Avoid the template "it's not just X, it's Y" (the lint flags it).
- Define a term once, inline, the first time a reader needs it: "pgvector, a Postgres extension that stores embeddings". Then use it plainly.
- Lists for parallel items a reader will scan (the scripts, the guards, the costs). Each item starts with its point in a few bold words, then one or two sentences.

## Evidence

- Numbers carry a comparison, a unit and how they were measured: "the right handoff card in 57 of 57 test turns, up from 52 (19 questions, three runs each)". Mark approximations as such ("about", "roughly"). Precision you do not have is a claim you cannot back.
- Costs and failures are numbers too: "setup takes about 30 seconds instead of 1 while the main dev server holds the template".
- Name the tool after the problem it solved, never as the opening point.
- Captions say what to look at and what changed, not what the image is.
- Every number, name, date, role and outcome goes through the claim ledger in `SKILL.md`. The article shape never justifies a fact the evidence does not hold.

## Honesty

These moves are what make the piece credible, and each one is a claim. Use every one the evidence holds; a build story or practice post usually has at least two. An invented cost, failure, doubt or open question is as false as an invented metric, and worse, because it sounds candid. Inferring "the cost was X" from a choice, or "I haven't settled Y" from a gap, counts as inventing. When the evidence holds none, ask Miles which went wrong and what it cost.

- **The concession.** Say the objection first, then why the choice still stands. "A Postgres container per workspace is the obvious isolation. It is also slow and eats memory, so each workspace gets its own database in one shared container."
- **What did not work.** The first approach, why it failed, what replaced it.
- **The cost.** What the choice made slower, harder or more expensive, in plain numbers where they exist.
- **The open question.** What Miles has not settled yet, stated as such.
- **The split of the work.** One sentence on who did what, in the body where it happened: "A coding agent built each task while I reviewed the one before." Name collaborators and credit them. "We" only for real collaboration.

## Close

End on what the work implies, in one to three sentences: the principle the decisions add up to, or a return to the opening image now that it means more. Then, optionally, one plain line pointing to the work ("The case study has the details:" plus the link, or "Ask the site at ⌘K").

No recap of the sections, no moral about the industry, no question to the reader, no "thanks for reading". If the last paragraph could close any article, cut it and end one paragraph earlier.

## Titles

- Descriptive ("How I built Ask", "Why nothing on this site runs on a schedule") or a claim ("Unchanged text should cost nothing"). Sentence case. About 60 characters at most.
- No teasers that hide the subject, no "ultimate guide", no numbers unless the piece is literally that many principles.
- The `meta.title` is a shorter variant of about 45 characters; the `meta.description` follows `references/website.md`.

## Before you deliver

Run the lint with `--kind article`, then answer each with yes:

1. Does the first paragraph name a real tension, scene, stake or admission from the work?
2. Is the point stated by the third paragraph?
3. Does every section open with its claim, under a short label or claim heading?
4. Is there at least one decision with the alternative it beat and what it cost, each from a source?
5. Is there at least one thing that did not work, or an open question, from a source? If none exists, did you ask instead of inventing one?
6. Is the split between Miles, collaborators and AI stated where the work happened?
7. Does every number have a unit, a comparison and a source in the ledger?
8. Does the ending state an implication rather than a summary?
9. Could someone else's portfolio publish any paragraph unchanged? If so, make it specific or cut it.
