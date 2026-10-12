/**
 * The public URL of an object in the media bucket (Cloudflare R2 behind its
 * custom domain, `R2_PUBLIC_URL`). The storage adapter stores `prefix` and the
 * server-owned `_objectKey` folder; both arrive joined in `prefix` here. Each
 * segment is encoded on its own so a folder keeps its slashes and a filename
 * keeps its spaces.
 */
export function r2PublicBase(): string {
  const base = process.env.R2_PUBLIC_URL
  if (!base) throw new Error('R2_PUBLIC_URL is not set')
  return base.replace(/\/+$/, '')
}

const encodePath = (path: string) =>
  path.split('/').filter(Boolean).map(encodeURIComponent).join('/')

/**
 * Runs in the `url` field's read hook, so it never throws: with no public
 * base (a cloud session's `.env`, a preview missing the variable) it answers
 * Payload's own file route, which the adapter serves from the bucket.
 */
export function r2FileUrl({ filename, prefix }: { filename: string; prefix?: string }): string {
  if (!process.env.R2_PUBLIC_URL) return `/api/media/file/${encodeURIComponent(filename)}`
  const key = [prefix ?? '', filename].map(encodePath).filter(Boolean).join('/')
  return `${r2PublicBase()}/${key}`
}
