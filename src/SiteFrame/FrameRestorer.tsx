// components/FrameRestorer.tsx
'use client'
import { useEffect } from 'react'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'

export default function FrameRestorer() {
  const restoreFrame = usePageAnimationStore((s) => s.restoreFrame)

  useEffect(() => {
    restoreFrame()
  }, [restoreFrame])

  return null
}
