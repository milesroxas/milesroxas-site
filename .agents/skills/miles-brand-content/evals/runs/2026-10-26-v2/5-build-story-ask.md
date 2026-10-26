# How I built Ask to answer only from my work

When I built Ask for the Suits & Sandals site, its writing model decided when a question needed me instead of an answer. It showed the wrong handoff card in 5 of 57 test turns.

I then ported Ask to this site. Press ⌘K anywhere, or tap Ask in the dock, and ask about my work in plain words. It answers in under 120 words, only from what is published here, and lists the pages it used. When the honest answer is "ask Miles", it says so and opens a short form that reaches me. [check: why you built Ask in the first place, in one sentence of your own]

On Suits & Sandals, a judge now makes the handoff call before the writer runs. Across the same 19 questions, three runs each, it picked the right card in all 57 turns. This post covers how a question becomes an answer, how the index keeps up with publishing, what the judge does and what it cost, and how questions are logged without keeping the people who ask them.

I build this site with AI coding agents: 261 of the repo's 486 commits are co-authored by one. [check: how design, direction, review and code were split on Ask]

## From question to answer

Ask answers from passages of this site, and when no passage is close enough to a first question, no model runs at all. A question takes four steps:

- **Embed.** OpenAI's text-embedding-3-small turns the question into a vector of 1,536 numbers. A follow-up is embedded alone and joined to the previous question.
- **Retrieve.** Postgres with pgvector, an extension that stores and searches vectors, returns the 12 nearest passages above a cosine similarity of 0.3, through an HNSW index.
- **Group.** The passages are grouped into at most four pages, three passages each.
- **Write.** gpt-5-mini writes the answer from those passages only, in under 120 words.

If nothing clears the 0.3 floor on a first question, the visitor gets a card offering me instead, and no model runs. A weak match never turns into a paragraph, because nothing is asked to write one.

The writer can also hand a question off. It has a handoff tool with five reasons: an estimate, a project, a person, contact details, or no answer. The model picks the reason. Every word on the card is written in code, so the text that sends a visitor to me is never improvised.

## The index follows publishing

Publishing is what updates the index. It is one pgvector table, `ask_embeddings`, declared in Drizzle beside Payload's schema, and nothing outside the CMS writes to it.

An `afterChange` hook on Pages, Works, Posts and Site Info re-embeds a document when it is published. Draft saves and autosave are skipped, and an unpublish deletes the document's rows. Drafts never reach the index.

Protected client work never reaches it either, and the reason is how the indexer reads. It reads each document as an anonymous visitor would, so a protected case study fails the read and leaves nothing to retrieve.

Passages aim for 2,000 characters and are split on headings. Vectors are reused by exact passage text, so fixing an SEO title re-embeds nothing. A full rebuild of this site takes 12 seconds: 19 documents, 70 passages.

## A judge before the writer

The judge sorts each turn and weighs each passage before the writer runs. It is Jev, TypeSafe's System One model, which answers typed questions (Choice, Noul, Score) with probabilities, and my code owns every threshold.

Each turn gets one Jev request. It classifies the turn as information, estimate, project, person or conversation, and asks whether the turn is about the visitor's own project and whether it names my work. Each retrieved passage gets a request of its own, asking whether it is relevant and whether it holds evidence. Code keeps a passage at 0.45 relevance and 0.55 evidence.

Those passage checks let the similarity floor drop from 0.3 to 0.2. A lower floor lets more passages through, and the thresholds drop the ones that don't belong.

Probabilities matter because a Choice will pick an option even when none fits. Asked to "fix the FAQ about pricing" on a home page with no FAQ, locateBlock, the tool that finds which block an edit means, still picked a block with a Choice, at 0.46. A Noul put the odds that any block fits at 0.02, so the tool answered none.

Measured on the Suits & Sandals site on September 19, over 57 turns (19 questions, three runs each), the judge raised the right handoff card from 52 turns to all 57. Turns answered without any writing-model call went from 6 to 23.

## What the judge cost

The judge made worded answers slower, because it runs before the writer. Median time to first output went from 3,490 ms to 4,655 ms. Setting the writer to minimal reasoning brought it to 1,542 ms. Card-only turns went from 2,669 ms to 365 ms.

On this site the judge isn't on yet. It ships behind the `ASK_JEV` switch, off for now, and shadow mode comes next. Today a grounded answer here takes 5 to 6 seconds end to end, with about 1,650 input and 300 output tokens.

## Questions kept, visitors not

Every turn is saved to an ask-questions collection with emails, phone numbers, keys and long tokens stripped out. No IP address or visitor id is kept.

Code sets each turn's outcome (answered, partial, `no_sources` or `chat_only`), not the model. That makes the content-gaps filter a real list of questions the site cannot answer yet.

Stored questions are kept 90 days, and deleting them on time took two attempts. The first was a daily cron, and it never ran. [check: why the cron never ran, if you want the reason on the page] Since October 17, nothing on this site runs on a schedule: expired rows are deleted after each stored question.

Taken together, these choices move judgment out of the writing model and into code I can read and measure: the similarity floor, the passage thresholds, the words on the card, the outcome in the log. The model still writes the answer. Whether it should write one is becoming a question with a number on it.

Press ⌘K to ask it about my work.
