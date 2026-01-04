'use client'

import type React from 'react'
import { useEffect } from 'react'
import { useLenis } from '@/hooks/useLenis'
import type { Work } from '@/payload-types'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'

const PageClient: React.FC<{ work: Work }> = ({ work }) => {
  const { restoreFrame } = usePageAnimationStore()
  const lenis = useLenis()
  const { industry, role, deliverables, title } = work
  useEffect(() => {
    restoreFrame()
    lenis?.scrollTo(0, { immediate: true })
  }, [restoreFrame, lenis])

  return (
    <div
      data-theme="dark"
      className="flex items-center bg-background py-8 text-foreground md:h-full lg:h-[14vh] lg:py-0"
    >
      <div className="container flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        {title && (
          <div className="font-light md:flex-1">
            <div className="flex flex-col gap-8 md:flex-row">
              <h1 className="w-full text-2xl">{title}</h1>
            </div>
          </div>
        )}
        {(industry || role || deliverables) && (
          <div className="flex w-full flex-col font-light md:min-h-[12vh] md:w-auto md:shrink-0 md:flex-row md:items-center md:justify-end">
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
              {industry && (
                <div>
                  <h2 className="text-muted-foreground text-sm md:text-base">Industry</h2>
                  <p className="text-md">{industry}</p>
                </div>
              )}
              {role && (
                <div>
                  <h2 className="text-muted-foreground text-sm md:text-base">Role</h2>
                  <p className="text-md">{role}</p>
                </div>
              )}
              {deliverables && (
                <div>
                  <h2 className="text-muted-foreground text-sm md:text-base">Deliverables</h2>
                  <p className="text-md">{deliverables}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageClient
