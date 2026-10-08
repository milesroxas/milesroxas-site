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
  current one. On a page under a tab (a case study under Work) that tab is
  outlined instead of filled, with `aria-current="true"`: the visitor is inside
  its section, and the tab keeps its hover and press as the way back to the
  index. A press fills it at once. Text tabs in a glass bar from `md`; an icon tab bar on a phone,
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
sheet). It is one quiet layer, and the frost is the whole effect:

- **Body**: one flat tint over a backdrop blur with a light (140%)
  saturation lift. The `background` shorthand clears any fill a component
  brings, so nothing stacks on the glass. No gradient, rim or sheen.
- **Hairline and lift**: a 1px ring at 8% ink (white in dark) and one soft
  drop shadow. In the dark material the surface sits one step above the
  page's near-black, so it reads by its tint and hairline, not a highlight.

The values are the `[data-chrome]` tokens (`--chrome-glass`,
`--chrome-glass-thick`, `--chrome-frost*`, `--chrome-hairline`,
`--chrome-lift*`). Legibility comes first: the tint is dense enough for
full-ink labels over photos and text, and the dock turns dark over dark bands
instead of thinning. The tint is a registered `@property` colour
(`--glass-tint`), so the light/dark swap and hover cross-fade in 240ms. Hover
moves the glass halfway to solid. Reduce transparency makes it solid and
unfrosted; increase contrast adds an ink border.

## Bands under the chrome

Every floating piece samples the band under it with `useBandGround`
(`src/components/SiteChrome/use-band-ground.ts`): any ground scope (a hero, an
inverted Section, the always-dark panel, a pinned visual), its polarity read
from the stylesheet (`readGround`, `src/utilities/ground.ts`). The piece wears
that polarity as `data-theme`, so it takes its dark material over a dark band
and its light glass over a light one, including an inverted band on a dark
visit. Over the page itself it stamps nothing and follows the visitor's theme.
Chrome marks itself `data-chrome` so it never counts as a band. The Contents
button uses the same hook.

## Motion

- On a full page load the top bar is the first thing on screen: it fades in
  on the settle curve from 0ms. The dock comes last, fading while it settles
  up 0.5rem on the press release curve and locks into place. Every page cues
  the dock with `--chrome-dock-at` on `body` (920ms); the homepage cues it at
  1120ms, the last of its 320ms beats (`HomeHero`'s `BEAT`). Client
  navigations never replay it.
- The current tab's fill is one layer clipped to the current tab; a new page
  slides the clip on `--ease-spring` (damping 1, response 0.35s). Going a
  level down, the fill cross-fades into a 1px outline on the same clip
  (240ms); going back up, it fills again.
- Ask widens out of its button into the field (Web Animations API, clip-path),
  the tabs step back (fade, 0.96, 8px blur), the panel rises out of the
  field's top edge. The field carries a copy of the button's label (its
  seed, `.ask-seed`), placed on the button: opening, the label blurs out as
  the field's contents sharpen in; closing, the field closes onto the label
  as it sharpens back in and lands as the button, so the hand-back to the
  dock is invisible. Keyboard opens and Escape closes skip the morph.
- The scrim dims: foreground at 20% in light, black at 50% in dark.
- Reduced motion turns every move into a cross-fade. Reduced transparency makes
  the glass solid with a hairline; increased contrast adds an ink border and
  inverts the current tab and draws the section outline in ink.

## Page transitions

A work card opens its case study in three beats. The card's picture and the
`WorkHero` frame share a `<ViewTransition>` name
(`src/heros/WorkHero/morph.ts`).

1. Exit. The click starts the navigation and, while the case study loads,
   the page fades away around the picture
   (`src/heros/WorkHero/pageExit.ts`). Headings, copy, pictures and badges
   fade and blur out in place, the farthest first, so the page clears in
   toward the picture (280ms each, 180ms spread). The picture, top bar and
   dock stay. If the page arrives before the exit ends, the old page's fade
   finishes it over the time the exit had left.
2. Handoff. The picture leaves last, starting as the nearest pieces finish:
   it scales down to 95%, softens and fades where it stands (360ms, one
   ease-in-out). After an 80ms beat the hero's picture comes into focus at
   the hero frame: it sharpens and fades in over 520ms while it scales up
   from 94% over a longer 900ms, so it settles instead of popping. The
   picture never travels: the transition group holds the card's box
   (`step-end`) until the swap, then takes the hero's. On a slow page the
   picture waits alone until the case study arrives. Durations live in
   `globals.css`; `morph.ts` only moves the start times.
3. Entrance. The hero's copy starts its load-in 120ms after the hero's
   picture: every `hero-*` animation waits `--morph-hold`, which the card's
   `onShare` callback sets on the hero's parent. The body after the hero
   (`[data-slot="work-body"]`) rises in after it.

Only the clicked card takes the name, so related-works cards on the next page
never pair. The top bar and dock take their own transition names for the
duration, so they stay put above the handoff (`.work-morph` and `work-open`
rules in `globals.css`). Reduced motion skips the exit and the scale: the link
navigates at once, the card's picture fades out and the hero's fades in. A
modified click (new tab) leaves the page as it is.

A post card opens its post behind a curtain
(`src/features/page-transition/curtain.ts`). The page leaves under a mask: a
curtain of the page's ground drops from the top edge (800ms) under the top
bar and dock, which stay. The post loads behind it, and the curtain lifts
top-down (1000ms, both on one ease-in-out) only once the post is complete on screen
(`page-ready.ts`): fonts loaded, pictures decoded, videos holding a frame,
and every effect drawing live with its poster faded out. A slot whose poster
is about to give way publishes `data-visual-pending` (`useLiveVisual`); one
that stays a poster (reduced motion, touch, paused motion) never does. The
click starts the post's route prefetch and its effect runtime download
(`preloadVisualRuntime`), so both land inside the wait. Held, the page's CSS
animations pause (`data-page-held`), so the hero's load-in plays as the
curtain lifts. The wait gives up after 4 seconds, the navigation after 10.
Reduced motion fades the curtain. A modified click (new tab) leaves the page
as it is.
