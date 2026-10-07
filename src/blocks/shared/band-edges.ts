import type { BandTheme } from '@/blocks/shared/band-theme'

/**
 * Where the surface changes in a run of top-level bands, as the
 * `data-band-edge` value for each band (`undefined` where neither side
 * changes). The page surface stands before the first band and after the last.
 *
 * globals.css reads it twice: a painted band adds its edge inset there, and a
 * section heading keeps its bottom step there instead of running into a block
 * on another surface.
 */
export const bandEdges = (surfaces: readonly (BandTheme | null | undefined)[]) => {
  const resolved = surfaces.map((surface) => surface || 'default')
  return resolved.map((surface, index) => {
    const edges = [
      surface !== (resolved[index - 1] ?? 'default') && 'top',
      surface !== (resolved[index + 1] ?? 'default') && 'bottom',
    ].filter(Boolean)
    return edges.length ? edges.join(' ') : undefined
  })
}
