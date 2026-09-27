import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    projects: [
      {
        // Pure-logic tests ported with sas-site modules (`*.test.ts` beside
        // their source). jsdom, no real browser.
        extends: true,
        // Only the `@/` alias: tsconfig also maps `react` to its types package,
        // which a runtime resolver must not follow.
        resolve: { alias: { '@': path.join(dirname, 'src') } },
        test: {
          name: 'unit',
          environment: 'jsdom',
          // jsdom stubs (matchMedia, IntersectionObserver, ResizeObserver)
          // that embla and the reveal components read on mount.
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
