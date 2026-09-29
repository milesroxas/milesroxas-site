/**
 * The scroll edge under the top bar or the dock: a fade of the band's own
 * ground, so content dims as it passes beneath the chrome instead of
 * colliding with it, with no divider line. It shows once the page has
 * scrolled, and takes its theme from the chrome it sits under, so the fade
 * and the words over it always agree about the band.
 */
export function ScrollEdge({ side, dark }: { side: 'top' | 'bottom'; dark: boolean }) {
  return (
    <div
      aria-hidden
      className="scroll-edge"
      data-chrome=""
      data-side={side}
      data-theme={dark ? 'dark' : undefined}
    />
  )
}
