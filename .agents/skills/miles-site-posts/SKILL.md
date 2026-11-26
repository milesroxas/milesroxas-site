---
name: miles-site-posts
description: Block structure, media sizing, video and publish rules for posts on milesroxas.com via the milesroxas-cms MCP. Use before creating, editing or publishing any `posts` document. Copy comes from miles-brand-content.
---

# Posts on milesroxas.com

A post is a long-form article that is highly visual: it reads as one flow, with media between paragraphs. Each rule below fixes a post that once went live wrong.

## Flow

1. **Copy:** draft it as Markdown with one `##` per section, using miles-brand-content, miles-writing-style and emil-unslop-writing. Lint it: `node .agents/skills/miles-brand-content/scripts/check-voice.mjs --kind article --target cms <file>`. Fix every error.
2. **Media:** render the videos, upload them, and note the ids (see Media).
3. **Fields:** run `describeFields` for `posts` and for every block type you use, because shapes change.
4. **Save:** `createDocument` with `draft: true`. Then run `outlineDocument` and check the result against Verify.
5. **Publish:** only when Miles asks in this conversation. Send the last write with `draft: false`, and send every other write with `draft: true`.

## Shape

```
hero: { type: editorial, richText: h1 = title, visualType: streakField,
        shader: { studio: 5, seed: <new>, surface: dark } }
showContents: true · authors: [2] · source: internal · visibility: public
meta: { title ≤45 chars (site appends " | Miles Roxas"), description 100–155 chars, third person }
layout: one section per ##
  section { customize: true, stack: "tight", blockName }
    richText { markdown: "## Title\n\nPara…" }   ← heading lives here
    caption  { media: <id>, size: <Media table> }
    richText { markdown: "Para…" }              ← no heading; continues the section
```

- **Never a `richTransition` (Standard heading) block in a prose section.** Standard headings pair with layout blocks such as Split narrow. In an article they break the reading flow. The section title is `##` (h2) inside the Rich text, because the post title is the h1.
- **Always `customize: true, stack: "tight"` on every section.** The default stack is sized for landing pages, and it opens big gaps between a paragraph and its media.
- **Media goes right after the paragraph it illustrates.** End the Rich text there, add the caption, then continue in a new Rich text block with no heading.

## Media

Choose the caption `size` by the media's shape. Never leave it at `contained`: that fills the column, so a square video ends up about 1,300px tall and only part of it ever fits on screen.

```
Square or portrait? → small (448px)
Landscape?          → inset (768px)
full                → only when Miles asks
```

- **Silent loop:**
  - Upload with `pnpm cms:upload <file.mp4> --loop --alt "<what it shows>"`. Its last output line is the Media id.
  - In the caption block, set `media: <id>` and `playVideo: false`.
- **Video with sound, played on click:**
  - Upload with `pnpm cms:upload <file.mp4> --title "<name>"`. It goes into the Videos collection.
  - In the caption block, set `playVideo: true` and `video: <id>`.
- **Making the video:**
  - Use OpenFilm with the rules from emil-package-my-work. Keep projects in `~/SITES/openfilm/<name>/`.
  - Match `skills-walkthrough-x`: black ground, SF Pro Text and SF Mono.
  - Render at 1080×1080 CSS ×2, 60fps, crf 14, with no audio. The last frame matches the first, so the loop is seamless.
- **Video text:** at least 44px in the 1080px design. `small` shows the video at 448px, so 44px lands at about 18px on screen.
- **Video copy:** real strings only. Brief each video agent with the exact copy it may use, because an agent fills any gap with made-up numbers.

## Feature tabs

- **Every tab needs a visual.** The panel is a fixed 16:9 frame, so a tab with nothing in it shows an empty box. Use `media`, or set `visualType: "streakField"` with `shader: { studio: 5, seed: <new> }`.
- **A tab's `caption` is the card over its visual.**
  - `showCallout` is a virtual gate: it reads `true` whenever `caption` has text.
  - Write a caption only when you want that card.
- **Other gates work the same way.** `showList`, `showBody`, `showEyebrow` and `showCaptionOverride` all read `true` whenever their field has content.
  - To hide something, leave its field empty.
  - Sending the gate as `false` clears the stored content.

## Editing a live post

- **`patchBlock`:** send only the fields you change. Patching a section's `customize` or `stack` keeps the blocks inside it.
- **Replacing Rich text:** send `markdown` with `replace: true`.
- **`insertBlock`:** add `parentId` (the section id), plus `index` to place the block among its siblings.
- **Ambiguous instruction:** ask before publishing. "Set it again" once meant the earlier size, and the guess cost another publish.

## Verify

Check this before reporting:

- `outlineDocument` shows no `richTransition` in any prose section.
- Every section reads `stack: "tight"`.
- Every caption has a `size` from the Media table.
- Every tab has a visual.
- Your report includes the admin link `https://www.milesroxas.com/admin/collections/posts/<id>`, plus the public URL once published.
- Your report says whether you looked at the rendered page.
