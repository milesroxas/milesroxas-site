'use client'

import { useSceneStore } from '@/r3f/store/useSceneStore'
import SceneHome from '@/r3f/scenes/SceneHome'

export default function SceneManager() {
  const scene = useSceneStore((s) => s.currentScene)
  const trackedRefs = useSceneStore((s) => s.trackedRefs)

  return <>{scene === 'home' && <SceneHome trackedRefs={trackedRefs} />}</>
}
