// components/FrameRestorer.tsx
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'

export default function FrameRestorer() {
  const restoreFrame = usePageAnimationStore((s) => s.restoreFrame)
  const pathname = usePathname()

  useEffect(() => {
    restoreFrame()
  }, [restoreFrame, pathname])

  return null
}
