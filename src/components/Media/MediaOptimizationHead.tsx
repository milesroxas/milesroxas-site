/**
 * Server-side component for adding media optimization resource hints
 * Add this to your layout or page head for better media loading performance
 */
export const MediaOptimizationHead = () => {
  return (
    <>
      {/* Preconnect to media API */}
      <link rel="preconnect" href="/api/media" />
      <link rel="dns-prefetch" href="/api/media" />
    </>
  )
}
