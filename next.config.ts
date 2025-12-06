// next.config.ts
import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const url = new URL(NEXT_PUBLIC_SERVER_URL)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol === 'https:' ? 'https' : 'http',
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: '/**',
      },
    ],
  },

  // Applies when running with Turbopack (dev and build if you opt in)
  turbopack: {
    // If you ever need a custom monorepo root, uncomment:
    // root: path.join(__dirname, '..'),

    // Match your old extension resolution behavior under Turbopack
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', '.cjs'],

    // Mirror common aliases if you use them
    resolveAlias: {
      // example: underscore -> lodash
      // underscore: 'lodash',
    },

    // Only needed if you relied on custom webpack loaders in dev
    // Example: import .svg as React components and .glsl as raw strings
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },

  // Applies when using Webpack (plain next build)
  webpack: (webpackConfig) => {
    // Keep this for non-Turbopack builds
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Exclude test files from bundling
    webpackConfig.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader',
    })

    return webpackConfig
  },

  reactStrictMode: true,
  redirects,

  // External packages that should not be bundled by server components
  serverExternalPackages: [
    'pino',
    'thread-stream',
    'drizzle-kit',
    'esbuild',
    '@payloadcms/drizzle',
    '@payloadcms/db-vercel-postgres',
  ],

  // Optional experimental cache for Turbopack. Test before adopting widely.
  experimental: {
    // Turbopack filesystem caching for better performance (Next.js 16+)
    // Enable after testing to ensure stability
    // turbopackFileSystemCacheForDev: true,
    // turbopackFileSystemCacheForBuild: true,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
