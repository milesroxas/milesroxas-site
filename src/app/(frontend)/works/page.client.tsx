'use client'

import type React from 'react'
import type { CardWorkData } from '@/components/Card/Works/Component'
import { WorkArchive } from '@/components/WorkArchive'

interface WorksClientProps {
  works: CardWorkData[]
}

const WorksClient: React.FC<WorksClientProps> = ({ works }) => {
  return <WorkArchive works={works} />
}

export default WorksClient
