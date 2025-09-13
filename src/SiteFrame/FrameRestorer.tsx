// components/FrameRestorer.tsx
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useFrameAnimation } from '@/hooks/useFrameAnimation'

export default function FrameRestorer() {
  const { restoreFrame } = useFrameAnimation()
  const pathname = usePathname()

  useEffect(() => {
    restoreFrame()
  }, [restoreFrame, pathname])

  return null
}
