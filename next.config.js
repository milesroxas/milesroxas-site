// next.config.js
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const vercelHost = process.env.VERCEL_URL // e.g. "feature-branch--project.vercel.app" or "milesroxas.vercel.app"
const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects,

  images: {
    remotePatterns: [
      // Preview & Production on Vercel
      vercelHost && {
        protocol: 'https',
        hostname: vercelHost,
        port: '',
        pathname: '/api/media/file/**',
      },
      // Local development
      isDev && {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
    ].filter(Boolean),
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
    // ignore certain modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      }),
    )

    // add shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/i,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })

    return config
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
