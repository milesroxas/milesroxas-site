'use client'

import { useSceneStore } from '@/r3f/store/useSceneStore'
import SceneHome from '@/r3f/scenes/SceneHome'

export default function SceneManager() {
  const scene = useSceneStore((s) => s.currentScene)
  const trackedRefs = useSceneStore((s) => s.trackedRefs)
  const resources = useSceneStore((s) => s.resources)
  const collections = useSceneStore((s) => s.collections)

  return (
    <>
      {scene === 'home' && resources && collections && (
        <SceneHome trackedRefs={trackedRefs} resources={resources} collections={collections} />
      )}
    </>
  )
}
