# Notes for 5-build-story-ask.md

**Job:** write a website post (Tools and systems pillar, with Building and learning), bylined as Miles in the first person. Readers are hiring teams at product organizations plus builders who are curious how Ask works. Afterwards they should understand what Ask does, why it is shaped the way it is, and what Miles owned. Source: evals/files/ask-notes.md only. Nothing was saved to the CMS.

## Needs checking

1. **Why Ask exists.** The opening line "I built Ask so you can ask about my work and get an answer from what is published..." gives a motive the notes don't hold. Confirm it, or tell me the reason in your words.
2. **Who did what on Ask.** The notes say outright that the split of design, direction, review and code on Ask isn't recorded. The line "I designed how it behaves and directed the build with those agents, reviewing and testing each change" is a placeholder. Correct it before publishing. If agents or anyone else did specific parts, name them.
3. **Shadow mode.** Readers won't know the term. Give me one line on what it does here. Example: the turn judge runs alongside Ask and logs its calls without changing answers.
4. **The closing lesson.** "Let models give prose and probabilities, and let code make the calls" is my summary of the evidence (code-written cards, code-set outcomes, thresholds in code, the locateBlock Noul at 0.02). Confirm it is yours, or rephrase it.
5. **Whether the passage judge runs on milesroxas.com today.** The notes only say the *turn* judge is off behind `ASK_JEV`. I wrote around this: the post says Ask "can" put a judge in front of the writer, and the 0.2 floor is given with no site attached. If the passage judge is live here, the post can say so.

## Choices worth a look

- **Suits & Sandals numbers are labelled.** The judge measurements (57 turns, 52 to 57 right cards, 6 to 23 no-writer turns, the ms timings) come from the Suits & Sandals site on 2026-09-19 with jev-1.13.0, and the post says so. The 5 to 6 second figure is for milesroxas.com end to end. The two speeds measure different things (time to first output vs. end to end), so the post never compares them.
- **locateBlock** appears as "a tool that finds the block an edit refers to". The notes only imply that description, so check it reads right to you.
- **Model names** (text-embedding-3-small, gpt-5-mini, Jev) show up only in the mechanism sections, after the reader knows what Ask is for. The opening and the lesson are about decisions.
- **Commit count** (261 of 486 with a Claude co-author line) is there for transparency about AI assistance, not as a boast. Cut it if you'd rather keep the build section to the split of work alone.
- Code identifiers sit in backticks (`ask_embeddings`, `ASK_JEV`). I wrote outcome values out in words.

## Title and SEO (if this becomes a post)

- Title: **Ask only knows what I've published** (34 characters; the template adds " | Miles Roxas")
- Alternatives: "How Ask answers from published work only" / "Why Ask hands some questions to me"
- `meta.description` (142 characters, third person): "How Ask, the question box on milesroxas.com, answers only from published work, hands off to Miles when it should, and keeps its index current."

## Lint

- Post: `node SKILL_DIR/scripts/check-voice.mjs --kind body --format text 5-build-story-ask.md` gave **0 errors, 0 warnings, 5 info**. Four info rows are the open `[check: ...]` markers above. One is "90 days", which comes from the notes (Logging and retention).
- Title options and meta description (JSON, metaTitle and metaDescription kinds): 0 errors, 0 warnings, 0 info.
- Lint ran with the default chat target. Saving to the CMS would mean removing the four inline markers and leaving those claims out (lint `--target cms` fails on a marker).
