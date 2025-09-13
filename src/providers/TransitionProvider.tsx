'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useTransitionStore } from '@/stores/transitionStore'

type TransitionContextType = {
  isReducedMotion: boolean
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined)

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const prevPathRef = useRef<string>('')
  const setRoutes = useTransitionStore((s) => s.setRoutes)
  const setPhase = useTransitionStore((s) => s.setPhase)

  const isReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const previous = prevPathRef.current || null
    setRoutes(pathname || '', previous)
    prevPathRef.current = pathname || ''
    setPhase('idle')
  }, [pathname, setRoutes, setPhase])

  const value = useMemo(() => ({ isReducedMotion }), [isReducedMotion])

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>
}

export const useTransitionContext = () => {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransitionContext must be used within TransitionProvider')
  return ctx
}

