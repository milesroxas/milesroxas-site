import React from 'react'

import { WorkCard, WorkCardData } from './WorkCard'

export type Props = {
  works: WorkCardData[]
}

export const HomeContentScroll: React.FC<Props> = (props) => {
  const { works } = props

  return (
    <div className="container">
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
        {works?.map((result, index) => {
          if (typeof result === 'object' && result !== null) {
            return (
              <div className="col-span-4" key={index}>
                <WorkCard doc={result} relationTo="works" />
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
