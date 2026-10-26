# Website: milesroxas.com

How the brand guide applies to the portfolio site, and how copy reaches it through the `milesroxas-cms` MCP server. Deeper docs: `docs/mcp.md` (tools, write checks), `docs/aeo.md` (SEO and answer engines), `PRODUCT.md` (audience).

## Contents

- [Who reads it](#who-reads-it)
- [Point of view by surface](#point-of-view-by-surface)
- [Surfaces and their copy fields](#surfaces-and-their-copy-fields)
- [Layout blocks](#layout-blocks)
- [Case study shape](#case-study-shape)
- [Posts](#posts)
- [SEO and answer engines](#seo-and-answer-engines)
- [Saving through milesroxas-cms](#saving-through-milesroxas-cms)
- [Rich text formats](#rich-text-formats)

## Who reads it

Recruiters and hiring teams at product organizations, judging fit for a hands-on design role with limited time. They skim the work, so every page must say what Miles did, why, and what came of it, before any detail. Assistants (Ask on the site, ChatGPT, Perplexity) read it too and quote chunks, not pages, so each section has to stand on its own.

The portfolio leads with **Designer & Builder** and proves it through selected work, decisions, artifacts and outcomes. It never reads as a list of agency services.

## Point of view by surface

| Surface | Voice | Why |
| --- | --- | --- |
| Page body, case study narrative, post | First person: "I", and "we" only for real collaboration | Miles speaking about his own work |
| Site Info `tagline`, `description`, `llmsNotes` | Third person: "Miles Roxas is...", "He..." | Feeds JSON-LD, llms.txt, share cards and Ask, which speaks about Miles in the third person |
| SEO description (`meta.description`) | Third person or no subject, never "I" | Read in search results and llms.txt, outside the site's context |
| Ask suggestions | A question a visitor would type | Shown as buttons to visitors |
| Contact page | "You" for the visitor, "I" for Miles | A direct conversation |
| Alt text | Neutral description of what the image shows | Read by screen readers and image search |

## Surfaces and their copy fields

| Document | Copy fields | Shape and limits |
| --- | --- | --- |
| Home (`pages`, slug `home`) | `hero`, `layout` blocks, `meta` | Its h1 is Site Info `name` plus `jobTitle`. The home `meta.title` already leads with the name and is used as written |
| Pages | `title`, `hero.richText`, `hero.links` (max 2), `layout`, `meta` | Media hero types require `hero.media` |
| Works (case studies) | `title`, `hero.richText` (the Summary), `client`, `industry`, `role`, `capabilities`, `intro`, `layout`, `link.label`, `meta` | Summary: 1 or 2 sentences, shown on cards and in search, not in the hero. `role` says what Miles owned. `link.label` stays short (default "Visit <host>") |
| Posts | `title`, `intro` (eyebrow, body), `content`, `layout` (Sections only), `meta`, `categories` | `source: external` means `intro.body` introduces an article published elsewhere and `content` stays empty |
| Site Info (global) | `jobTitle`, `tagline`, `description`, `llmsNotes`, `ask.suggestions`, `affiliations`, `inquiries.responseTime` | `tagline` is one sentence. `description` is 2 to 4 sentences and Ask quotes it. At most 3 Ask suggestions. `responseTime` completes "you will hear back ___" |
| Header (global) | `navItems` | At most 6 links |
| Contact page (global) | `heading`, `lead`, `messagePlaceholder`, `submitLabel`, `submitNote`, `sentHeading`, `sentBody`, `recommendedHeading`, `recommended`, `cvHeading`, `cvNote`, `meta` | `{name}`, `{email}` and `{responseTime}` fill in. `recommended` holds at most 3 works and never a protected one |
| Works index (global) | `title`, `lead`, `meta` | `lead` is 1 or 2 sentences |
| Media | `alt`, `caption` | Alt text is required on upload |
| Capabilities, clients, categories | `title` | Capability titles feed the Person schema's `knowsAbout`, so name real skills plainly |

Field shapes change. When in doubt, `describeFields` with the collection or block type returns the current fields, types and guidance.

## Layout blocks

`layout` is a list of blocks; most pages wrap content blocks in a `section`. Copy fields per block:

- `richTransition` (Standard heading): eyebrow, heading, subheading, body
- `featureHeadingOffset`: heading (required), body
- `fullMedia`, `mediaContentSplit`, `splitContentNarrow`, `carouselSplit`, `imagePair`, `splitImageOffset`: heading and body beside media
- `featureImageStatement`: caption. `caption`: captionOverride
- `richText`: body (Markdown sibling)
- `faq`: eyebrow, heading (required), items (question, answer), prompt, link
- `carouselTabs`: heading, body, 2 to 8 tab titles. `featureTabs`: 2 to 8 tabs, each with title, heading, description, list items, caption
- `insightList`: heading, summary, items (title, description)
- `chart`, `diagram`: title (max 120), `textAlternative` (required, max 1000: what the figure shows and its takeaway), caption (max 300)
- `youtube`: title. `code`: no copy

Headings stay short and read like a table of contents; the sentence goes in the body. A long sentence typed into a heading field becomes a long h2. Don't give every heading the same grammatical form.

## Case study shape

Case study narrative lives in `layout` blocks; there are no story sections. Map the guide's order onto the page:

1. **Summary** (`hero.richText`): the problem and what Miles made, naming the client or product. Under about 220 characters.
2. **Role** (`role`): what Miles actually owned, in a few words ("Product, Design, Engineering", "Sole Contributor"). Leave it empty rather than guess.
3. **Problem**: who had it and why it mattered. A Standard heading with a short body.
4. **Insight**: what Miles noticed that shaped the approach.
5. **Choices**: the decisions and tradeoffs, shown with artifacts (`mediaContentSplit`, `featureTabs`). Decisions are what separate a designer's case study from a gallery.
6. **What was built**: the work itself, media with captions that say what to look at.
7. **Outcome**: only results a source holds. With no measured result, say what shipped, who uses it and its status.
8. **Lesson**: what Miles would keep or change. One honest line beats a moral.

## Posts

Posts carry the "Building and learning" and "Tools and systems" pillars most often. Establish the reader's question before naming tools, give each section one job, and end on an implication the evidence earns. Bylined posts speak as Miles in the first person. Name AI and collaborators where they did the work ("Claude wrote the hook and I reviewed it"): how the work was split is part of the story.

## SEO and answer engines

- **`meta.title`** is the page's own title. The template appends " | Miles Roxas" (14 characters), so keep the stored title to about 45 characters and never type the name. The home page is the exception: its title leads with the name and is used as written.
- **`meta.description`** is the search snippet, the share card, the page's line in llms.txt and its JSON-LD description. 100 to 155 characters, third person or no subject, saying what the page is and naming the client, product or topic. Every page gets one.
- **Answer first.** Open each section with the direct answer, then the detail. Phrase headings as the question a reader would ask where that reads naturally. A page with a FAQ block emits FAQPage schema, so each answer starts with the answer.
- **One h1 per page.** Works, posts, the works index and the contact page render theirs from the title.
- **Keep the entity consistent:** the same name, role ("Designer & Builder") and one-line description wherever Miles appears.

## Saving through milesroxas-cms

The server's own instructions arrive with every session; these are the steps for copy work.

**Find**

- Where the site talks about a topic: `findContent` with the user's words. Published copy only.
- A document's blocks: `outlineDocument` (collection, id), then `getBlock` for the exact stored block. `locateBlock` picks the block an instruction like "the second paragraph about pricing" means.

**Before editing a live document**, read it twice: a find tool returns the published version by default, and `draft: true` returns the latest draft (`outlineDocument` always shows the latest draft). If they differ, Miles has unpublished work in progress. Save on top of it as a draft (`draft: true`, never `draft: false`): his changes stay, the live page stays untouched. In the report, list what his pending draft changes, since publishing the draft ships his changes and yours together.

**Write**

| Change | Tool | Notes |
| --- | --- | --- |
| Copy in one block | `patchBlock` | Merges the partial block and saves a draft |
| Add, move or remove a block | `insertBlock`, `moveBlock`, `removeBlock` | Ask before removing |
| New page, work or post | `describeFields`, then `createDocument` with `draft: true` | Omit `slug` |
| Top-level fields (title, summary, role) | `updateDocument` | Fields inside `data`. Each field replaces the stored one whole: to change the summary, send all of `hero` (its `type` and `media` id too), not only `hero.richText` |
| SEO title and description | `updateSeo` | Draft unless `draft: false` |
| Alt text and caption | `updateMedia` | New images: `pnpm cms:upload <file> --alt "<what it shows>"` |
| Works index | `updateWorksIndex` | Has drafts: send `draft: true` |
| Site Info, Contact page, Header | `updateSiteInfo`, `updateContactPage`, `updateHeader` | Generated tools: fields at the top level, never in a `data` wrapper. No draft state: a save is live. Show Miles the exact change and get a yes first |

A whole-document update must keep every block `id`; blocks sent without ids replace the rows. Relationship fields take ids from a find tool.

**Confirm**

Read the document back with `select` and `draft: true` and check the fields changed as intended. Then give Miles the admin link for live preview: `https://www.milesroxas.com/admin/collections/<collection>/<id>` (globals: `/admin/globals/<slug>`).

## Rich text formats

Markdown is accepted only in the Rich text block's `body`, a post's `content` and a media `caption`, and it replaces existing content only with `replace: true`. No `<word>` sequences, even in backticks.

Every other rich text field (`hero.richText`, a Standard block's `body`, FAQ answers) takes Lexical JSON. One paragraph:

```json
{
  "root": {
    "type": "root", "format": "", "indent": 0, "version": 1, "direction": "ltr",
    "children": [
      {
        "type": "paragraph", "format": "", "indent": 0, "version": 1, "direction": "ltr",
        "textFormat": 0, "textStyle": "",
        "children": [
          { "type": "text", "text": "One sentence of copy.", "mode": "normal", "style": "", "detail": 0, "format": 0, "version": 1 }
        ]
      }
    ]
  }
}
```

Add one paragraph object per paragraph. Never send empty paragraphs to pad spacing.
