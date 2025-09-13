import { create } from 'zustand'

export type TransitionPhase = 'idle' | 'preparing' | 'animating' | 'complete'

interface TransitionState {
  phase: TransitionPhase
  isPageReady: boolean
  currentRoute: string
  previousRoute: string | null
  setPhase: (phase: TransitionPhase) => void
  setRoutes: (current: string, previous: string | null) => void
  setPageReady: (ready: boolean) => void
}

export const useTransitionStore = create<TransitionState>((set) => ({
  phase: 'idle',
  isPageReady: true,
  currentRoute: '',
  previousRoute: null,
  setPhase: (phase) => set({ phase }),
  setRoutes: (current, previous) => set({ currentRoute: current, previousRoute: previous }),
  setPageReady: (ready) => set({ isPageReady: ready }),
}))

