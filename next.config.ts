// next.config.ts

import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000')

const url = new URL(NEXT_PUBLIC_SERVER_URL)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      // Every local path without a query string, as before this list existed.
      { pathname: '/**', search: '' },
      // Code-owned effect posters (src/features/immersive/visual/posters.ts),
      // one entry per effect `posterDirectory`; the `?v=` query keys the
      // transform to the look revision. A directory missing here ships a
      // poster the optimizer answers with 400. The effect contract test holds
      // the two lists together.
      { pathname: '/images/streak-field/**' },
      { pathname: '/images/light-leak/**' },
    ],
    remotePatterns: [
      {
        protocol: url.protocol === 'https:' ? 'https' : 'http',
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: '/**',
      },
      // The media bucket's public r2.dev URL (docs/media.md), the fallback
      // source for an image Cloudflare Images has not taken yet.
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: 'https' as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
              pathname: '/**',
            },
          ]
        : []),
      // Allow Cloudflare Images delivery
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [100, 85, 75],
    // Optimized images stay cached for a year: every media URL carries its
    // `updatedAt` as a cache tag, so a replaced file is a new URL. Without
    // this the optimizer re-fetched the R2 origin every four hours.
    minimumCacheTTL: 31536000,
    // Disable optimization in development to avoid private IP errors
    unoptimized: process.env.NODE_ENV === 'development',
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
    // Import .svg as React components. (The .glsl / .vert / .frag raw-loader
    // rules went with the dormant shader tooling, composer roadmap D13: the
    // Studio effects keep their GLSL inline.)
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
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

    // Exclude test directories from node_modules
    webpackConfig.module.rules.push({
      test: /node_modules.*\/test\//,
      loader: 'ignore-loader',
    })

    return webpackConfig
  },

  reactStrictMode: true,
  redirects,

  // Markdown alternates for agents (docs/aeo.md): /posts/foo.md and
  // /works/foo.md, the home page as /index.md (and the llmstxt.org
  // /index.html.md), /works.md, /posts.md and /contact.md, and content
  // negotiation (Accept: text/markdown) on each page itself. All resolve to the
  // handlers under /md. `beforeFiles`: the pages are prerendered, and an
  // afterFiles rewrite runs only once no file answers the path, so on Vercel
  // the cached HTML won the negotiation and the Accept header was never read.
  async rewrites() {
    const acceptsMarkdown = [{ type: 'header' as const, key: 'accept', value: '.*text/markdown.*' }]
    return {
      beforeFiles: [
        { source: '/:collection(posts|works)/:slug.md', destination: '/md/:collection/:slug' },
        {
          source: '/:collection(posts|works)/:slug',
          destination: '/md/:collection/:slug',
          has: acceptsMarkdown,
        },
        { source: '/index.md', destination: '/md/pages/home' },
        { source: '/index.html.md', destination: '/md/pages/home' },
        { source: '/', destination: '/md/pages/home', has: acceptsMarkdown },
        { source: '/:page(works|posts|contact).md', destination: '/md/:page' },
        { source: '/:page(works|posts|contact)', destination: '/md/:page', has: acceptsMarkdown },
      ],
    }
  },

  async headers() {
    const immutable = { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
    return [
      // Effect posters are versioned in their file names (`*-v1-dark.webp`).
      { source: '/images/:path*', headers: [immutable] },
      // Textures keep their names between revisions: a day in the browser,
      // then a week of stale-while-revalidate behind the CDN.
      {
        source: '/textures/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },

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
