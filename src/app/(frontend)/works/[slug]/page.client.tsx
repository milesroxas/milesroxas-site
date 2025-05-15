'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'
import { useLenis } from '@/hooks/useLenis'
import { Work } from '@/payload-types'

const PageClient: React.FC<{ work: Work }> = ({ work }) => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const { restoreFrame } = usePageAnimationStore()
  const lenis = useLenis()

  const { industry, role, deliverables } = work

  useEffect(() => {
    restoreFrame()
    lenis?.scrollTo(0, { immediate: true })
  }, [restoreFrame, lenis])

  return (
    <>
      {(industry || role || deliverables) && (
        <div className="bg-primary flex min-h-[12vh] w-full items-center font-light text-white">
          <div className="container flex gap-20">
            {industry && (
              <div>
                <h2 className="text-muted-foreground">Industry</h2>
                <p className="text-xl">{industry}</p>
              </div>
            )}
            {role && (
              <div>
                <h2 className="text-md text-muted-foreground">Role</h2>
                <p className="text-xl">{role}</p>
              </div>
            )}
            {deliverables && (
              <div>
                <h2 className="text-muted-foreground">Deliverables</h2>
                <p className="text-xl">{deliverables}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default PageClient
