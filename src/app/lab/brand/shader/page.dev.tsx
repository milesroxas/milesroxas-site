import { notFound } from 'next/navigation'

import { ShaderLab } from '@/features/brand-lab/shader/ShaderLab'
import './shader.css'

export const metadata = { title: 'brand lab: shader' }

export default function ShaderLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <ShaderLab />
}
