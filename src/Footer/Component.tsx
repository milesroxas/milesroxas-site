/**
 * The page's foot: room for the floating dock. The last line of every page
 * stops this far above the viewport's bottom edge, so it never ends under
 * the dock (globals.css, `--foot-height`).
 */
export function Footer() {
  return <footer aria-hidden className="h-(--foot-height) shrink-0" />
}
