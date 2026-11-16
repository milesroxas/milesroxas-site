import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/nextjs-vite'

import '../src/app/(frontend)/globals.css'
import { cursorGlobalTypes, withCursor } from './cursor'
import { motionSpeedGlobalTypes, withMotionSpeed } from './motion-speed'
// Provides the Geist and Geist Mono variables that RootLayout normally sets via next/font.
import './fonts.css'

const preview: Preview = {
  globalTypes: { ...cursorGlobalTypes, ...motionSpeedGlobalTypes },
  initialGlobals: { cursor: 'site', motionSpeed: '1' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    backgrounds: { disable: true },
    a11y: {
      // 'todo' surfaces violations in the UI without failing tests;
      // flip to 'error' once the existing violations are burned down.
      test: 'todo',
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
    (Story) => (
      <div className="bg-background text-foreground font-sans antialiased">
        <Story />
      </div>
    ),
    withCursor,
    withMotionSpeed,
  ],
}

export default preview
