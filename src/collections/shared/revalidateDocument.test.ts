import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidateDocument } from './revalidateDocument'

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag: vi.fn() }))

type Doc = { id: number; _status?: 'draft' | 'published' | null; slug?: string | null }

const revalidateLists = vi.fn()
const hooks = revalidateDocument<'works'>({
  noun: 'work',
  pathFor: (slug) => `/works/${slug}`,
  revalidateLists,
})

const req = (context: Record<string, unknown> = {}) =>
  ({ payload: { logger: { info: vi.fn() } }, context }) as never

const afterChange = (doc: Doc, previousDoc: Doc, context?: Record<string, unknown>) =>
  hooks.afterChange({ doc, previousDoc, req: req(context) } as never)

const afterOperation = (
  arg: { operation: string; args: Record<string, unknown>; result: unknown },
  context?: Record<string, unknown>,
) => hooks.afterOperation({ ...arg, req: req(context) } as never)

beforeEach(() => {
  revalidatePath.mockClear()
  revalidateLists.mockClear()
})

describe('revalidateDocument', () => {
  it('busts the page and its lists on publish', () => {
    afterChange({ id: 1, _status: 'published', slug: 'a' }, { id: 1, _status: 'draft', slug: 'a' })

    expect(revalidatePath).toHaveBeenCalledWith('/works/a')
    expect(revalidateLists).toHaveBeenCalledOnce()
  })

  it('leaves the cache alone on a draft save, whatever the latest version was', () => {
    afterChange({ id: 1, _status: 'draft', slug: 'a' }, { id: 1, _status: 'published', slug: 'a' })
    afterOperation({
      operation: 'updateByID',
      args: { draft: true },
      result: { id: 1, _status: 'draft', slug: 'a' },
    })

    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateLists).not.toHaveBeenCalled()
  })

  it('busts the page and its lists on unpublish, even after autosaves made the latest version a draft', () => {
    // What Payload hands afterChange for an unpublish once an autosave followed the publish.
    afterChange({ id: 1, _status: 'draft', slug: 'a' }, { id: 1, _status: 'draft', slug: 'a' })
    expect(revalidatePath).not.toHaveBeenCalled()

    const result = { id: 1, _status: 'draft', slug: 'a' }
    expect(afterOperation({ operation: 'updateByID', args: {}, result })).toBe(result)

    expect(revalidatePath).toHaveBeenCalledWith('/works/a')
    expect(revalidateLists).toHaveBeenCalledOnce()
  })

  it('busts every page a bulk unpublish took down', () => {
    afterOperation({
      operation: 'update',
      args: { where: {} },
      result: {
        docs: [
          { id: 1, _status: 'draft', slug: 'a' },
          { id: 2, _status: 'published', slug: 'b' },
          { id: 3, _status: 'draft', slug: 'c' },
        ],
        errors: [],
      },
    })

    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual(['/works/a', '/works/c'])
    expect(revalidateLists).toHaveBeenCalledOnce()
  })

  it('ignores operations that do not write the live document', () => {
    afterOperation({ operation: 'find', args: {}, result: { docs: [{ id: 1, _status: 'draft' }] } })
    afterOperation(
      { operation: 'updateByID', args: {}, result: { id: 1, _status: 'draft', slug: 'a' } },
      { disableRevalidate: true },
    )

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
