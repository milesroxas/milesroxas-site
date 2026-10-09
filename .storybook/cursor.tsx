import type { Decorator, GlobalTypes } from '@storybook/nextjs-vite'

import { Cursor } from '../src/providers/Cursor'

/**
 * The site replaces the native cursor (`src/providers/Cursor`), mounted once by
 * `Providers` in RootLayout. Stories render without that shell, so the preview
 * mounts it here. The toolbar can switch back to the native cursor; Docs pages
 * render many stories at once and always use the native one.
 */
export const cursorGlobalTypes = {
  cursor: {
    description: 'Pointer',
    toolbar: {
      title: 'Cursor',
      icon: 'pointerhand',
      items: [
        { value: 'site', title: 'Site cursor' },
        { value: 'native', title: 'Native cursor' },
      ],
      dynamicTitle: true,
    },
  },
} satisfies GlobalTypes

export const withCursor: Decorator = (Story, { globals, viewMode }) => {
  const mounted = globals.cursor !== 'native' && viewMode !== 'docs'
  return (
    <>
      <Story />
      {mounted && <Cursor />}
    </>
  )
}
