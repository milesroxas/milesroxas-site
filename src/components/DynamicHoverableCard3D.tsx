'use client'

import dynamic from 'next/dynamic'
import type { AspectRatio } from '@/hooks/useImageCropMaterial'

// Define the props type to use with the dynamic component
export type HoverableCard3DProps = {
  imageUrl: string
  aspectRatio?: AspectRatio
  coverMode?: number
  brightness?: number
  baseSize?: number
  position?: [number, number, number]
  onClick?: (event?: any) => void
}

// Dynamically import HoverableCard3D with no SSR
const DynamicHoverableCard3D = dynamic(() => import('@/components/HoverableCard3D'), {
  ssr: false,
  loading: () => null, // Don't show a loading state
})

export default DynamicHoverableCard3D
