import { notFound } from 'next/navigation'

import { SiteLab } from '@/features/brand-lab/site/SiteLab'
import './site.css'

export const metadata = { title: 'brand lab: site' }

export default function SiteLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <SiteLab />
}
