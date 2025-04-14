'use client'

import dynamic from 'next/dynamic'

// Dynamically import ThreeCanvas with no SSR
const DynamicThreeCanvas = dynamic(
  () => import('@/providers/ThreeCanvas').then((mod) => mod.ThreeCanvas),
  { ssr: false },
)

// Export the threeTunnel for use in client components
export { threeTunnel } from '@/providers/ThreeCanvas'

export default DynamicThreeCanvas
