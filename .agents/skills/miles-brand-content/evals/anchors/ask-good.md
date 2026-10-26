---
case: 5
label: good
about: A build story written to references/articles.md from evals/files/ask-notes.md only. Every bad anchor for case 5 should score below it.
---

# How Ask decides when not to answer

A portfolio gets read by someone with a few minutes and one question, and the page they land on rarely answers it. So this site has Ask: press ⌘K anywhere, ask about my work in plain words, and the answer comes only from what is published here, with the pages it used listed under it.

The answer was the easy part. The hard part was deciding when Ask should not answer and should hand the question to me instead. On the Suits & Sandals site, where Ask started, a judge model now picks the right handoff in 57 of 57 test turns, up from 52. This post covers the index that keeps Ask current, the judge that makes the call, and what the judge cost.

## Publishing is the trigger

Ask only knows what is published. An `afterChange` hook on Pages, Works, Posts and Site Info re-embeds a document when it is published; draft saves and autosave are skipped, and an unpublish deletes its rows. The indexer reads each document the way an anonymous visitor would, so a protected case study fails the read and can never be retrieved.

Vectors are reused by exact passage text rather than rebuilt on every publish, so fixing an SEO title re-embeds nothing and fixing a typo re-embeds one passage. A full rebuild of the site takes 12 seconds: 19 documents, 70 passages.

## Only the last step writes

A question is embedded with OpenAI's `text-embedding-3-small`, and pgvector returns the 12 nearest passages above a similarity of 0.3. If nothing clears that floor on a first question, the visitor gets a card that offers me, and no model runs. Otherwise `gpt-5-mini` writes the answer from those passages only, in under 120 words.

Pricing and timing depend on the project, so Ask does not guess. The writing model can call a handoff tool with five reasons, and every word on the card it opens is written in code rather than by the model.

## A judge instead of a guess

Without a judge, the writing model decided when to hand a question to me. Across 57 test turns (19 questions, three runs each) it showed the wrong card 5 times, about one visitor in eleven sent the wrong way.

Jev, TypeSafe's System One model, now makes that call. It answers typed questions with probabilities instead of prose: one request classifies each turn as information, estimate, project, person or conversation, and my code owns every threshold. With it, the right card came up in all 57 turns, and 23 turns needed no writing-model call at all, up from 6.

## What the judge cost

The judge runs before the writer, so on its own it made worded answers slower: the median first output went from 3,490 ms to 4,655 ms. The fix came from the judge itself. Once routing was decided, the writer no longer had to reason about it, and minimal reasoning brought worded turns down to 1,542 ms. Card-only turns dropped from 2,669 ms to 365 ms.

On milesroxas.com the judge is still switched off. It goes to shadow mode next, recording what it would have done without acting, until enough real questions come in to compare against.

## A Choice always crowns something

The same judge serves the agents that edit this site. Asked to "fix the FAQ about pricing" on a home page with no FAQ, a Choice over the page's blocks still picked one, at 0.46. A second question, whether any block fits at all, put the odds at 0.02, so the tool answered none and the agent stopped. A judgment that has to pick needs a partner that can say nothing fits.

The same pattern finds copy by topic. Asked for "design systems", the editing tool pulled the 24 nearest passages and had Jev judge each one: 7 kept, 17 dropped, in 366 ms. Asked for "pricing", it returned nothing, which is right, because no published page covers it.

I build this site with AI coding agents: 261 of the repo's 486 commits carry Claude as a co-author. [check: how design, direction, review and code were split on Ask]

## The questions it cannot answer

Every turn is stored redacted, with no IP address or visitor id, and kept for 90 days; expired rows are deleted after each new question is stored. Its outcome is set by code, not by a model. So a question Ask cannot answer is not a failure to hide. It is a list of what this site should say next.
