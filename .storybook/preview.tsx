import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/nextjs-vite'
import { IBM_Plex_Sans } from 'next/font/google'

import '../src/app/(frontend)/globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
})

const preview: Preview = {
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
      <div
        className={`${ibmPlexSans.className} ${ibmPlexSans.variable} bg-background text-foreground antialiased`}
      >
        <Story />
      </div>
    ),
  ],
}

export default preview
