import { SpacingSize } from '@/fields/sectionSpacing'

export type SpacingProps = {
  pt?: SpacingSize | null
  pb?: SpacingSize | null
  mt?: SpacingSize | null
  mb?: SpacingSize | null
}

export const useSectionSpacing = (spacing?: SpacingProps) => {
  if (!spacing) return ''

  const { pt, pb, mt, mb } = spacing

  const classes = [
    pt &&
      pt !== 'none' &&
      `pt-${pt === 'sm' ? '12' : pt === 'md' ? '32' : pt === 'lg' ? '60' : '24'}`,
    pb &&
      pb !== 'none' &&
      `pb-${pb === 'sm' ? '12' : pb === 'md' ? '32' : pb === 'lg' ? '60' : '24'}`,
    mt &&
      mt !== 'none' &&
      `mt-${mt === 'sm' ? '12' : mt === 'md' ? '32' : mt === 'lg' ? '60' : '24'}`,
    mb &&
      mb !== 'none' &&
      `mb-${mb === 'sm' ? '12' : mb === 'md' ? '32' : mb === 'lg' ? '60' : '24'}`,
  ]
    .filter(Boolean)
    .join(' ')

  return classes
}
