'use client'

import NextImage from 'next/image'
import type { ComponentProps } from 'react'
import { cloudflareImageLoader, isCloudflareImageUrl } from '@/utilities/cloudflareImageLoader'

/**
 * `next/image` that lets Cloudflare resize its own images. A loader is a
 * function, so a server component (the effect poster) renders this instead of
 * `next/image` directly. Any other `src` takes the default loader.
 */
export function CloudflareImage({ src, ...props }: ComponentProps<typeof NextImage>) {
  const loader =
    typeof src === 'string' && isCloudflareImageUrl(src) ? cloudflareImageLoader : undefined
  return <NextImage loader={loader} src={src} {...props} />
}
