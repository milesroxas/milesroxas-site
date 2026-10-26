# Ask only knows what I've published

I built Ask so you can ask about my work and get an answer from what is published on milesroxas.com, and nothing else. [check: that this is why Miles built Ask, in his words] It lists the pages it used and stays under 120 words. When the honest answer is "ask Miles", it says so and opens a short form that reaches me.

Press ⌘K anywhere on the site, or open the Ask tab in the dock. I built it first for the Suits & Sandals site, then ported it here.

One rule runs through all of it: models supply prose and probabilities, and code makes the calls.

## What reaches the index

Only published pages. Drafts and protected client work never get in, so Ask has nothing to quote from them.

The index is one pgvector table, `ask_embeddings`, declared in Drizzle beside Payload's schema. Nothing outside the CMS writes to it. A hook on Pages, Works, Posts and Site Info re-embeds a document when it is published. Draft saves and autosave are skipped, and an unpublish deletes the document's rows.

The indexer reads each document the way an anonymous visitor would. A protected case study fails that read, so it can't be retrieved. Ask can't reveal what a visitor couldn't see, because it only ever reads what a visitor sees.

Passages aim for 2,000 characters and split on headings. Vectors are reused by exact passage text, so fixing an SEO title re-embeds nothing. A full rebuild of this site takes 12 seconds: 19 documents, 70 passages.

## From question to answer

An embedding model, OpenAI's text-embedding-3-small, turns your question into a vector of 1,536 numbers. A follow-up is embedded alone, joined to the question before it.

Postgres returns the 12 nearest passages above a cosine similarity of 0.3, through an HNSW index. Ask groups them into at most four pages, three passages each.

If nothing clears that floor on a first question, no model runs. You get a card offering to reach me. Otherwise gpt-5-mini writes the answer from those passages only, in under 120 words.

On this site a grounded answer takes 5 to 6 seconds end to end today, with about 1,650 input tokens and 300 output tokens.

## When the answer is "ask Miles"

Some questions shouldn't get a generated answer. The writing model has a handoff tool with five reasons: an estimate, a project, a person, contact details, or no answer. The model can choose to hand off. It can't write the card. Every word on the card is written in code, so it reads the same for every visitor and no model can put a promise in it.

## A second check before the writer

Similarity says a passage sits near the question. It doesn't say the passage answers it. So Ask can put a judge in front of the writer: Jev, TypeSafe's System One model. Jev answers typed questions (a Choice, a Noul or a Score) with probabilities, and my code owns every threshold.

Ask sends it two kinds of request. One per turn classifies the question (information, estimate, project, person or conversation) and asks whether it is about the visitor's own project and whether it names my work. One per retrieved passage asks whether it is relevant and whether it holds evidence. Code keeps a passage at 0.45 relevance and 0.55 evidence. With that check in place, the similarity floor could drop from 0.3 to 0.2.

The thresholds stay in code because a forced choice still picks something when nothing fits. Jev also runs in locateBlock, which finds the block an edit refers to. Asked to "fix the FAQ about pricing" on a home page with no FAQ, its Choice still picked a block, at 0.46. A separate Noul put the odds that any block fits at 0.02, so the tool answered none.

The numbers come from the Suits & Sandals site, measured on September 19, 2026 with jev-1.13.0: 19 questions, three runs each, 57 turns.

- The right handoff card: 52 turns before the judge, all 57 with it.
- Turns answered with no writing-model call: 6 before, 23 with it.
- Card-only turns: 2,669 ms before, 365 ms with it.

It cost time too. The judge runs before the writer, so worded turns got slower: median time to first output went from 3,490 ms to 4,655 ms. Minimal reasoning on the writer brought them to 1,542 ms.

On this site the turn judge ships behind a switch, `ASK_JEV`, and it is off for now. Shadow mode comes next. [check: one line on what shadow mode does here, for readers who don't know the term]

## What Ask keeps

Every turn is saved to an ask-questions collection, redacted first. Emails, phone numbers, keys and long tokens are stripped, and no IP address or visitor id is kept. Stored questions are kept for 90 days.

Code sets each turn's outcome (answered, partial, no sources, chat only), not the model. That makes the content-gaps filter a real list of questions the site can't answer yet.

Expired rows were meant to be cleared by a daily cron. It never ran. Since October 17, 2026, nothing on this site runs on a schedule: expired rows are deleted after each stored question instead.

## How I built it

I build with AI coding agents: of this repo's 486 commits, 261 carry a "Co-Authored-By: Claude" line. On Ask, I designed how it behaves and directed the build with those agents, reviewing and testing each change. [check: how design, direction, review and code were split on Ask; no record holds it]

## What I'd keep

Let models give prose and probabilities, and let code make the calls. That rule is why the handoff card always says the same thing, why a protected case study can't leak, and why the content-gaps list can be trusted. [check: this lesson, in Miles's words]
