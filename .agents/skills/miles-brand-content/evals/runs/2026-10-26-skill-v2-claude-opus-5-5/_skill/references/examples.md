# Before and after

Pairs that show the voice by contrast. "Live" befores were on milesroxas.com on 2026-10-16; the others are typical drafts. Every after uses only facts a source holds (named under each pair) and marks the rest with `[check: ...]`. They illustrate the voice. They are not approved copy to paste.

## Contents

1. [Site tagline](#1-site-tagline)
2. [Case study summary](#2-case-study-summary)
3. [Summary with gaps](#3-summary-with-gaps)
4. [About paragraph](#4-about-paragraph)
5. [I and we](#5-i-and-we)
6. [Crediting AI](#6-crediting-ai)
7. [SEO description](#7-seo-description)
8. [Section heading](#8-section-heading)
9. [LinkedIn post](#9-linkedin-post)
10. [CV bullet](#10-cv-bullet)
11. [Alt text](#11-alt-text)
12. [Article opening](#12-article-opening)
13. [Article section](#13-article-section)
14. [Article ending](#14-article-ending)

## 1. Site tagline

Before (live, Site Info `tagline`):
> Design lead and engineer with 16 years launching brand identities and shipping digital experiences.

After:
> Designer and builder with 16 years across brand, product and technology, who designs experiences and builds the systems behind them.

Why: the guide's identity and core line replace "design lead and engineer". Third person, because the tagline feeds structured data and Ask. Source: the brand guide.

## 2. Case study summary

Before (live, NextStreet work `hero.richText`):
> A high-velocity organization required a unified design system to support multiple products and teams at scale.

After:
> NextStreet serves small businesses under several partner brands. I led the design system that lets each brand look like itself and lets design, engineering and internal teams work independently.

Why: names the client and the real problem, says what Miles did, and drops "high-velocity" and "at scale", which any portfolio could claim. Sources: the work's `role` ("Product Design Lead") and its published SEO description.

## 3. Summary with gaps

Before (live, GentleBeast work `hero.richText`):
> A new product required a website that translated brand narrative into a clear, conversion-ready digital experience.

After, as a chat draft:
> GentleBeast offers on-demand puppy training. Its website had to explain the service quickly and turn a visit into a booking. [check: Miles's role; the role field is empty] [check: is a booking the conversion the site was built for?]

Why: specifics replace "translated brand narrative" and "conversion-ready". The markers show where evidence ends. Saved to the CMS, the draft keeps only the first sentence and the questions go under Needs checking.

## 4. About paragraph

Before:
> I'm a passionate creative director and full-stack engineer who helps brands stand out with innovative solutions.

After:
> I'm a designer and builder. I've spent 16 years across brand, product and technology, and I like problems where the design and the system behind it have to be solved together. Buzlee is a recent one: a community product I took from concept to working applications.

Why: the right label, one concrete project instead of three claims, and a motivation from the guide in plain words. Sources: the brand guide (identity, years, motivators, Buzlee evidence).

## 5. I and we

Before:
> We designed and built the new Suits & Sandals website in six weeks.

After:
> I designed and built the new Suits & Sandals website on Payload CMS in six weeks.

Why: the published case study credits Miles for design and build, so "we" understates his part and blurs who did what. Where studio colleagues did part of the work, name what they did. Source: the work's published SEO description and `role` ("Design & Build").

## 6. Crediting AI

Before:
> I leveraged cutting-edge AI to engineer a full-stack RAG platform that seamlessly answers any question.

After:
> I wanted the Ask box on this site to answer from my own work, not the open web. Payload hooks keep a search index current every time I publish. I designed how Ask behaves and directed the build with AI coding agents, then reviewed and tested each change. [check: how the work was split between Miles and the agents]

Why: the reader's question comes first, then the mechanism, then an honest split of the work. "Leveraged", "cutting-edge" and "seamlessly" are banned; "engineer a full-stack platform" claims a depth the guide says never to imply. Sources: the Ask post's SEO description, `PRODUCT.md` (Ask answers from site content only).

## 7. SEO description

Before:
> Check out this amazing case study about my work on an awesome community app!

After:
> Buzlee, a local events app for small towns: one feed, one map, business flyers and human moderation. A product design and engineering case study.

Why: says what the page is and names the product, in third person with no "I", inside 100 to 155 characters. Source: the Buzlee work's summary and SEO description.

## 8. Section heading

Before:
> Our Comprehensive Approach To Delivering World-Class Design Systems

After:
> Why each brand needed its own theme

Why: short, specific, and phrased like the question a reader has, so the outline reads as a table of contents and an assistant can quote the section on its own.

## 9. LinkedIn post

Before:
> 🚀 Thrilled to announce my new portfolio is LIVE! Built with cutting-edge AI, it's a total game-changer. Check it out and let me know what you think! 👇 #design #AI #webdev #nextjs #portfolio #buildinpublic

After:
> My portfolio has an Ask box that only answers from my own work.
>
> I wanted a reviewer to be able to ask "has he built a design system?" and get an answer grounded in the case study, not a guess. So the site keeps an index of every published page, updated whenever I publish.
>
> The decision that took longest was what Ask should refuse to answer, and when it should hand a question to me instead. [check: that this took longest, in Miles's words]
>
> I designed how it behaves and directed the build with AI coding agents, reviewing and testing every change.
>
> The write-up: [link] [check: the Ask post is still a draft]

Why: one idea, a first line that states it, a real decision, honest credit, one link. No launch language, emoji or hashtag wall. Sources: `PRODUCT.md`, the Ask handoff in `src/features/ask/prompts.ts`, the Ask post (draft).

## 10. CV bullet

Before:
> Responsible for spearheading end-to-end engineering of scalable full-stack applications leveraging AI.

After:
> Designed and built Buzlee, a local events app, from concept to working apps: map discovery, business flyers, human moderation. Owned product, design and technical direction, with AI-assisted development.

Why: verb first, the product named, what shipped, and what Miles owned, without inflating engineering depth. Sources: the Buzlee work's `role` ("Product, Design, Engineering") and SEO description. Confirm with Miles that "AI-assisted development" describes it fairly.

## 11. Alt text

Before:
> Image of a beautiful, stunning mobile app design

After:
> Buzlee's map view on a phone, with event pins across a small town and a flyer card open at the bottom. [check: matches the image]

Why: says what is in the picture for someone who can't see it, with no "image of" and no adjectives. Write alt text from the actual image, never from the case study.

## 12. Article opening

Before (draft, the Ask post):
> Press ⌘K anywhere on this site, or tap Ask in the dock, and ask about my work in plain words. The answer comes only from what is published here, lists the pages it used, and stays under 120 words.

After:
> A portfolio gets read by someone with a few minutes and one question, and the page they land on rarely answers it. So this site has Ask: press ⌘K, ask about my work in plain words, and the answer comes only from what is published here, with the pages it used listed under it.
>
> The hard part was not the answer. It was deciding when Ask should not answer at all. Without a judge, the writing model made that call, and on the Suits & Sandals site it showed the wrong handoff card in 5 of 57 test turns. This post covers the index that keeps Ask current, the judge that now makes that call, and what it cost.

Why: opens on the reader's problem before the feature, states the point and the result by the second paragraph, and previews the sections. Sources: the Ask post draft (the 57-turn measure, 52 right cards before the judge).

## 13. Article section

Before:
> ## How does the Payload integration keep everything up to date automatically?
>
> Payload is an amazing CMS that makes this super easy. Whenever content changes, the index updates seamlessly.

After:
> ## Publishing is the trigger
>
> The index updates when a page is published, and only then. An `afterChange` hook re-embeds a published document; draft saves and autosave are skipped, and an unpublish deletes its rows. Vectors are reused by exact passage text, so fixing an SEO title re-embeds nothing.

Why: a claim heading of four words instead of a question, a first sentence that answers it, and mechanism instead of praise. Sources: the Ask post draft.

## 14. Article ending

Before:
> In summary, Ask uses embeddings, Payload hooks and Jev to deliver a great experience. I hope this was helpful! Let me know what you think in the comments.

After:
> The point is not the commit count. It is that a half-finished thought never blocks the next one.

Why: ends on what the work implies, in two sentences, instead of recapping the sections and asking for engagement. Source: the published post "Fourteen branches, one afternoon".
