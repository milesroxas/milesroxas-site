'use client'

import { useEffect } from 'react'
import { useSitePathname } from '@/hooks/use-site-pathname'
import { hasMemberHint, MEMBER_ATTRIBUTE } from './hint'

/**
 * Keeps `<html data-member>` in step with the hint cookie after every
 * navigation. Signing in or out ends in a client-side redirect, which never
 * re-runs the head script (`MemberHintScript`).
 */
export function MemberHintSync() {
  const pathname = useSitePathname()

  useEffect(() => {
    void pathname
    document.documentElement.toggleAttribute(MEMBER_ATTRIBUTE, hasMemberHint(document.cookie))
  }, [pathname])

  return null
}
