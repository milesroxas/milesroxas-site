# Ask: evidence pack

Facts a benchmark output may use. Each line names its source. Anything else is a claim to mark `[check: ...]`.

## What it is
- Ask answers questions about Miles's work from what is published on milesroxas.com only, lists the pages it used, and stays under 120 words. (Ask post draft)
- Visitors open it with ⌘K anywhere on the site or the Ask tab in the dock. (Ask post draft)
- When the honest answer is "ask Miles", it says so and opens a short form that reaches him. (Ask post draft)
- Miles built Ask first for the Suits & Sandals site, then ported it to milesroxas.com. (Ask post draft)
- Drafts and protected client work never reach the index. (Ask post draft)

## How a question becomes an answer
- OpenAI's text-embedding-3-small turns the question into a 1,536-dimension vector; a follow-up is embedded alone and joined to the previous question. (Ask post draft)
- Postgres with pgvector returns the 12 nearest passages above a cosine similarity of 0.3, through an HNSW index. (Ask post draft)
- Passages are grouped into at most four pages, three passages each. (Ask post draft)
- If nothing clears the floor on a first question, the visitor gets a card offering Miles and no model runs. (Ask post draft)
- gpt-5-mini writes the answer from those passages only, in under 120 words. (Ask post draft)
- The writing model has a handoff tool with five reasons (estimate, project, person, contact details, no answer); every word on the card is written in code. (Ask post draft)

## Keeping the index current
- The index is one pgvector table, ask_embeddings, declared in Drizzle beside Payload's schema. Nothing outside the CMS writes to it. (Ask post draft)
- An afterChange hook on Pages, Works, Posts and Site Info re-embeds a document when it is published; draft saves and autosave are skipped; an unpublish deletes its rows. (Ask post draft)
- The indexer reads each document as an anonymous visitor would, so a protected case study fails the read and cannot be retrieved. (Ask post draft)
- Passages aim for 2,000 characters and are split on headings. Vectors are reused by exact passage text, so fixing an SEO title re-embeds nothing. (Ask post draft)
- A full rebuild of this site takes 12 seconds: 19 documents, 70 passages. (Ask post draft)

## The Jev judge
- Jev is TypeSafe's System One model: it answers typed questions (Choice, Noul, Score) with probabilities; Miles's code owns every threshold. (Ask post draft)
- One Jev request classifies each turn (information, estimate, project, person, conversation) and asks whether it is about the visitor's own project and whether it names Miles's work. (Ask post draft)
- One Jev request per retrieved passage asks whether it is relevant and whether it holds evidence; code keeps a passage at 0.45 relevance and 0.55 evidence, which let the similarity floor drop from 0.3 to 0.2. (Ask post draft)
- Measured on the Suits & Sandals site, 2026-09-19, model jev-1.13.0: 57 turns (19 questions, three runs each). Right handoff card: 52 before the judge, 57 with it. Turns answered with no writing-model call: 6 before, 23 with the judge. (Ask post draft)
- The judge alone made worded turns slower (median first output 3,490 ms before, 4,655 ms with the judge), because it runs before the writer. Minimal reasoning on the writer brought them to 1,542 ms. Card-only turns went from 2,669 ms to 365 ms. (Ask post draft)
- On milesroxas.com the turn judge ships behind the ASK_JEV switch and is off for now; shadow mode comes next. (Ask post draft)
- locateBlock asked to "fix the FAQ about pricing" on a home page with no FAQ: the Choice still picked a block at 0.46, but a Noul put the odds that any block fits at 0.02, so the tool answered none. (Ask post draft)
- findContent judged 24 passages in 366 ms for "design systems", kept 7 and dropped 17, for 14,696 input tokens. (Ask post draft)

## Logging and retention
- Every turn is saved to an ask-questions collection, redacted: emails, phone numbers, keys and long tokens are stripped; no IP address or visitor id is kept. (Ask post draft)
- Stored questions are kept 90 days. Since 2026-10-17 nothing on the site runs on a schedule: expired rows are deleted after each stored question. The earlier daily cron never ran. (src/features/ask/retention.ts, commit "nothing on a schedule", 2026-10-17)
- The outcome (answered, partial, no_sources, chat_only) is set by code, so the content-gaps filter is a real list of questions the site cannot answer yet. (Ask post draft)

## How it was built
- 261 of the repo's 486 commits carry a "Co-Authored-By: Claude" line: Miles builds with AI coding agents. (git log, 2026-10-26)
- How design, direction, review and code were split on Ask specifically is not recorded. (no source: mark `[check: ...]`)

## Speed on milesroxas.com
- A grounded answer takes 5 to 6 seconds end to end today, with about 1,650 input and 300 output tokens. (Ask post draft)
