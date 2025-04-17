import { create } from 'zustand'

type SceneState = {
  currentScene: 'home' | 'about'
  setScene: (scene: SceneState['currentScene']) => void
  trackedRefs?: any
  setTrackedRefs: (refs: any) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: 'home',
  setScene: (scene) => set({ currentScene: scene }),
  trackedRefs: undefined,
  setTrackedRefs: (refs) => set({ trackedRefs: refs }),
}))
