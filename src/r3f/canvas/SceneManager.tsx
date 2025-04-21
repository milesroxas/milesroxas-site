'use client'

import { useSceneStore } from '@/r3f/store/useSceneStore'
import SceneHome from '@/r3f/scenes/SceneHome'

export default function SceneManager() {
  const scene = useSceneStore((s) => s.currentScene)
  const trackedRefs = useSceneStore((s) => s.trackedRefs)
  const resource = useSceneStore((s) => s.resource)
  const collection = useSceneStore((s) => s.collection)

  return (
    <>
      {scene === 'home' && resource && collection && (
        <SceneHome trackedRefs={trackedRefs} resource={resource} collection={collection} />
      )}
    </>
  )
}
