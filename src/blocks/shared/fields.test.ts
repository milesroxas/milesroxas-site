import type { BlocksField, CheckboxField, FieldHook, TextField } from 'payload'
import { describe, expect, it } from 'vitest'
import { optionalFields } from './fields'
import { typeScale } from './typography'

const [toggle, eyebrow] = optionalFields({
  name: 'showEyebrow',
  label: 'Show eyebrow',
  fields: [{ name: 'eyebrow', type: 'text' }],
}) as [CheckboxField, TextField]

const run = (hook: FieldHook | undefined, args: Record<string, unknown>) =>
  hook?.(args as unknown as Parameters<FieldHook>[0])

const read = (siblingData: Record<string, unknown>) =>
  run(toggle.hooks?.afterRead?.[0], { siblingData, value: undefined })

const save = (args: Record<string, unknown>) => run(eyebrow.hooks?.beforeChange?.at(-1), args)

describe('optionalFields', () => {
  it('ticks the toggle only when a gated field has content', () => {
    expect(read({ eyebrow: 'Kicker' })).toBe(true)
    expect(read({ eyebrow: '  ' })).toBe(false)
    expect(read({})).toBe(false)
  })

  it('shows gated fields only while ticked', () => {
    const condition = eyebrow.admin?.condition
    expect(condition?.({}, { showEyebrow: true }, {} as never)).toBe(true)
    expect(condition?.({}, { showEyebrow: false }, {} as never)).toBe(false)
  })

  it('empties stored content when unticked', () => {
    expect(
      save({
        previousSiblingDoc: { eyebrow: 'Old' },
        siblingData: { showEyebrow: false },
        value: 'Old',
      }),
    ).toBeNull()
  })

  it('keeps new content sent with a stale false', () => {
    expect(
      save({ previousSiblingDoc: {}, siblingData: { showEyebrow: false }, value: 'New' }),
    ).toBe('New')
  })

  it('keeps content when the toggle is absent', () => {
    expect(save({ previousSiblingDoc: { eyebrow: 'Old' }, siblingData: {}, value: 'Old' })).toBe(
      'Old',
    )
  })

  it('empties a gated blocks field to an empty list', () => {
    const [, rows] = optionalFields({
      name: 'showRows',
      label: 'Show rows',
      fields: [{ name: 'rows', type: 'blocks', blocks: [] }],
    }) as [CheckboxField, BlocksField]
    expect(
      run(rows.hooks?.beforeChange?.at(-1), {
        previousSiblingDoc: { rows: [{ blockType: 'row' }] },
        siblingData: { showRows: false },
        value: [{ blockType: 'row' }],
      }),
    ).toEqual([])
  })
})

describe('typeScale', () => {
  it('moves every role one rung up at large', () => {
    expect(typeScale(null)).toEqual(typeScale('small'))
    expect(typeScale('small').heading).toBe('text-heading-3')
    expect(typeScale('large').body).toBe(typeScale('small').lead)
    expect(typeScale('large').title).toBe('text-heading-1')
  })
})
