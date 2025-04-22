'use client'

import { useEffect } from 'react'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import type { SceneTrackRefs } from '@/r3f/types/r3f'

export default function SceneSetter({
  scene,
  trackedRefs,
}: {
  scene: 'home' | 'about'
  trackedRefs: SceneTrackRefs
  image?: string
}) {
  const setScene = useSceneStore((s) => s.setScene)
  const setTrackedRefs = useSceneStore((s) => s.setTrackedRefs)

  useEffect(() => {
    setScene(scene)
    setTrackedRefs(trackedRefs)
    return () => {
      setScene(undefined)
    }
  }, [scene, trackedRefs, setScene, setTrackedRefs])

  return null
}
