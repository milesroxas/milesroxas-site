import { readFile } from 'node:fs/promises'
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Gives the storage adapter the bytes of a file Payload parked on disk.
 *
 * Payload streams a browser upload back from Blob into a temp file when it
 * needs the full file (to make `thumbnail`), leaving `req.file.data` empty.
 * It then drops the client-upload marker from a webp, gif or tiff, which it
 * re-encodes through sharp, so the Blob adapter uploads the original again
 * from `data` alone and writes zero bytes over the browser's copy. The same
 * happens to any Local API upload that passes `tempFilePath`. Reading the
 * temp file here, before the adapter's own `beforeChange` hooks, makes that
 * re-upload carry the file. A file that still has its marker is skipped by
 * the adapter and stays on disk.
 */
export const readTempFile: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file
  if (file?.tempFilePath && !file.clientUploadContext && !file.data?.length) {
    file.data = await readFile(file.tempFilePath)
  }
  return data
}
