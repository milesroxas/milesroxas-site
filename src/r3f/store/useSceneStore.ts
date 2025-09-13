import { create } from 'zustand'
import type { SceneTrackRefs } from '@/r3f/types/r3f'

type SceneState = {
  currentScene: 'home' | 'about' | undefined
  setScene: (scene: SceneState['currentScene']) => void
  trackedRefs?: SceneTrackRefs
  setTrackedRefs: (refs: SceneTrackRefs) => void
  resources?: { url: string; variant: 'wide' | 'portrait' | 'square' }[]
  setResources: (resources: { url: string; variant: 'wide' | 'portrait' | 'square' }[]) => void
  collections?: { variant: 'post' | 'work' }[]
  setCollections: (collections: { variant: 'post' | 'work' }[]) => void
  hoveredIndex: number | null
  setHoveredIndex: (i: number | null) => void
  mouseUV: [number, number]
  setMouseUV: (uv: [number, number]) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: 'home',
  setScene: (scene) => set({ currentScene: scene }),
  trackedRefs: [],
  setTrackedRefs: (refs) => set({ trackedRefs: refs }),
  resources: undefined,
  setResources: (resources) => set({ resources }),
  collections: undefined,
  setCollections: (collections) => set({ collections }),
  hoveredIndex: null,
  setHoveredIndex: (i) => set({ hoveredIndex: i }),
  mouseUV: [0.5, 0.5],
  setMouseUV: (uv) => set({ mouseUV: uv }),
}))
