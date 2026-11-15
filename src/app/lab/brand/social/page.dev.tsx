import { notFound } from 'next/navigation'

import { SocialLab } from '@/features/brand-lab/social/SocialLab'

export const metadata = { title: 'brand lab: social' }

export default function SocialLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <SocialLab />
}
