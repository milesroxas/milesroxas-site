'use client'

import clarity from '@microsoft/clarity'
import { useEffect } from 'react'

export function Clarity() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

    if (!clarityId) {
      return
    }

    clarity.init(clarityId)
  }, [])

  return null
}
