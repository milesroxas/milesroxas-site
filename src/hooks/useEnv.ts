// hooks/useEnv.ts
import { useMemo } from 'react'

export type VercelEnv = 'preview' | 'production'

export interface EnvInfo {
  /** 'preview' or 'production' */
  vercelEnv: VercelEnv
  /** true when running in Vercel Preview */
  isPreview: boolean
  /** true when running in Vercel Production */
  isProduction: boolean
}

/**
 * Returns Vercel environment flags.
 */
export function useEnv(): EnvInfo {
  return useMemo(() => {
    // Vercel sets VERCEL_ENV to 'development'|'preview'|'production'
    // We collapse any non-preview value to 'production'
    const raw = process.env.VERCEL_ENV
    const vercelEnv: VercelEnv = raw === 'preview' ? 'preview' : 'production'

    return {
      vercelEnv,
      isPreview: vercelEnv === 'preview',
      isProduction: vercelEnv === 'production',
    }
  }, [])
}
