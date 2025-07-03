export type VercelEnv = 'preview' | 'production'

export interface EnvInfo {
  vercelEnv: VercelEnv
  isPreview: boolean
  isProduction: boolean
}

/**
 * Returns Vercel environment flags purely from process.env.
 * Can be called in Server or Client code.
 */
export function getEnv(): EnvInfo {
  const raw = process.env.VERCEL_ENV
  const vercelEnv: VercelEnv = raw === 'preview' ? 'preview' : 'production'

  return {
    vercelEnv,
    isPreview: vercelEnv === 'preview',
    isProduction: vercelEnv === 'production',
  }
}
