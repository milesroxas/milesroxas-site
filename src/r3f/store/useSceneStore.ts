import { create } from 'zustand'

type SceneState = {
  currentScene: 'home' | 'about' | undefined
  setScene: (scene: SceneState['currentScene']) => void
  trackedRefs?: any
  setTrackedRefs: (refs: any) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: 'home',
  setScene: (scene) => set({ currentScene: scene }),
  trackedRefs: [],
  setTrackedRefs: (refs) => set({ trackedRefs: refs }),
}))
