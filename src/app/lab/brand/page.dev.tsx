import { notFound } from 'next/navigation'

import { BrandLab } from '@/features/brand-lab/BrandLab'

export const metadata = { title: 'brand lab' }

export default function BrandLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <BrandLab />
}
