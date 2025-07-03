import { useMemo } from 'react'

type SpacingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface SpaceProps {
  pt?: SpacingSize | null
  pb?: SpacingSize | null
  mt?: SpacingSize | null
  mb?: SpacingSize | null
}

// now returns a CSS var
const getSpacingValue = (size: SpacingSize) => `var(--space-${size})`

export function useSpacing(space?: SpaceProps): React.CSSProperties {
  return useMemo(() => {
    if (!space) return {}
    const s: React.CSSProperties = {}
    if (space.pt && space.pt !== 'none') s.paddingTop = getSpacingValue(space.pt)
    if (space.pb && space.pb !== 'none') s.paddingBottom = getSpacingValue(space.pb)
    if (space.mt && space.mt !== 'none') s.marginTop = getSpacingValue(space.mt)
    if (space.mb && space.mb !== 'none') s.marginBottom = getSpacingValue(space.mb)
    return s
  }, [space])
}
