'use client'

import type React from 'react'
import { useEffect } from 'react'
import { ChromeTitle } from '@/components/SiteChrome/ChromeTitle'
import { useLenis } from '@/hooks/useLenis'
import type { Work } from '@/payload-types'
import { WorkMasthead } from '@/sections/WorkMasthead'
import { restoreChrome } from '@/stores/chromeStore'

const PageClient: React.FC<{ work: Work }> = ({ work }) => {
  const lenis = useLenis()
  const { id, industry, role, deliverables, title } = work
  useEffect(() => {
    restoreChrome()
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  return (
    <>
      {/* Keyed so moving between works replays the entrance. */}
      <WorkMasthead
        deliverables={deliverables}
        industry={industry}
        key={id}
        role={role}
        title={title}
      />
      {title && <ChromeTitle title={title} />}
    </>
  )
}

export default PageClient
