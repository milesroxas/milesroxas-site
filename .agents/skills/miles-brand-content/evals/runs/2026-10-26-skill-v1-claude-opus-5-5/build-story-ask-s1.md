# How Ask decides when not to answer

An assistant on a portfolio does harm the moment it guesses: someone asks about my work, gets a confident answer I never published, and leaves believing something about me that isn't true. So the assistant I built, Ask, answers only from what is published on milesroxas.com.

Press ⌘K anywhere on the site, or open the Ask tab in the dock, and ask about my work in plain words. The answer stays under 120 words and lists the pages it used. When the honest answer is "ask Miles", it says so and opens a short form that reaches me.

Much of Ask's design is about that last case: knowing when not to answer. I built it first for the Suits & Sandals site, then ported it here. This post covers the index Ask reads from, the path from question to answer, the judge that decides when a question comes to me, what that judge cost, and what Ask keeps. The judge has the clearest result: on the Suits & Sandals site, it raised the right handoff card from 52 to 57 of 57 test turns.

I build with AI coding agents. Across this repo, 261 of 486 commits carry an AI co-author line. On Ask, I designed how it behaves and directed the build, reviewing each change. [check: how design, direction, review and code were split on Ask, which nothing records]

## Only what a visitor can read

Ask's index holds what an anonymous visitor can read, and nothing more. It is one table, `ask_embeddings`, in Postgres with pgvector, an extension that stores embeddings beside ordinary rows. The table is declared in Drizzle next to the schema of Payload, the CMS behind the site. Nothing outside the CMS writes to it.

Drafts and protected client work never reach it. The indexer reads each document the way an anonymous visitor would, so the site's own access rules do the filtering. A protected case study fails the read, and what fails the read can't be retrieved.

## The index moves on publish

The index changes when a document is published or unpublished, not when it is saved. An `afterChange` hook on Pages, Works, Posts and Site Info re-embeds a document when it is published. Draft saves and autosave are skipped, and an unpublish deletes the document's rows. A half-written draft never reaches an answer, and taking a page down takes it out of Ask in the same step.

Passages aim for 2,000 characters and are split on headings. Vectors are reused by exact passage text, so a passage that hasn't changed keeps its vector, and fixing an SEO title re-embeds nothing. A full rebuild of this site takes 12 seconds: 19 documents, 70 passages.

## No passage, no answer

Ask looks for evidence before any model writes a word. OpenAI's text-embedding-3-small turns the question into a 1,536-dimension vector; a follow-up is embedded alone and joined to the previous question. Postgres returns the 12 nearest passages above a cosine similarity of 0.3, through an HNSW index, and Ask groups them into at most four pages, three passages each. Then gpt-5-mini writes the answer from those passages only, in under 120 words.

The 0.3 is a floor, and it is the first place Ask declines. If nothing clears it on a first question, the visitor gets a card that points them to me, and no writing model runs. A model that never runs can't make anything up.

## A judge for the handoff

A handoff is a choice of reason, and the words on the card never come from a model. The writing model has a handoff tool with five reasons: an estimate, a project, a person, contact details, or no answer. Every word on the card is written in code.

Left to the writing model, that choice was right most of the time, and wrong often enough to matter. On the Suits & Sandals site it showed the right card in 52 of 57 test turns (19 questions, three runs each).

So Ask got a judge that runs before the writer. Jev is TypeSafe's System One model: it answers typed questions (Choice, Noul, Score) with probabilities, and my code owns every threshold.

One Jev request classifies each turn as information, an estimate, a project, a person or conversation. The same request asks whether the turn is about the visitor's own project and whether it names my work. Then one request per retrieved passage asks whether the passage is relevant and whether it holds evidence, and code keeps a passage at 0.45 relevance and 0.55 evidence. That passage check let the similarity floor drop from 0.3 to 0.2: a wider search, with a stricter test of what it finds.

Measured on the Suits & Sandals site on September 19, 2026 (model jev-1.13.0), the right card showed in 57 of 57 turns, up from 52. Turns answered with no writing-model call went from 6 to 23.

Code owning the thresholds is what lets the answer be "none". A Choice always picks something. Asked to "fix the FAQ about pricing" on a home page with no FAQ, locateBlock, the tool that finds the block an edit request points at, still picked a block with its Choice, at 0.46. A Noul put the odds that any block fits at 0.02, so the tool answered none.

## What the judge cost

The judge costs time, and the cost lands on worded answers. Because it runs before the writer, median time to first output on worded turns went from 3,490 ms to 4,655 ms. Setting the writer to minimal reasoning brought them to 1,542 ms. Card-only turns got faster with the judge, from 2,669 ms to 365 ms.

Those numbers come from the Suits & Sandals site. On milesroxas.com the turn judge ships behind the `ASK_JEV` switch and is off for now; shadow mode comes next. So 57 of 57 is a result from one site, and whether the judge earns its place on this one is still open. Here, today, a grounded answer takes 5 to 6 seconds end to end, with about 1,650 input and 300 output tokens.

## What Ask keeps

Every turn is saved to an `ask-questions` collection, redacted. Emails, phone numbers, keys and long tokens are stripped, and no IP address or visitor id is kept. Stored questions are kept 90 days.

Deleting them took two tries. An earlier daily cron was meant to clear expired rows, and it never ran. Since October 17, nothing on this site runs on a schedule: expired rows are deleted after each stored question, so the request that adds a row also clears the old ones.

Code also sets each turn's outcome: answered, partial, no_sources or chat_only. Because code sets it, the content-gaps filter is a real list of questions the site cannot answer yet.

The pattern under every decision is the same: models score and write, and code decides what counts. What Ask may say about my work stays a rule I can read.

Try it with ⌘K, anywhere on the site.
