import { create } from 'zustand'

interface SiteFrameState {
  isSiteFrameVisible: boolean
  setIsSiteFrameVisible: (isVisible: boolean) => void
  isTransitioning: boolean
  setIsTransitioning: (isTransitioning: boolean) => void
  transitionPhase: 'initial' | 'clone-animating' | 'frame-ready' | 'frame-animating' | 'complete'
  setTransitionPhase: (phase: SiteFrameState['transitionPhase']) => void
}

export const useSiteFrameStore = create<SiteFrameState>((set) => ({
  isSiteFrameVisible: true,
  setIsSiteFrameVisible: (isVisible) => set({ isSiteFrameVisible: isVisible }),
  isTransitioning: false,
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
  transitionPhase: 'initial',
  setTransitionPhase: (phase) => set({ transitionPhase: phase }),
}))
