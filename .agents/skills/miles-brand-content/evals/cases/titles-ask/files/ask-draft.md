<!-- Snapshot of the unpublished post "Building Ask: A RAG Assistant Inside My Payload CMS" (posts id 10, latest draft), read 2026-10-26. Input for cases 5, 8 and 9. Code blocks, images and chart data are summarized as [figure] lines. -->

# Building Ask: A RAG Assistant Inside My Payload CMS

Ask answers from my case studies and posts, shows where each answer came from, and hands off to me when the site has no answer.

Press ⌘K anywhere on this site, or tap **Ask** in the dock, and ask about my work in plain words. The answer comes only from what is published here, lists the pages it used, and stays under 120 words. When the honest answer is "ask Miles", it says so and opens a short form that reaches me.

I built Ask first for my agency's site, Suits & Sandals, then ported it to this one. This post covers the parts that matter: the retrieval pipeline, the Payload integration that keeps it current, and where TypeSafe's Jev model replaces prompt-and-parse with typed judgments.

- **Grounded.** Answers come from published content only. Drafts and protected client work never reach the index.
- **Cited.** Every answer lists the pages it drew on.
- **Honest about gaps.** Pricing, timing and "can we talk" questions go to a person instead of a guess.
- **Measured.** Every turn is logged, redacted, so a question the site cannot answer becomes a content brief.
- **Shared.** The same index and judge power the agent tools I use to edit this site.

## How a question becomes an answer

Only one step calls a writing model, and it is the last one.

1. **Embed.** OpenAI's `text-embedding-3-small` turns the question into a 1,536-dimension vector. A follow-up is embedded twice in the same call: alone, and joined to the previous question.
2. **Search.** Postgres with pgvector returns the 12 nearest passages above a cosine similarity of 0.3, through an HNSW index.
3. **Group.** Passages fold into at most four pages, three passages each, best match first.
4. **Decide.** If nothing clears the floor on a first question, the visitor gets a card that offers me, and no model runs at all.
5. **Write.** `gpt-5-mini` answers from those passages only, in under 120 words. The page links reach the browser before the first word does.

[figure] From question to answer: One embedding call, one vector query, and at most one writing call per turn.

Pricing and timing depend on the project, so Ask does not guess. The writing model has a `handoff` tool with five reasons (estimate, project, person, contact details, no answer), and every word on the card it opens is written in code, not by the model.

## Payload keeps the index current

The index is one pgvector table, `ask_embeddings`, declared in Drizzle beside Payload's own schema and created by a regular migration. Nothing outside the CMS writes to it.

- **Publishing is the trigger.** An `afterChange` hook on Pages, Works, Posts and Site Info re-embeds a document when it is published. Draft saves and autosave are skipped, and a real unpublish deletes its rows.
- **Access control does the filtering.** The indexer reads every document the way an anonymous visitor would (`draft: false`, `overrideAccess: false`). A protected case study fails that read, so it can never be retrieved, quoted or leaked.
- **Chunks follow the writing.** An extractor walks Lexical rich text and block fields into Markdown, splits on headings, and aims for 2,000 characters a passage, so each passage carries its heading trail into the prompt.
- **Unchanged text costs nothing.** Vectors are reused by exact passage text, so fixing an SEO title re-embeds nothing, and fixing a typo re-embeds one passage.
- **Figures count.** A chart or diagram reaches the index through its title, caption and text alternative, so the figures in this post are searchable too.

A full rebuild of this site takes 12 seconds: 19 documents, 70 passages.

[figure] What happens when I save: Access rules decide what is indexed, so a protected work cannot slip in through a missed filter.

## Jev makes the calls a prompt should not

A language model is good at writing a paragraph and unreliable as a router. Ask it "is this a pricing question?" inside a long prompt and you get a guess in prose that you then have to parse. TypeSafe's Jev, a System One model, answers typed questions about a piece of state instead: a **Choice** among named options, a **Noul** (yes or no, as a probability), or a **Score** on a written scale. Every answer comes back as a number, and my code owns every threshold.

Ask uses Jev in two places:

- **The turn.** One request classifies the question as information, estimate, project, person or conversation, and asks whether it is about the visitor's own project and whether it names my work. A request for a person, or for a price on the visitor's own project, gets the card with no writing-model call at all.
- **Each passage.** One request per retrieved passage asks two Nouls: is it relevant, and does it hold evidence usable in a direct answer. Code keeps a passage at 0.45 relevance and 0.55 evidence. That lets the similarity floor drop from 0.3 to 0.2 without letting noise into the prompt.

[figure] Code: the two passage Nouls and the routePassage function, which keeps a passage when the check fails.

I measured the judge on Suits & Sandals before switching it on there: 19 questions, three runs each, 57 turns, with the model pinned to `jev-1.13.0`.

[figure] The judge got every handoff right: right handoff card 52, 57, 57; words only when needed 49, 56, 57; no writing-model call 6, 23, 24 (before the judge, with the judge, with the judge and minimal reasoning).

[figure] Time to the first thing a visitor sees: median ms, all turns 3,177, 3,408, 1,355; worded turns 3,490, 4,655, 1,542; card-only turns 2,669, 365, 382.

The judge alone made worded turns slower, because it runs before the writer starts. Once the judge had made the routing decision, the writer no longer needed to reason about it, so dropping it to minimal reasoning brought the median first word to about 1.5 seconds.

On this site the turn judge ships behind a switch (`ASK_JEV`), and it is off for now: visitors get the path without it, where the writing model decides when to call the handoff tool. Next it goes to shadow mode, where it records what it would have done without acting, once enough real questions come in to compare against.

## The same index powers my editing tools

I edit this site through an MCP server that agents like Claude Code connect to. Two of its tools reuse the Ask index and Jev, so an agent can find and change copy without loading a whole page into its context. Both run on the server, so the agent never pays for the judgment or sees the pages it reads.

- **findContent** takes a topic in plain words, pulls the 24 nearest passages at a low floor, and sends one Jev request per passage. A Noul (does it mention the topic, even in other words) keeps or drops it, and a Score (in passing, part, or the whole passage) orders what is kept. For "design systems" it judged 24 passages in 366 ms, kept 7 and dropped 17, for 14,696 input tokens. For "pricing" it returned nothing, which is correct: no published page covers it.
- **locateBlock** takes an edit instruction and a page, and asks one Choice over the page's blocks plus one Noul for whether any block fits at all.

[figure] An agent edits by topic, not by page: no page reaches the agent's model; it sees passages, then one block.

The Noul matters because a Choice always crowns something. I asked locateBlock to "fix the FAQ about pricing" on my home page, which has no FAQ. The Choice still picked the Strategy block at 0.46, but the Noul put the odds that any block fits at 0.02, so the tool answered `none` and the agent stopped instead of editing the wrong thing.

"Tighten the design services blurb" on the same page came back `found` at 0.99, in 153 ms.

## Every question becomes a content brief

Every turn is saved to an `ask-questions` collection in Payload: the redacted question and answer, the pages used with their similarity, the outcome, the latency and token counts, any rating, and how far the visitor went toward contacting me. Emails, phone numbers, keys and long tokens are stripped before anything is stored. No IP address or visitor id is kept, analytics get metadata only, and a daily job deletes rows after 90 days.

The outcome is the useful part. `answered`, `partial` (answered, then offered me), `no_sources` and `chat_only` are set by code, not by a model, so the content-gaps filter is a real list of questions the site cannot answer yet. Each row has triage fields, including a link to the draft that closes the gap, and the admin dashboard shows the last seven days at a glance.

## By the numbers

- **70 passages.** From 19 published documents. A full rebuild takes 12 seconds; after that, publishing keeps the index current.
- **5 to 6 seconds.** For a grounded answer on this site today, end to end, with about 1,650 input and 300 output tokens.
- **366 ms.** For Jev to judge 24 passages in parallel in findContent, about 15,000 input tokens.
- **57 of 57.** Test turns that got the right handoff card with the Jev judge, up from 52.
- **90 days.** How long a redacted question is kept before a daily job deletes it.

Try it: press ⌘K and ask about anything here. If the site cannot answer, that question is the next thing I write about.
