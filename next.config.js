// next.config.js
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const vercelHost = process.env.VERCEL_URL // e.g. "feature-branch--project.vercel.app"
const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects,

  images: {
    // allow your /api/media/file/* endpoint on Vercel
    remotePatterns: [
      vercelHost && {
        protocol: 'https',
        hostname: vercelHost,
        port: '',
        pathname: '/api/media/file/**',
      },
    ].filter(Boolean),

    // disable the image optimizer in dev so we don't proxy to ourselves
    unoptimized: isDev,
  },

  turbopack: {
    rules: {
      '*.{glsl,vs,fs,vert,frag}': {
        loaders: ['raw-loader', 'glslify-loader'],
        as: '*.js',
      },
    },
  },

  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      }),
    )

    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/i,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })

    return config
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false,
})
