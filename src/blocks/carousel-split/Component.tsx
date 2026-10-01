import type { CarouselSplitBlock as CarouselSplitBlockType } from '@/payload-types'
import { CarouselSplit } from './CarouselSplit'

/**
 * Adapter for the flat `{...block}` render map. The copy is always the inline
 * `body`; `bare` is forwarded for callers whose shell owns the band (the
 * Section block).
 */
export const CarouselSplitBlock = (
  props: CarouselSplitBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => <CarouselSplit bare={props.bare} block={props} content={props.body} />
