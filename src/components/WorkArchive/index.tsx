import type React from 'react'
import { type CardWorkData, WorkCard } from '@/components/Card/Works/Component'
import { workKeys } from '@/utilities/reactKeyDomains'
import { cn } from '@/utilities/ui'

export type Props = {
  works?: CardWorkData[]
}

export const WorkArchive: React.FC<Props> = (props) => {
  const { works } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-20 sm:grid-cols-8 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {works?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={workKeys.fromWorkArray(result, index)}>
                  <WorkCard doc={result} relationTo="works" showDescription={true} />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
