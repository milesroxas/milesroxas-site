import { create } from 'zustand'

type SceneState = {
  currentScene: 'home' | 'about' | undefined
  setScene: (scene: SceneState['currentScene']) => void
  trackedRefs?: any
  setTrackedRefs: (refs: any) => void
  resource?: { url: string; variant: 'original' | 'wide' | 'portrait' }
  setResource: (resource: { url: string; variant: 'original' | 'wide' | 'portrait' }) => void
  collection?: { variant: 'post' | 'work' }
  setCollection: (collection: { variant: 'post' | 'work' }) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: 'home',
  setScene: (scene) => set({ currentScene: scene }),
  trackedRefs: [],
  setTrackedRefs: (refs) => set({ trackedRefs: refs }),
  resource: undefined,
  setResource: (resource) => set({ resource }),
  collection: undefined,
  setCollection: (collection) => set({ collection }),
}))
