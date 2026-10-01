# Site chrome

The chrome on every public route: the top bar, the dock and the Ask panel. The approved design is the Paper file "Scratchpad", page
"Chrome — B revised" (frames R1–R4, M1–M4, and the state boards S1–S3).

## Structure

- **Top bar** (`src/components/SiteChrome/TopBar.tsx`): the wordmark (home) at
  the left, Miles's New York time at the right (`Clock.tsx`). No bar and no
  fill. On a page that names itself with `ChromeTitle`, the centre shows
  "Tab › Title" once the page's heading has scrolled under the bar (from `md`).
- **Dock** (`Dock.tsx`, `PageTabs.tsx`): the pages as tabs, always visible,
  with the current one filled, and Ask beside them as its own button. The
  tabs are links in a nav labelled "Site", with `aria-current="page"` on the
  current one. Text tabs in a glass bar from `md`; an icon tab bar on a phone,
  which folds into its current tab while scrolling down.
- **Ask** (`src/features/ask/AskPanel.tsx`): a modal dialog anchored to the
  dock on desktop, a bottom sheet on a phone. ⌘K / Ctrl+K toggles it.
- **Theme toggle** (`ThemeToggle.tsx`): light or dark, in the top bar beside
  the clock. Ink only, no glass: it belongs to the bar's quiet register, and
  the dock stays navigation.

## Sources of truth

- **Tabs**: Home (code-owned, always first) then the Header global's nav rows
  in admin order (`tabs.ts`). A row pointing at `/` folds into Home.
- **Glyphs**: `glyphs.tsx` maps a destination to its mark; the Ask source
  rows use the same map.
- **Ask**: Site Info › Ask › Hide Ask removes the button, the shortcut and
  `/ask`. Site Info › Ask › Suggested questions fills the empty panel.
- **Theme**: `<html data-theme>`, stamped by `InitTheme` during head parsing
  (stored choice, else `prefers-color-scheme`, else light) and written by
  `ThemeProvider` on every toggle. Read it with `useSiteTheme()`; change it
  with `useTheme()`. The chrome's dark material follows either the band it
  floats over or a dark document (`[data-chrome][data-theme="dark"],
  [data-theme="dark"] [data-chrome]` in `globals.css`), and `--chrome-ink`
  needs neither: it reads `--foreground`.
- **Sizes and materials**: the `--chrome-top`, `--dock-*` and `--ask-*`
  tokens and the `[data-chrome]` glass tokens in `globals.css`. Corners use
  the site's radius scale (`--radius` 8px outside, `--radius-md` 6px for rows
  and cards in the Ask panel, `--radius-sm` 4px at the least) and are
  concentric: an inner corner is the outer one less the inset
  (`--dock-item-radius`, `--ask-send-radius`). Controls are regular glass
  (`.chrome-material`); the Ask panel and sheet are thick glass
  (`.chrome-panel`). The footer (`src/Footer/Component.tsx`)
  keeps `--dock-clearance` clear under every page's last line.

## Glass

One material for every floating surface, stated once in `globals.css`
(`.chrome-material` for controls, `.chrome-panel` for the Ask panel and
sheet). It is one layer, lit from above:

- **Body**: one linear gradient, a touch denser at the top, over a backdrop
  blur with a 180% saturation lift. The `background` shorthand clears any
  fill a component brings, so nothing stacks on the glass.
- **Rim**: a 1px stroke in the surface's `::before`, a linear gradient masked
  to the edge (`mask-composite: exclude`). Bright along the top edge, near
  clear down the sides, a softer glow along the bottom. A glass surface must
  be a positioned box for its rim.
- **Hairline and lift**: a half-pixel ink ring and a drop shadow.

The values are the `[data-chrome]` tokens (`--chrome-glass-*`,
`--chrome-rim-*`, `--chrome-frost*`). Legibility comes first: the tint is
dense enough for full-ink labels over photos and text, and the dock turns
dark over dark bands instead of thinning. The gradient stops are registered
`@property` colours, so the light/dark swap and hover cross-fade in 240ms.
Hover moves the glass halfway to solid. Reduce transparency makes it solid
and unfrosted; increase contrast adds an ink border and drops the rim.

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
