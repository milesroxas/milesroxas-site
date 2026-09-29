/**
 * The page's foot: room for the floating dock. The last line of every page
 * stops this far above the viewport's bottom edge, so it never ends under
 * the dock (globals.css, `--dock-clearance`).
 */
export function Footer() {
  return <footer aria-hidden className="h-[calc(var(--dock-clearance)+1.5rem)] shrink-0" />
}
