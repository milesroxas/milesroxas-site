# Ask: grounded Q&A over site content (RAG)

Ask is the site's question box. It opens from the dock as a panel (a bottom sheet on a phone, `AskPanel.tsx`, [docs/site-chrome.md](../../../docs/site-chrome.md)) and stands alone at `/ask` (`AskWidget.tsx`); both read one conversation (`AskSession.tsx`). It answers only from published content, with linked sources: the corpus is Pages, Works, Posts and Site Info, as the surface registry lists them ([`src/shared/content/surfaces.ts`](../../shared/content/surfaces.ts)). **Site Info › Ask › Hide Ask** takes it off the site: the dock loses its button, `/ask` is not found and the endpoint answers 404. **Site Info › Ask › Suggested questions** fills the empty panel.

## How a request flows

```
dock panel or sheet / /ask (useAskChat)
  └─ POST /api/ask { id, messages, pagePath, journey, handoff } (AI SDK UI-message protocol)
       ├─ hide check        → 404 if Site Info › Ask › Hide Ask is on
       ├─ config check      → 503 if OPENAI_API_KEY unset
       ├─ rate limit        → 429 (10 req/min per IP, per warm instance)
       ├─ validation        → 400 (last message must be a user question, 3–500 chars,
       │                      or more than 30 messages)
       ├─ retrieval         → embed the retrieval query (current question, or previous
       │                      user turn + current, capped at 700 chars) → cosine search
       │                      over ask_embeddings (20 candidates, grouped into ≤4 doc
       │                      sources of ≤3 chunks); falls back to keyword match over the
       │                      search index when embeddings are unavailable, nothing clears
       │                      the similarity floor, or the embedding call fails
       ├─ no sources, first turn → the handoff (`no_answer`) streamed, no model call
       ├─ no sources, follow-up  → chat-only prompt (no new facts allowed), 400-token cap
       ├─ streamText()      → source-url parts first, then the grounded answer streamed
       │                      (1,200-token cap), with the `handoff` tool on offer until
       │                      the visitor has sent
       └─ recordAskQuestion() → one redacted row per turn in `ask-questions`, written after
                                the response from whichever callback closed the stream
                                (finish, abort/Stop, or error): question, answer,
                                sources with similarity, outcome, tokens, latency
  └─ POST /api/ask/feedback { id, turn, rating?, reason?, handoff? } → the visitor's word on
     a stored turn (thumbs, or the contact-page click); the inquiry intake marks `inquiry_sent`
```

That is the flow with the judge `off`: the code's default, and what any environment without `TYPESAFE_API_KEY` and `ASK_JEV` runs (`.env.example` ships `ASK_JEV=off`). With `ASK_JEV=on` the decisions move out of the writing model:

```
POST /api/ask
  ├─ hide / config / rate limit / validation          (unchanged)
  ├─ resolveJourney()      the journey's paths → titles from the Ask index
  ├─ contact details in the question? (regex, code)   → card `contact_details`, no Jev, no model
  ├─ in parallel:
  │    ├─ judgeTurn()      one Jev request: `request` Choice, the `own_project`,
  │    │                   `general_question` and `names_work` Nouls,
  │    │                   `depends_on_previous` on a follow-up, and
  │    │                   `open_reference` on a page about one thing (a work, a post)
  │    └─ embedMany()      [question], + [previous + question] on a follow-up,
  │                        + ["About {page title}: question"] on such a page
  ├─ routeTurn()           plain `if`s over ASK_JUDGE_THRESHOLDS
  │    ├─ card             → the handoff card, no retrieval, no model
  │    ├─ conversation     → chat-only prompt, no retrieval, no tool
  │    ├─ evidence         → pgvector with the query form `depends_on_previous` picked,
  │    │                     and the page form beside it when `open_reference` says so
  │    └─ fallback         → the flow above, tool and all (unsure or failed judgment)
  ├─ judgePassages()       one Jev request per candidate chunk, all in parallel:
  │                        `is_relevant`, `has_evidence` → keep or drop in code
  │    └─ nothing kept     → card (`no_answer`, or the turn's own reason), no model
  ├─ streamText()          kept chunks only, NO tools, prompt without the tool rules,
  │                        400-token cap, reasoning effort `minimal`
  └─ card after the text   written by code when the route carries a reason
```

## Files

| File | Role |
| --- | --- |
| [`../../endpoints/ask.ts`](../../endpoints/ask.ts) | The Payload endpoints: `POST /api/ask` (the flows above), `POST /api/ask/feedback`, `POST` and `GET /api/ask/reindex`, `GET` and `POST /api/ask/usage`. |
| [`retrieve.ts`](./retrieve.ts) | Retrieval seam: `prepareRetrieval(payload, queries)` embeds every query form at once and returns a `search()` that picks one. Embedding search primary, keyword fallback. A `check` handed to `search()` may veto chunks before they become sources (the judge's passage check; the similarity floor then drops from 0.3 to 0.2). `retrievalQueries()` and `pageRetrievalQuery()` build the query forms. |
| [`judge.ts`](./judge.ts) | The judge, server only: `askJudgeMode()` (`ASK_JEV`, always `off` without `TYPESAFE_API_KEY`), a TypeSafe client pinned to one Jev version with an 800 ms timeout and no retries, `judgeTurn()` and `judgePassages()` (both answer null on any failure), every threshold in `ASK_JUDGE_THRESHOLDS`, and the routing: `routeTurn()`, `routePassage()`, `dependsOnPrevious()`, `leansOnPage()`. Tested in `judge.test.ts`. |
| [`AskSession.tsx`](./AskSession.tsx) | The site's one conversation, mounted in the root providers (`src/providers/index.tsx`): one AI SDK `Chat`, the handoff the visitor sent, and the ratings. Keeps the journey in refs and sends it beside every question. |
| [`useAskChat.ts`](./useAskChat.ts) | Chat wiring shared by the panel and the page: composer state, Stop, one handoff per conversation, visitor feedback. A scripted surface (a `transport` or seeded messages: stories, tests) keeps a chat of its own. |
| [`AskPanel.tsx`](./AskPanel.tsx) | The dock's surface: a dialog anchored to the dock, a bottom sheet below `md`. Holds the draft above both. |
| [`AskWidget.tsx`](./AskWidget.tsx) | The `/ask` page surface. |
| [`messages.tsx`](./messages.tsx) | Transcript body shared by both surfaces: shimmer, sources once the answer settles, the handoff on the last settled reply. |
| [`Composer.tsx`](./Composer.tsx), [`SubmitButton.tsx`](./SubmitButton.tsx) | `AskTextarea` (Enter sends, Shift+Enter breaks a line) and the submit button that becomes Stop while a reply is in flight. |
| [`Sources.tsx`](./Sources.tsx), [`Rating.tsx`](./Rating.tsx), [`feedback.tsx`](./feedback.tsx) | The sources disclosure, the two thumbs with a one-tap reason, and the feedback context plus `postAskFeedback`. |
| [`HandoffPanel.tsx`](./HandoffPanel.tsx) | The way to a person under a finished reply: offer ("Talk to Miles"), form in place ("Send to Miles", posting to the inquiries intake through `postInquiry`), receipt ("Book a call" when Site Info has a booking link). The "Contact page" link carries the questions in sessionStorage (`saveAskHandoff`). |
| [`handoff.ts`](./handoff.ts) | The handoff contract, client-safe: reasons, copy per kind (`ASK_HANDOFFS`), Site Info's terms, the typed message, `askHandoffState`, the sessionStorage carry. `case_study` is in the type but unreachable here (see `storyBrief.ts`). Tested in `handoff.test.ts`. |
| [`handoffTool.ts`](./handoffTool.ts) | The `handoff` tool the model can call with a reason, and `resolveAskHandoff`. Tested in `handoffTool.test.ts`. |
| [`prompts.ts`](./prompts.ts) | `askSystemPrompt()`: grounded or chat-only, with the tool rules only while the tool is on offer (`offersAskHandoff`), the journey notes on a routed turn. Tested in `prompts.test.ts`. |
| [`history.ts`](./history.ts) | `askHistory()`: the transcript as the model sees it, text parts only, a handoff-only reply kept as its lead line. Tested in `history.test.ts`. |
| [`messageText.ts`](./messageText.ts) | The words of a message (text parts only), one reading for endpoint, transcript and handoff. |
| [`journey.ts`](./journey.ts) | The visitor's journey, client-safe and pure: `journeyDigest()` (what the browser sends, eight visits at most), `journeyFrom()` (how the endpoint reads it), `journeyEngagement()` (`read` or `skimmed`). Tested in `journey.test.ts`. |
| [`journeyPages.ts`](./journeyPages.ts) | Server half: `resolveJourney()` matches each path to a document in the Ask index, so every title a model sees is one the site published. `subject` marks pages about one thing: works and posts. |
| [`storyBrief.ts`](./storyBrief.ts) | A stub. sas-site briefs a thin case study from its Content Hub record; this site has no hub, so `resolveStoryBrief()` is always null and the endpoint's thin-story branch never runs. Kept so the endpoint needs no change if a hub arrives. |
| [`vocabulary.ts`](./vocabulary.ts) | The words Ask and the team agree on, client-safe: question length (3 to 500), the message cap (30), outcomes (`askOutcome()`), retrieval paths, ratings and reasons, handoff signals, triage statuses. Tested in `vocabulary.test.ts`. |
| [`questions.ts`](./questions.ts) | `recordAskQuestion()`: one redacted row per turn after the response, no IP, no analytics id, then `pruneExpiredAskQuestions()` deletes the rows past the window (nothing is scheduled). `markAskTurn()`: the rating and handoff signal onto that row, first rating wins. |
| [`redact.ts`](./redact.ts) | `redactFreeText()`: strips emails, phone and card numbers, URL query strings and key-shaped strings. `hasIdentifyingNumber()` is the contact-details check. Tested in `redact.test.ts`. |
| [`retention.ts`](./retention.ts) | `ASK_QUESTION_RETENTION_DAYS` (90), `askRetentionCutoff()`, `ASK_NOTICE` (the transcript's first line) and `ASK_NOTICE_SHORT` (the sheet's foot). Client-safe. |
| [`copy.ts`](./copy.ts) | The panel's strings: scope line, intro, placeholders, thinking and retry lines. |
| [`motion.ts`](./motion.ts) | The transcript's entrance classes. |
| [`model.ts`](./model.ts) | Provider seam: `gpt-5-mini` and `text-embedding-3-small` via the Vercel AI SDK, `ASK_MODEL_API_KEY_VAR`. |
| [`embeddings.ts`](./embeddings.ts), [`chunk.ts`](./chunk.ts), [`schema.ts`](./schema.ts) | ask_embeddings storage and cosine query; the heading-aware markdown chunker (~500 tokens); the Drizzle table, registered via `beforeSchemaInit` in `payload.config.ts`. |
| [`indexSync.ts`](./indexSync.ts), [`../../plugins/ask-index.ts`](../../plugins/ask-index.ts) | Publish, unpublish and delete hooks that re-embed or remove rows; the plugin attaches them to every surface collection and global in the registry. |
| [`backfill.ts`](./backfill.ts), [`../../../scripts/backfill-ask-index.ts`](../../../scripts/backfill-ask-index.ts) | One full pass over every surface with a run lock, shared by the CLI and the admin button. Last summary in Payload KV (`ask:index-last-rebuild`). |
| [`usage.ts`](./usage.ts) | OpenAI spend and tokens over the last 30 days (Costs and Usage APIs). Needs `OPENAI_ADMIN_API_KEY`; `OPENAI_PROJECT_ID` optionally scopes it. Called only on an explicit refresh; report in KV (`ask:usage-report`). |
| [`admin/RebuildIndexPanel.tsx`](./admin/RebuildIndexPanel.tsx), [`admin/UsagePanel.tsx`](./admin/UsagePanel.tsx), [`admin/formatWhen.ts`](./admin/formatWhen.ts) | Site Info › Ask panels: Rebuild index, Usage, and the "last refreshed" date format. |
| [`../../collections/AskQuestions.ts`](../../collections/AskQuestions.ts), [`../../collections/AskQuestions/components/`](../../collections/AskQuestions/components/) | Admin › Ask questions: team-only rows, triage fields, `AskFilters`, `AskConversation`, `AskDashboard` and their queries. |
| [`fixtures.ts`](./fixtures.ts), [`storyPlays.ts`](./storyPlays.ts), `*.stories.tsx` | Story fixtures (also used by unit tests, so free of Storybook's runtime), shared play steps, and the stories for the widget, rating, sources and submit button. |

## The corpus

What gets embedded is decided by the surface registry: Pages (`home` is `/`), Works under `/works`, Posts under `/posts`, and Site Info from `GLOBAL_SURFACES`. [`extractDocMarkdown`](../../shared/content/extract.ts) walks each document (Lexical states and an allowlist of content-bearing strings; select values, URLs and `internal*` fields never reach the corpus) with `overrideAccess: false` and no user, so protected works and drafts stay out exactly as they do for a visitor. The markdown is chunked, embedded with `embedMany`, and written to `ask_embeddings` per document; unchanged chunk text keeps its vector, so a publish that changes no copy costs no tokens.

Sync: publish or update re-embeds (failures log, never block a save); a draft over a published document keeps the published rows; a true unpublish or delete removes them; Site Info re-embeds on every save. Drift repair: **Site Info › Ask › Rebuild index**, or `pnpm exec tsx --env-file=.env scripts/backfill-ask-index.ts`. Against production, point `POSTGRES_URL` at `.env.production.pulled`'s value and set `PAYLOAD_DB_PUSH=false`. pgvector is required once per database (the `ask_embeddings` migration creates the extension; local Docker uses `pgvector/pgvector:pg18`).

## The judge (Jev)

With `ASK_JEV=on` the decisions move to Jev (TypeSafe's System One model) and code, and the writing model only writes from passages already vetted. Turns that need no writing skip it.

- **Code owns the workflow.** Jev returns probabilities; every number lives in `ASK_JUDGE_THRESHOLDS` and every branch is a plain `if` in `routeTurn()` and `routePassage()`.
- **The turn, one request, beside the embedding call:** `request` (information, estimate, project, person, conversation, other), three Nouls (`own_project`, `general_question`, `names_work`), `depends_on_previous` on a follow-up, `open_reference` on a work or post page.
- **The route.** `person` at confidence 0.6 or more is the card alone. An `estimate` is the card alone when `own_project` is 0.6 or more and `general_question` under 0.5; a `project` when it names no kind of work (`names_work` under 0.5) with no general question. Every other estimate or project retrieves, answers, and closes with its card, written by code after the text. `conversation` on a follow-up is chat-only. Everything else retrieves and answers.
- **The passages.** One Jev request per candidate chunk: `is_relevant` below 0.45 drops it, `has_evidence` above 0.55 keeps it. Nothing kept means the card with no model call.
- **Fail open.** A missing key, a timeout, a 429 or a `request` confidence under 0.35 is the judge-off path for that turn (`fell_back`); a passage whose check failed is kept. A visitor never sees a Jev error.
- **Contact details stay in code**, found by `findEmailAddress` and `hasIdentifyingNumber` before Jev is asked, and the question Jev sees is redacted.
- **Once the visitor has sent, never a card**, as `offersAskHandoff` rules the tool.
- **`shadow`** runs Jev beside the judge-off path, awaits nothing in the response, and records `judge_agrees`, `chunks_kept` and the timings.

The model is pinned (`ASK_JUDGE_MODEL`), not `jev-latest`. The thresholds were tuned in sas-site and ported with the code; `scripts/ask-judge-eval.ts` replays the cases in `scripts/ask-cases.ts` against the judge (`pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts`, flags `--passages`, `--from-db`, `--journey`) so a threshold change is checked against numbers.

## The journey

The session keeps which pages this tab has shown, how long each was visible and how far it was scrolled (`journey.ts`). Memory only: nothing is written to the device, nothing carries an id, and it leaves the browser only beside a question. The browser sends paths and numbers; the endpoint resolves each against the Ask index (`journeyPages.ts`), so a made-up path is dropped. Code decides `read` or `skimmed` (20 s on screen, or 60 percent deep after 8 s), the order and the cap of eight.

With `ASK_JEV=on` it does two things; in `off` nothing reads it:

- **It gives "it" a subject.** On a work or post page Jev answers `open_reference`; at 0.8 or more the search also runs as "About {title}: {question}", beside the plain search, never instead, and the kept chunks are pooled.
- **It tells the writing model where the visitor is.** On a grounded, routed turn the prompt names the page asked from and the most recent read pages (`journeyNotes` in `prompts.ts`), to pick what to lead with. The sources stay the only facts.

The journey is not stored on the `ask-questions` row; PostHog gets `journey_pages`, a count.

## What we keep

- **Every turn, for the team**, in `ask-questions` after the response: question and answer (redacted), sources with similarity and path, `outcome` (`answered`, `partial`, `no_sources`, `chat_only`, `stopped`, `error`), handoff reason, latency, tokens, the page asked on and the chat id. Not a quality signal; the rating is.
- **The visitor's word.** Thumbs and a reason per settled reply; `clicked` when the contact-page fallback was taken, `inquiry_sent` when the intake filed an inquiry from that chat (the inquiry carries `askConversation`).
- **Triage.** Status, topic, note and the draft that closes the gap; `AskDashboard` counts the week.
- **Redacted before it lands.** `redactFreeText()` is one layer, not a guarantee. `ASK_NOTICE` tells people they are chatting with an AI and that chats are kept anonymously for 90 days.
- **Deleted on activity.** `pruneExpiredAskQuestions` runs after every stored question; a row past the window goes the next time anyone asks.
- **Nothing at OpenAI.** `store: false` on every call; `sendReasoning: false` keeps the reasoning blob out of the browser.
- **Metadata only in PostHog.** `ask_questioned` carries lengths, counts, durations, the outcome and the judge's facts (`judge_mode`, `judge_ms`, `judge_failed`, `fell_back`, `chunks_kept`, `first_output_ms`, `page_leaned`, `page_attached` and the rest in `turnFacts()`), never the question; `ask_rated` and `ask_handoff_clicked` the visitor's signals.

## Configuration

| Env var | Effect |
| --- | --- |
| `OPENAI_API_KEY` | Enables the endpoint, question embedding and publish-time sync. Unset → 503 answers; hooks skip embedding until the backfill runs. |
| `OPENAI_ADMIN_API_KEY` | Admin key for the usage panel. Unset → the panel is unconfigured; Refresh returns 503. |
| `OPENAI_PROJECT_ID` | Optional. Scopes the usage report to one OpenAI project. |
| `TYPESAFE_API_KEY` | The judge's key. Unset → the judge is `off`, whatever `ASK_JEV` says. |
| `ASK_JEV` | `off` (default), `shadow` or `on`. Rollback is this value and a redeploy. |

Changing the embedding model means re-embedding the corpus: update `EMBEDDING_DIMENSIONS` in `schema.ts` if the size differs, migrate, run the backfill.

## Known limits

- **The rate limiter is per warm serverless instance**: a cost fuse, not a guarantee. Hide Ask is the off switch.
- **Answers are only as good as what is published.** Empty corpus means refusals; run the backfill after seeding content.
- **Follow-up retrieval is a concatenation, not a rewrite.** Good enough for one-hop follow-ups.
- **The judge reads literally** and does not count, compare dates or reason over hops. Its thresholds were not tuned on this site's traffic: read `judge_failed`, `fell_back` and `judge_confidence` on `ask_questioned` before trusting a number.
- **An abandoned handoff form loses its draft.** The offer follows the latest reply; a send already in flight still lands.
