'use client'

import dynamic from 'next/dynamic'

/**
 * The code surface in its own chunk. `next/dynamic` from the block's server
 * component still bundled the highlighter and its grammars into every
 * page's client entry; the split has to happen on the client side of the
 * boundary, as `lazy-chart.tsx` does for the chart library.
 */
export const CodeSurface = dynamic(() =>
  import('@/components/ui/code-block').then((module) => module.CodeBlock),
)
