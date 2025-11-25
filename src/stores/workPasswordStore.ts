import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorkPasswordState {
  unlockedWorks: Set<number>
  unlockWork: (workId: number) => void
  isWorkUnlocked: (workId: number) => boolean
  clearUnlockedWorks: () => void
}

export const useWorkPasswordStore = create<WorkPasswordState>()(
  persist(
    (set, get) => ({
      unlockedWorks: new Set<number>(),

      unlockWork: (workId: number) =>
        set((state) => ({
          unlockedWorks: new Set(state.unlockedWorks).add(workId),
        })),

      isWorkUnlocked: (workId: number) => get().unlockedWorks.has(workId),

      clearUnlockedWorks: () => set({ unlockedWorks: new Set<number>() }),
    }),
    {
      name: 'work-password-storage',
      storage: {
        getItem: (name) => {
          // Check if we're in the browser
          if (typeof window === 'undefined') return null

          const str = sessionStorage.getItem(name)
          if (!str) return null

          const { state } = JSON.parse(str)
          return {
            state: {
              ...state,
              unlockedWorks: new Set(state.unlockedWorks || []),
            },
          }
        },
        setItem: (name, value) => {
          // Check if we're in the browser
          if (typeof window === 'undefined') return

          const str = JSON.stringify({
            state: {
              ...value.state,
              unlockedWorks: Array.from(value.state.unlockedWorks),
            },
          })
          sessionStorage.setItem(name, str)
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          sessionStorage.removeItem(name)
        },
      },
    },
  ),
)
