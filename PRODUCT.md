# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and in-house hiring teams evaluating Miles Roxas for a senior role (creative director, design engineer, product/brand design lead). They arrive with limited time, skim the work to judge fit, and decide whether to reach out.

## Product Purpose

Personal portfolio for Miles Roxas. It presents selected case studies (Works) and writing (Posts), and lets visitors ask grounded questions about the work. Success means a hiring team quickly understands his range and depth and makes contact.

## Positioning

Open decision: the one-line claim a neighboring portfolio could not copy has not been confirmed. Current homepage copy leads with "16 years leading design teams and partnering with companies to launch brand identities and ship digital experiences", framed across Strategy, Design and Development.

## Operating Context

- Visitors browse on desktop and mobile, usually from a link in an application, message, or profile.
- Destinations: Work (case studies), Posts, Contact, and Ask.
- Ask is a grounded Q&A over site content. The owner wants it treated as a core control in the site chrome, not a secondary menu item.

## Capabilities and Constraints

- Next.js 16 App Router + Payload CMS 3; content is authored in Payload.
- Works pages are composed from Sections (composer). Work cards transition into their case study with a GSAP Flip.
- Ask exists as a feature (composer phase 5); it answers from site content only.
- Site-wide chrome today: SiteFrame (viewport frame + bottom bar), a MENU pill that opens a full-screen overlay, a custom cursor, and Lenis smooth scrolling. Only the items listed under Brand Commitments are binding; the rest may be replaced.

## Brand Commitments

- The MILES ▲ ROXAS geometric wordmark (`src/components/Logo/Logo.tsx`) stays as drawn.
- A live New York local-time clock stays somewhere in the chrome.

## Evidence on Hand

- 8 published Works and 4 published Posts in Payload, with hero media (Vercel Blob + Cloudflare Images/Stream).
- Homepage: hero video (`public/media/home-hero.mp4`), Overview callout, and Strategy / Design / Development bands with six featured works.
- No testimonials, client logos, or metrics are recorded. Do not invent them.

## Product Principles

- The work carries the pitch; chrome must help a busy reviewer move through it, never compete with it.
- Asking a question should be as direct as navigating: Ask is a first-class way to find things.
- Reaching Miles should always be one step away.
