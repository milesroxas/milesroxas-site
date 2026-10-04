/** Every cursor label. A variant exists only by being listed here. */
export const CURSOR_LABELS = {
  view: 'View',
  drag: 'Drag',
} as const

export type CursorVariant = keyof typeof CURSOR_LABELS

export const isCursorVariant = (value: string): value is CursorVariant => value in CURSOR_LABELS

/** Spread on an element to show its label while the pointer is over it. */
export const cursorTarget = (variant: CursorVariant) => ({ 'data-cursor': variant })
