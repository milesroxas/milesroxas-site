import type { Field } from 'payload'
import { eyebrowFields } from '@/blocks/shared/fields'

/** Eyebrow + heading pair shared by feature section blocks. */
export const featureHeaderFields: Field[] = [
  ...eyebrowFields(),
  { name: 'heading', type: 'text', required: true },
]
