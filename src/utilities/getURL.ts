import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL

  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Always return a valid URL with a fallback
  return url || 'http://localhost:3000'
}

export const getClientSideURL = () => {
  // For Vercel Blob storage URLs in preview environments
  if (process.env.VERCEL_URL && !canUseDOM) {
    return `https://${process.env.VERCEL_URL}`
  }

  // For client-side rendering, use origin
  if (canUseDOM) {
    return window.location.origin
  }

  // Fallbacks
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}
