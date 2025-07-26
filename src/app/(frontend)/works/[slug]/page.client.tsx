'use client'

import React from 'react'
import { Work } from '@/payload-types'
import { useLenis } from '@/hooks/useLenis'

const PageClient: React.FC<{ work: Work }> = ({ work }) => {
  const { industry, role, deliverables, title } = work

  return (
    <div
      data-theme="dark"
      className="bg-background text-foreground flex items-center py-8 md:h-full lg:h-[14vh] lg:py-0"
    >
      <div className="container flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        {title && (
          <div className="font-light">
            <div className="flex flex-col gap-8 md:flex-row">
              <h1 className="text-5xl">{title}</h1>
            </div>
          </div>
        )}
        {(industry || role || deliverables) && (
          <div className="flex w-full flex-col font-light md:min-h-[12vh] md:flex-row md:items-center md:justify-end">
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
