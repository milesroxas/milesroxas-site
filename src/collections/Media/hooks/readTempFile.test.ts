import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readTempFile } from './readTempFile'

type File = { clientUploadContext?: object; data: Buffer; tempFilePath?: string }

const run = async (file: File | undefined) => {
  const args = { data: { alt: 'a' }, req: { file } } as unknown as Parameters<
    typeof readTempFile
  >[0]
  const out = await readTempFile(args)
  return { file, out }
}

describe('readTempFile', () => {
  it('fills an empty buffer from the temp file', async () => {
    const tempFilePath = join(await mkdtemp(join(tmpdir(), 'media-')), 'a.webp')
    await writeFile(tempFilePath, Buffer.from('bytes'))
    const { file, out } = await run({ data: Buffer.alloc(0), tempFilePath })
    expect(file?.data.toString()).toBe('bytes')
    expect(out).toEqual({ alt: 'a' })
  })

  it('leaves a browser upload the adapter will skip, a buffered file, and no file alone', async () => {
    const marked = { clientUploadContext: {}, data: Buffer.alloc(0), tempFilePath: '/nope' }
    expect((await run(marked)).file?.data.length).toBe(0)
    const buffered = { data: Buffer.from('x'), tempFilePath: '/nope' }
    expect((await run(buffered)).file?.data.toString()).toBe('x')
    expect((await run(undefined)).out).toEqual({ alt: 'a' })
  })
})
