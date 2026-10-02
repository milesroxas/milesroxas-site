export type MediaSize = 'full' | 'contained' | 'inset' | 'small'

/** Width caps for the Caption and YouTube `size` select. `full` bleeds, so its caller drops the container. */
export const MEDIA_SIZE_CLASS: Record<MediaSize, string> = {
  full: '',
  contained: '',
  inset: 'mx-auto max-w-3xl',
  small: 'mx-auto max-w-md',
}
