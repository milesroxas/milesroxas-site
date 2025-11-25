'use client'

import React, { useState, useEffect } from 'react'
import { useWorkPasswordStore } from '@/stores/workPasswordStore'
import { PasswordPrompt } from './PasswordPrompt'
import type { Work } from '@/payload-types'
import { useSiteFrameStore } from '@/stores/siteframeStore'
import gsap from 'gsap'

interface PasswordProtectedWorkWrapperProps {
  work: Work
  children: React.ReactNode
}

export const PasswordProtectedWorkWrapper: React.FC<PasswordProtectedWorkWrapperProps> = ({
  work,
  children,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const isWorkUnlocked = useWorkPasswordStore((state) => state.isWorkUnlocked)
  const { setIsSiteFrameVisible, setTransitionPhase } = useSiteFrameStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && work.id) {
      setIsUnlocked(isWorkUnlocked(work.id))
    }
  }, [isClient, work.id, isWorkUnlocked])

  // Clean up transition clone if password is required
  useEffect(() => {
    if (isClient && work.isPasswordProtected && !isUnlocked) {
      const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
      if (clone) {
        // Fade out and remove the clone
        gsap.to(clone, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            clone.remove()
            window.__PAGE_TRANSITION_CLONE = undefined
          },
        })
      }

      // Restore site frame
      setIsSiteFrameVisible(true)
      setTransitionPhase('complete')
    }
  }, [isClient, work.isPasswordProtected, isUnlocked, setIsSiteFrameVisible, setTransitionPhase])

  // If work is not password protected, render children directly
  if (!work.isPasswordProtected) {
    return <>{children}</>
  }

  // Wait for client-side hydration to avoid mismatch
  // Show password prompt during SSR to avoid blank page
  if (!isClient) {
    return <PasswordPrompt workId={work.id} onUnlock={() => setIsUnlocked(true)} />
  }

  // If password protected and not unlocked, show password prompt
  if (!isUnlocked) {
    return <PasswordPrompt workId={work.id} onUnlock={() => setIsUnlocked(true)} />
  }

  // Password verified, show content
  return <>{children}</>
}
