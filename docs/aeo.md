# SEO and AEO

How the site is read by search engines and by AI assistants (ChatGPT, Claude, Perplexity,
Copilot, Google AI Overviews), what is automated, and what only an editor can do. Ported from
sas-site's AEO plugin and docs, trimmed to a one-person portfolio.

| Concern | Where |
| --- | --- |
| Page metadata: title template, description, canonical, share card, robots | [`src/utilities/generateMeta.ts`](../src/utilities/generateMeta.ts) |
| Share images from an upload (Cloudflare resize, size, alt) | [`src/utilities/shareImage.ts`](../src/utilities/shareImage.ts) |
| JSON-LD builders (Person, WebSite, ProfilePage, WebPage, CollectionPage, ContactPage, BlogPosting, CreativeWork, BreadcrumbList, FAQPage) | [`src/utilities/schema.ts`](../src/utilities/schema.ts), rendered by [`src/components/JsonLd`](../src/components/JsonLd/index.tsx) |
| The facts everything reads: name, job title, tagline, description, contact, profiles, headshot, default preview image | Site Info global, [`src/globals/SiteInfo.ts`](../src/globals/SiteInfo.ts) |
| robots.txt, with the AI crawlers named | [`src/app/robots.ts`](../src/app/robots.ts) |
| Vercel Firewall: which clients may read the site at all | Vercel dashboard › project `milesroxas` › Firewall (see "Crawler access" below) |
| sitemap.xml | [`src/app/sitemap.ts`](../src/app/sitemap.ts) |
| llms.txt, llms-full.txt, markdown alternates, IndexNow key | [`src/app/(frontend)/(ai)/`](<../src/app/(frontend)/(ai)/>), built by [`src/plugins/aeo/buildLlms.ts`](../src/plugins/aeo/buildLlms.ts) (documents) and [`src/plugins/aeo/pageMarkdown.ts`](../src/plugins/aeo/pageMarkdown.ts) (the indexes and contact) |
| Publish hooks: refresh the listings, ping IndexNow | [`src/plugins/aeo/index.ts`](../src/plugins/aeo/index.ts) |
| Which collections are public, under which prefix | [`src/shared/content/surfaces.ts`](../src/shared/content/surfaces.ts) |
| SEO tab on each collection (title, description, image, noindex) | [`src/collections/shared/seoTab.ts`](../src/collections/shared/seoTab.ts), plugin config in [`src/plugins/index.ts`](../src/plugins/index.ts) |

## What the research says (October 2026, condensed)

1. **Google needs nothing special.** Its AI features guide says there are no extra requirements
   for AI Overviews or AI Mode, and that no AI text file or markup is needed: normal indexing,
   snippet eligibility, and the `nosnippet`, `max-snippet` and `noindex` controls apply.
2. **Classic indexing gates citations.** Google's index feeds AI Overviews; Bing's feeds Copilot
   and part of ChatGPT; Perplexity and OpenAI run their own crawlers; Claude search reads the
   web with its own fetchers. Be indexed everywhere and allow the AI search bots.
3. **Server-rendered text is the whole game.** Most AI crawlers do not run JavaScript. Every
   public page here is a server component; copy that only exists in a client component is
   invisible to them.
4. **Structure moves citation rates.** Pages with a clear heading ladder, an answer-first
   opening per section and schema markup are cited more often. Keyword density does nothing.
5. **Entity consistency.** The `sameAs` profile list and a stable name, role and one-line
   description across LinkedIn, GitHub and the rest are what let an assistant match the site to
   the person.
6. **llms.txt is a hedge.** Google does not read it; Perplexity and Claude sometimes do; most
   files on the web get no requests at all. It costs nothing to generate from the CMS, so it is
   served. The markdown alternates are the more real agent surface: coding and browsing agents
   send `Accept: text/markdown` today.
7. **The firewall decides before any of this does.** Profound's and Anagram's 2026 crawlability
   audits put WAF challenges and `403`/`429` answers to AI user agents at the top of the list of
   reasons a site is never cited: robots.txt that says "allow" means nothing when the CDN
   turns the crawler away. Vercel's Bot Protection challenge excludes the bots in its verified
   directory (bots.fyi: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User,
   Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Amazonbot,
   Meta-ExternalAgent, DuckAssistBot, MistralAI-User, CCBot), but its separate "AI Bots" managed
   rule denies exactly those crawlers when it is set to Deny, and unverified clients (an agent's
   fetch tool, an auditing crawler, `curl`) get the challenge page on every URL.
8. **Entity completeness is the person-site lever.** Profound's citation research (11.8 billion
   citations, 2026) finds the long tail of company and personal sites, not the press, is the
   largest citation source, and that a Person or Organization with `sameAs`, a role, a place and
   an affiliation is what lets an answer engine resolve the name. `knowsAbout`, `affiliation`
   and `worksFor` are read; `speakable` is still a Google News feature and is not used here.

## What is automated

For every collection in `CONTENT_SURFACES` (pages at the root, works under `/works`, posts
under `/posts`):

- **Metadata.** Every route calls `generateMeta` with its document and path. The root layout
  sets the defaults from Site Info: the title template (`<page> | <name>`), the description, the
  default share card, the Twitter card (with the `@handle` found among the social profiles) and
  the robots directives (`max-image-preview: large`, no snippet limits). The page adds its
  title, description, canonical URL, share image (`documentShareImage`: its SEO image, else the
  hero's upload, else the preview still of the Studio look grounding the hero, else the default)
  and, for a post, the `article` Open Graph fields with its dates and authors. A page marked
  **No Index** in its SEO tab is `noindex, nofollow` and leaves the sitemap and llms.txt.
- **JSON-LD.** The root layout renders the Person and WebSite once; every page's schema points
  back at the Person by `@id`. The Person carries the name split into given and family name,
  the job title, the city-level address, the headshot, the profiles as `sameAs`, the Capabilities
  taxonomy as `knowsAbout`, and Site Info › Affiliations as `affiliation` and `worksFor`. Home
  is a ProfilePage (`dateCreated` and `dateModified`), a page a WebPage, a post a BlogPosting
  (authors, dates, categories as keywords, the original publisher for an article written
  elsewhere), a work a CreativeWork (client with its live site, industry, capabilities), the
  indexes CollectionPages whose `mainEntity` is an ItemList of what they list, contact a
  ContactPage. Each gets a BreadcrumbList, and any page whose composition holds a FAQ block gets
  a FAQPage with those questions. Nothing is emitted that the page does not show. A CMS user
  saved by first name alone ("Miles") still resolves to the Person entity (`isSiteOwner`), in
  the schema and in the `article:author` meta.
- **Landmarks and headings.** The root layout wraps every page in one `<main>`; the home hero
  carries the page's h1 (name and role from Site Info, screen-reader only, since the opening is
  a portrait between two word strips); the works index keeps its count beside the h1, not in it.
- **robots.txt** names every AI crawler explicitly (search, user-triggered and training), allows
  them all, disallows the admin, the APIs, the preview switches and `/search`, and carries a
  Content Signal line saying the same. Allowing training is a business choice: move a crawler
  to `TRAINING_DENIED` in `robots.ts` to withdraw it.
- **sitemap.xml** lists the fixed routes and every published document an anonymous visitor may
  read (a protected work never lists), with `lastmod`. One file; the site is far under the
  50,000-URL limit.
- **llms.txt** is the site in the llmstxt.org shape: H1, blockquote, a section per surface with
  one link and description per document, the contact section, then the Site Info notes.
  **llms-full.txt** is the same with every document's text, as its page shows it.
- **Markdown alternates.** Every page with something to read has one, as the llmstxt.org
  proposal asks: the page's URL with `.md` added, and `Accept: text/markdown` on the page's own
  URL (coding and browsing agents send it). The HTML page advertises it with
  `<link rel="alternate" type="text/markdown">` and stays the canonical URL.

  | Page | Alternate | Says |
  | --- | --- | --- |
  | `/` | `/index.md` (and the spec's `/index.html.md`) | Site Info's name and role as the H1, then the page |
  | `/works/<slug>`, `/posts/<slug>` | `/works/<slug>.md`, `/posts/<slug>.md` | The document with its URL and dates |
  | `/works`, `/posts` | `/works.md`, `/posts.md` | The index's heading and words, one link and description per document |
  | `/contact` | `/contact.md` | The page's words, the form and its reply time, the email, the profiles, the CV |

  Each says only what its page shows: an external post is its introduction and the link to the
  original (the body it kept is left out), and the home page (the Home global,
  `src/globals/Home.ts`) drops its hero, a portrait with no words. `/ask` has none: it is a chat box with nothing to read. Root pages other than home
  have none either, since `/<slug>.md` would have to be routed beside every root file.
- **On publish, unpublish, slug change and delete** (for the Home global, publish and unpublish:
  it lists first under Pages, `ContentSurface.home`) the AEO plugin refreshes the sitemap and
  the two llms documents and, in production with `INDEXNOW_KEY` set, submits the changed URL
  (and the old one) to IndexNow. Draft saves never reach any of it.

## Crawler access (Vercel Firewall)

The production project is `milesroxas` (not `milesroxas-site`). Its firewall, as of 2026-10-15:

- **Bot Protection: Challenge.** Verified bots pass; everything else that is not a browser gets
  the "Vercel Security Checkpoint" page (`429`).
- **AI Bots: Allow.** It was Deny until 2026-10-15, which returned `403` to every AI crawler
  robots.txt invites. Keep it on Allow; the robots.txt `TRAINING_DENIED` list is the place to
  withdraw a crawler, because a crawler that reads a `403` learns nothing about why.
- **Custom rule "Public pages readable" (Bypass).** `GET` and `HEAD` requests to any path not
  under `/api`, `/admin` or `/next/` skip Bot Protection, so an agent's fetch tool, an auditing
  crawler or `curl` can read robots.txt, the sitemap, llms.txt, the markdown alternates and the
  pages. Forms, Ask, the MCP endpoint and the admin keep the challenge (BotID guards the forms).
  Vercel's DDoS mitigation is a system layer and still applies.
- The other two custom rules bypass the challenge for the MCP client and the Stream webhook.

Check it with `vercel firewall status` and `vercel firewall rules list` after
`vercel link --scope roxas --project milesroxas`, or from a shell:
`curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.2)" https://www.milesroxas.com/robots.txt`
must answer `200`, never `x-vercel-mitigated`.

## What editors own

- **Fill Site Info.** Job title, tagline, description, the headshot (square), the default
  preview image (1200×630), the email, every profile URL, and the affiliations (the agency,
  with its URL and your role). The profiles are the single most useful field here: LinkedIn is
  the one assistants reconcile a person against first, and it is missing.
- **Give every page an SEO description.** It is the search snippet, the share card text, the
  description in llms.txt and the `description` in JSON-LD. The SEO title is the page's own;
  the site name is added by the template, so do not type it.
- **One h1 per page.** Posts, works, the works index and contact render theirs from the title;
  the home page's is the name and job title from Site Info. A long sentence typed into a
  Standard block's heading field becomes an h2: keep headings short and put the sentence in the
  body, so the outline reads like a table of contents.
- **Answer first.** Open each section with a direct answer, then the detail. Headings that read
  like the question someone would ask. Each section should stand on its own; assistants quote
  chunks, not pages.
- **Honest dates.** `publishedAt` is set on first publish; `updatedAt` moves on every save and
  is the `dateModified` and sitemap `lastmod`.
- **Keep the entity consistent off-site**: the same name, role and one-line description on
  every profile the `sameAs` list names.

## Operator runbook

1. **`INDEXNOW_KEY`** in the Vercel production environment (`openssl rand -hex 16`). Served at
   `/indexnow.txt`; pings fire only when `VERCEL_ENV` is `production`.
2. **Google Search Console**: verify, submit `/sitemap.xml`, and check the Enhancements reports
   for the structured data types above.
3. **Bing Webmaster Tools**: verify (one-click import from Search Console), submit the sitemap.
   Its AI Performance report is the only first-party view of AI citations.
4. Validate a page's JSON-LD with the [Rich Results Test](https://search.google.com/test/rich-results)
   or the [Schema Markup Validator](https://validator.schema.org/) after a template change.
5. After any firewall change, fetch robots.txt, the sitemap, llms.txt and one `.md` alternate
   with a non-browser user agent (the `curl` line above) and confirm `200`.
6. Rename the CMS user from "Miles" to "Miles Roxas" (Admin › Users) so the by-line and the
   `article:author` meta read the full name without the first-name fallback.

## Adding a public collection

1. Add it to `CONTENT_SURFACES` in `src/shared/content/surfaces.ts`. That enrolls it in the
   sitemap, llms.txt, llms-full.txt, the publish hooks, IndexNow, plugin-seo's preview URL, the
   search index and the Ask corpus at once.
2. Add its prefix to the rewrites in `next.config.ts` if it should have markdown alternates,
   and pass `markdownPath` to `generateMeta` in its route.
3. In its route, call `generateMeta` with `pathname` and render `<JsonLd>` with the fitting
   builder from `schema.ts` and a `breadcrumbSchema`.
