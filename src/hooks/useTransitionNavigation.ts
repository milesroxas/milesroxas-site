'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to handle navigation transitions using the onNavigate prop from Next.js 15.3+
 */
export function useTransitionNavigation() {
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const navigate = (href: string) => {
    setIsNavigating(true)
    setTimeout(() => {
      router.push(href)
    }, 300)
  }

  return { isNavigating, navigate }
}

export default useTransitionNavigation
