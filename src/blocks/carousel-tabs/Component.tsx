import type { CarouselTabsBlock as CarouselTabsBlockType } from '@/payload-types'
import { CarouselTabs } from './CarouselTabs'

/**
 * Adapter for the flat `{...block}` render map. `bare` is forwarded for
 * callers whose shell owns the band (the Section block).
 */
export const CarouselTabsBlock = (
  props: CarouselTabsBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => <CarouselTabs bare={props.bare} block={props} />
