# Project context

This is an Elyx design project. `.elyx` files contain the designs, and
`elyx.json` contains project settings.

## About this project

Design source for milesroxas.com, Miles Roxas's portfolio site. The site is a
Next.js and Payload CMS app in the parent directory; these files mirror its
CMS layout blocks so pages can be composed and reviewed as designs.

Start with `screens/design-systems-for-organizational-scale.elyx`: a work
page top to bottom at 1440px, as main renders it. The opening (Work hero,
intro statement) comes first, then the work's Section blocks, then More work.
`screens/work-opening.elyx` is the first viewport of a work page (1440 by 900)
with the site chrome over it.

## Structure

- `tokens/colors.elyx`: the light palette, from `palette-light` in
  `../src/app/(frontend)/globals.css`. `tokens/colors-dark.elyx` derives the
  dark palette under `theme=dark`.
- `tokens/lengths.elyx`: the 1440px page, the 8-column composition grid
  (128px columns, 32px gap, 96px gutter) and the band spacing steps.
- `controls/`: text styles (`type.elyx`), the media placeholder, button,
  carousel arrow, pill, form field and the site chrome (top bar and dock).
- `blocks/`: one exported component per CMS block, grouped by the blocks
  drawer's groups. Each source names the React file it mirrors.
- `resources/fonts/`: IBM Plex Sans and Geist Mono, loaded by `controls/type.elyx`.
- `resources/icons/`: the SVGs the site draws (the Logo, Tabler icons, the
  chrome's Ask mark), imported as `icon` layers and tinted by `fill`. Tabler
  path data is in `../node_modules/@tabler/icons-react/dist/esm/icons/`.
- `blocks/opening.elyx`: the work page opening (`workHero` with its
  `workHeroFact`, and `workIntro`, one statement on five columns). `blocks/more-work.elyx`: More work
  (`moreWork`, `moreWorkRow`, `moreWorkRowActive`), the close of every work
  page. `blocks/works-index.elyx`: the /works dial (`workDial`). These are
  page sections, not CMS layout blocks.
- `blocks/home.elyx`: the Home hero (`homeHero`), a page section like the
  work opening. `blocks/statements.elyx` holds the Callout (`callout`).
- `blocks/legacy.elyx` also holds `contentWorks`: Columns as Home arranges it
  (section heading over two work cards), with an Inverted variant.
- `controls/chrome.elyx`: `topBarOnPage` and `dockOnPage` are the chrome over
  the page's own ground, using the theme-following `page-*` tokens.
  `dockOnPage` has Work current (/works), `dockOnPageHome` Home current, and
  `dockOnPageSection` outlines Work for a page under it (a case study). The
  dock's tabs are Home plus the Header global's items (Work, Posts, Contact).
- `screens/`: one file per screen, composed from blocks and chrome.
  `screens/home.elyx` is the home page with its published content.
  `screens/design-systems-for-organizational-scale.elyx` is the NextStreet
  work page with its published production content. `screens/works.elyx` is
  /works on load.
  `screens/section-headings.elyx` is the specimen sheet for the two Section
  heading blocks: every variant their Payload settings produce, labelled.
- `exploration/`: proposal sheets, not screens as built. `works-summary.elyx`
  draws two homes for a work's summary on the /works dial (A under the active
  title, B under the plate caption), each a 1440 by 900 board with a note.
  `home-redesign.elyx` draws three homes top to bottom at 1440px (A Ledger,
  B Plate, C Dossier) beside the rules they share; its sheet parts sit off
  the sheet to the right. Render one board with
  `--ref homeRedesign.boards.optionA.boardA`.
- `flows/`: empty so far.

## Conventions

- A block's symbol is its CMS slug (`mediaContentSplit`, `featureTabs`).
- Blocks are 1440px wide bands. Place content on the grid with the `span-*`
  length tokens; never restate column widths.
- Text layers instance a style from `controls/type.elyx` and override
  `contents`, `width` and colour only. A block's `heading` role at Small text
  is `blockHeading` (24px, one rung over its copy); `heading` (30px) is the
  same role at Large text, plus figure titles, More work rows and tab labels.
  Figure titles are `blockHeading` too, over the drawing's left edge, with
  a chart's legend at the end of the title line. Section heading blocks use
  `title`. A text layer that needs `subrange`
  must be a plain `text`, because instances drop it.
- Media is always an instance of `controls/media.elyx` sized to the block's
  aspect ratio. The `media` colour token is design-only.
- A carousel deck (Carousel, Carousel split, Carousel tabs) has one caption
  line under the deck, outside the slides, showing the active slide's
  caption. Carousel and Carousel split draw it as a wrapped line in the
  block's row; give the row's children fixed widths (a `%` width shrinks in
  a wrapping row) and hide the caption when no slide has one.
- `blocks/figures.elyx`: `chart` is a standing bar chart (one series, no
  key); `chartHorizontalGrouped` shows its lying plot, legend and bottom
  axis name instead. A reference series draws in `muted-foreground`.
- Each block's base is the block with its CMS defaults, in its resting state.
  Every other setting is an exported `@variant` of the base, named
  `<slug><Setting>` (`richTransitionSplitLarge`). Not every setting has its
  variant drawn yet.
- Variants toggle optional parts with `display: .none`, never by removing
  layers, so base and variants keep one structure.
- A specimen screen varies one setting per group, because CMS settings are
  independent. Label each specimen with the setting it changes.
- The Home and Work heroes sit on the page ground, so chrome over them is
  `topBarOnPage` and `dockOnPage`. `topBar` and `dock` are the chrome over a
  dark hero (High Impact, on Pages) and use the `hero-*` and `chrome-*` colour
  tokens, which do not change with the theme.
- Elyx cannot trim text boxes, so where the site uses `text-stack` (cap
  height to baseline) the gaps are drawn tighter than the CSS values to match
  what the eye sees. Where the site uses `text-wrap: balance`, a fixed text
  width forces the balanced break.
- Rich text and captions render through Tailwind Typography, so their ink is
  `prose-body` and `prose-heading`, not `foreground`.
- Inside a Section, a section heading sits half the stack step above the
  block after it (96px on Default stacking, 192px on Loose), so screens group
  the heading with that block in an `...Opening` frame. A section heading in
  its own band has no bottom padding. A painted Section (Neutral, Inverted,
  Brand) adds 96px inside itself where the surface changes.
- Copy follows the site's house style: plain and specific, never an em dash.

## Working in this project

- Follow the patterns in existing `.elyx` files.
- Preserve the project's established design language and conventions.
- Keep this file current as the project evolves.
