// components/FrameRestorer.tsx
'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'

export default function FrameRestorer() {
  const restoreFrame = usePageAnimationStore((s) => s.restoreFrame)
  const _pathname = usePathname()

  useEffect(() => {
    restoreFrame()
  }, [restoreFrame])

  return null
}
