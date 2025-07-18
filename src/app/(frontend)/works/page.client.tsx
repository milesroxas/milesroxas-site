'use client'

import React from 'react'
import { WorkArchive } from '@/components/WorkArchive'
import type { CardWorkData } from '@/components/Card/Works/Component'

interface WorksClientProps {
  works: CardWorkData[]
}

const WorksClient: React.FC<WorksClientProps> = ({ works }) => {
  return <WorkArchive works={works} />
}

export default WorksClient
