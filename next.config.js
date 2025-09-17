// next.config.js
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.milesroxas.com', // subdomains
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'milesroxas.com', // apex domain
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'www.milesroxas.com', // common www
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app', // Covers all Vercel deployments
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
    ],
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
