// hooks/useSpacing.ts
import { useMemo } from 'react'

type SpacingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface SpaceProps {
  pt?: SpacingSize | null
  pb?: SpacingSize | null
  mt?: SpacingSize | null
  mb?: SpacingSize | null
}

// Map your custom spacing sizes to rem values
const getSpacingValue = (size: SpacingSize): string => {
  switch (size) {
    case 'none':
      return '0'
    case 'sm':
      return '4rem'
    case 'md':
      return '8rem'
    case 'lg':
      return '12rem'
    case 'xl':
      return '16rem'
    default:
      return '0'
  }
}

export function useSpacing(space?: SpaceProps): React.CSSProperties {
  if (!space) return {}

  const styles: Record<string, string> = {}

  // Process each spacing direction
  if (space.pt && space.pt !== 'none') {
    styles.paddingTop = getSpacingValue(space.pt)
  }

  if (space.pb && space.pb !== 'none') {
    styles.paddingBottom = getSpacingValue(space.pb)
  }

  if (space.mt && space.mt !== 'none') {
    styles.marginTop = getSpacingValue(space.mt)
  }

  if (space.mb && space.mb !== 'none') {
    styles.marginBottom = getSpacingValue(space.mb)
  }

  return styles as React.CSSProperties
}
