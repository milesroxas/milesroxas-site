# Site chrome

The chrome on every public route: the top bar, the dock, the scroll edges and
the Ask panel. The approved design is the Paper file "Scratchpad", page
"Chrome — B revised" (frames R1–R4, M1–M4, and the state boards S1–S3).

## Structure

- **Top bar** (`src/components/SiteChrome/TopBar.tsx`): the wordmark (home) at
  the left, Miles's New York time at the right (`Clock.tsx`). No bar and no
  fill. On a page that names itself with `ChromeTitle`, the centre shows
  "Tab › Title" once the page's heading has scrolled under the bar (from `md`).
- **Dock** (`Dock.tsx`, `PageTabs.tsx`): the pages as tabs, always visible,
  with the current one filled, and Ask beside them as its own button. The
  tabs are links in a nav labelled "Site", with `aria-current="page"` on the
  current one. Text tabs in a capsule from `md`; an icon tab bar on a phone,
  which folds into its current tab while scrolling down.
- **Scroll edges** (`ScrollEdge.tsx`): a fade of the band's own ground under
  each end of the chrome, shown once the page has scrolled.
- **Ask** (`src/features/ask/AskPanel.tsx`): a modal dialog anchored to the
  dock on desktop, a bottom sheet on a phone. ⌘K / Ctrl+K toggles it.

## Sources of truth

- **Tabs**: Home (code-owned, always first) then the Header global's nav rows
  in admin order (`tabs.ts`). A row pointing at `/` folds into Home.
- **Glyphs**: `glyphs.tsx` maps a destination to its mark; the Ask source
  rows use the same map.
- **Ask**: Site Info › Ask › Hide Ask removes the button, the shortcut and
  `/ask`. Site Info › Ask › Suggested questions fills the empty panel.
- **Sizes and materials**: the `--chrome-top`, `--dock-height`,
  `--dock-bottom` and `--dock-clearance` tokens and the `[data-chrome]`
  material tokens in `globals.css`. The footer (`src/Footer/Component.tsx`)
  keeps `--dock-clearance` clear under every page's last line.

## Dark bands

Every floating piece samples the band under it with `useOverDarkBand`
(`.band-dark` or anything `data-theme="dark"`) and swaps to its dark material.
Chrome marks itself `data-chrome` so it never counts as a band. The Contents
button uses the same hook.

## Motion

- The current tab's fill is one layer clipped to the current tab; a new page
  slides the clip on `--ease-spring` (damping 1, response 0.35s).
- Ask widens out of its button into the field (Web Animations API, clip-path),
  the tabs step back (fade, 0.96, 8px blur), the panel rises out of the
  field's top edge. Closing plays the same path back. Keyboard opens and
  Escape closes skip the morph.
- Reduced motion turns every move into a cross-fade. Reduced transparency makes
  the glass solid with a hairline; increased contrast adds an ink border and
  inverts the current tab.

## Page transitions

The card → detail page FLIP (`src/hooks/useCardTransition.ts`) hides the
chrome (`useChromeStore.setVisible(false)`) as its clone fills the screen.
The destination brings it back: `HighImpact` at 70% of the clone's landing,
`PostHero` and the work and post page clients through `restoreChrome()`. A
page that never does gets it back after two seconds (`SiteChromeClient`).
`transitionPhase` in the same store tracks the clone for the heroes.
