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
| sitemap.xml | [`src/app/sitemap.ts`](../src/app/sitemap.ts) |
| llms.txt, llms-full.txt, markdown alternates, IndexNow key | [`src/app/(frontend)/(ai)/`](<../src/app/(frontend)/(ai)/>), built by [`src/plugins/aeo/buildLlms.ts`](../src/plugins/aeo/buildLlms.ts) |
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

## What is automated

For every collection in `CONTENT_SURFACES` (pages at the root, works under `/works`, posts
under `/posts`):

- **Metadata.** Every route calls `generateMeta` with its document and path. The root layout
  sets the defaults from Site Info: the title template (`<page> | <name>`), the description, the
  default share card, the Twitter card (with the `@handle` found among the social profiles) and
  the robots directives (`max-image-preview: large`, no snippet limits). The page adds its
  title, description, canonical URL, share image (its SEO image, else the hero, else the default)
  and, for a post, the `article` Open Graph fields with its dates and authors. A page marked
  **No Index** in its SEO tab is `noindex, nofollow` and leaves the sitemap and llms.txt.
- **JSON-LD.** The root layout renders the Person and WebSite once; every page's schema points
  back at the Person by `@id`. Home is a ProfilePage, a page a WebPage, a post a BlogPosting
  (authors, dates, categories as keywords, the original publisher for an article written
  elsewhere), a work a CreativeWork (client, industry, capabilities), the indexes
  CollectionPages, contact a ContactPage. Each gets a BreadcrumbList, and any page whose
  composition holds a FAQ block gets a FAQPage with those questions. Nothing is emitted that the
  page does not show.
- **robots.txt** names every AI crawler explicitly (search, user-triggered and training), allows
  them all, disallows the admin, the APIs, the preview switches and `/search`, and carries a
  Content Signal line saying the same. Allowing training is a business choice: move a crawler
  to `TRAINING_DENIED` in `robots.ts` to withdraw it.
- **sitemap.xml** lists the fixed routes and every published document an anonymous visitor may
  read (a protected work never lists), with `lastmod`. One file; the site is far under the
  50,000-URL limit.
- **llms.txt** is the site in the llmstxt.org shape: H1, blockquote, a section per surface with
  one link and description per document, the contact section, then the Site Info notes.
  **llms-full.txt** is the same with every document's text, the exact markdown the Ask corpus
  embeds. **`/posts/<slug>.md`** and **`/works/<slug>.md`**, and `Accept: text/markdown` on the
  page itself, serve one document's markdown with its URL and dates; the HTML page advertises it
  with `<link rel="alternate" type="text/markdown">`.
- **On publish, unpublish, slug change and delete** the AEO plugin refreshes the sitemap and
  the two llms documents and, in production with `INDEXNOW_KEY` set, submits the changed URL
  (and the old one) to IndexNow. Draft saves never reach any of it.

## What editors own

- **Fill Site Info.** Job title, tagline, description, the headshot (square), the default
  preview image (1200×630), the email, and every profile URL. The profiles are the single most
  useful field here.
- **Give every page an SEO description.** It is the search snippet, the share card text, the
  description in llms.txt and the `description` in JSON-LD. The SEO title is the page's own;
  the site name is added by the template, so do not type it.
- **One h1 per page.** Posts, works, the works index and contact render theirs from the title.
  A page's h1 comes from its hero rich text or its first block: give the home page one.
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

## Adding a public collection

1. Add it to `CONTENT_SURFACES` in `src/shared/content/surfaces.ts`. That enrolls it in the
   sitemap, llms.txt, llms-full.txt, the publish hooks, IndexNow, plugin-seo's preview URL, the
   search index and the Ask corpus at once.
2. Add its prefix to the rewrites in `next.config.ts` if it should have markdown alternates.
3. In its route, call `generateMeta` with `pathname` and render `<JsonLd>` with the fitting
   builder from `schema.ts` and a `breadcrumbSchema`.
