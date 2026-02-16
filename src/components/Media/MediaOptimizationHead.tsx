/**
 * Server-side component for adding media optimization resource hints
 * Add this to your layout or page head for better media loading performance
 */
export const MediaOptimizationHead = () => {
  const streamSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN

  return (
    <>
      {/* Preconnect to media API */}
      <link rel="preconnect" href="/api/media" />
      <link rel="dns-prefetch" href="/api/media" />
      {/* Preconnect to Cloudflare Images CDN */}
      <link rel="preconnect" href="https://imagedelivery.net" />
      {/* Preconnect to Cloudflare Stream CDN */}
      {streamSubdomain && (
        <link rel="preconnect" href={`https://customer-${streamSubdomain}.cloudflarestream.com`} />
      )}
    </>
  )
}
