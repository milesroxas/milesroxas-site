import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  async viteFinal(viteConfig) {
    const { default: tsconfigPaths } = await import('vite-tsconfig-paths')
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tsconfigPaths()]
    // Pre-bundle heavy CJS/ESM-mixed deps so mid-run optimization reloads
    // don't abort story imports (Vitest browser mode is sensitive to these).
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        '@payloadcms/richtext-lexical/react',
        'react-hook-form',
        'prism-react-renderer',
      ],
    }
    return viteConfig
  },
}

export default config
