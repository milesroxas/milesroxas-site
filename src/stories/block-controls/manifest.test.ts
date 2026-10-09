import type { Block } from 'payload'
import { describe, expect, it } from 'vitest'
import { Carousel } from '@/blocks/Carousel/config'
import { FullMedia } from '@/blocks/full-media/config'
import { RichTransition } from '@/blocks/rich-transition/config'
import { sectionBlock } from '@/blocks/section/config'
import { BAND_THEME_OPTIONS } from '@/blocks/shared/band-theme'
import { blockControlsFor, blockControlsManifest, type FieldControl } from './manifest'

const fieldsOf = (block: Block) =>
  Object.fromEntries(blockControlsFor(block).fields.map((field) => [field.name, field]))

const valuesOf = (field: FieldControl) =>
  'options' in field ? field.options.map((option) => option.value) : []

/** A block whose rules cover each shape the probe must and must not prove. */
const probe: Block = {
  slug: 'probe',
  fields: [
    { name: 'mode', type: 'select', defaultValue: 'a', options: ['a', 'b', 'c'] },
    { name: 'flag', type: 'checkbox', defaultValue: true },
    { name: 'choice', type: 'select', options: ['x', 'y'] },
    { name: 'onlyA', type: 'text', admin: { condition: (_, s) => s?.mode === 'a' } },
    { name: 'notC', type: 'text', admin: { condition: (_, s) => s?.mode !== 'c' } },
    { name: 'unflagged', type: 'text', admin: { condition: (_, s) => !s?.flag } },
    {
      name: 'twoDrivers',
      type: 'text',
      admin: { condition: (_, s) => s?.mode === 'a' && Boolean(s?.flag) },
    },
    {
      name: 'emptyOrX',
      type: 'text',
      admin: { condition: (_, s) => s?.choice === undefined || s?.choice === 'x' },
    },
    { name: 'onlyEmpty', type: 'text', admin: { condition: (_, s) => s?.choice === undefined } },
    { name: 'hidden', type: 'text', admin: { hidden: true } },
  ],
}

describe('blockControlsFor', () => {
  const fullMedia = fieldsOf(FullMedia)

  it('names the block the way the drawer does', () => {
    expect(blockControlsFor(FullMedia)).toMatchObject({ slug: 'fullMedia', label: 'Stacked' })
  })

  it('carries a select with its options, label, default and description', () => {
    expect(fullMedia.width).toMatchObject({
      control: 'select',
      label: 'Width',
      defaultValue: 'contained',
      group: 'Design',
      options: [
        { label: 'Contained', value: 'contained' },
        { label: 'Full width', value: 'full-width' },
      ],
    })
    expect(fullMedia.width.description).toMatch(/^Contained keeps/)
  })

  it('reads a default that is a function and the shared theme options', () => {
    expect(fullMedia.theme).toMatchObject({
      control: 'select',
      defaultValue: 'default',
      options: [...BAND_THEME_OPTIONS],
    })
    expect(fullMedia.textSize).toMatchObject({ control: 'radio', defaultValue: 'small' })
  })

  it('flattens the Design collapsible and leaves top-level fields ungrouped', () => {
    expect(fullMedia.showContent).toMatchObject({ control: 'boolean', defaultValue: true })
    expect(fullMedia.showContent.group).toBeUndefined()
    expect(fullMedia.body).toMatchObject({ control: 'none' })
  })

  it('skips the virtual eyebrow gate and keeps the eyebrow', () => {
    expect(fullMedia.showEyebrow).toBeUndefined()
    expect(fullMedia.eyebrow).toMatchObject({ control: 'text' })
  })

  it('proves the editor rules it can and leaves the rest visible', () => {
    expect(fullMedia.aspectRatio.if).toEqual({ arg: 'width', eq: 'contained' })
    expect(fullMedia.contentPosition.if).toEqual({ arg: 'showContent', truthy: true })
    // Inside-a-Section rule: path-based, not a sibling.
    expect(fullMedia.theme.if).toBeUndefined()
    // The upload shows while the visual choice is empty or "media".
    expect(fullMedia.media.if).toBeUndefined()
    const transition = fieldsOf(RichTransition)
    expect(transition.headingLevel.if).toEqual({ arg: 'layout', eq: 'prose' })
    expect(transition.textSize.if).toBeUndefined()
  })

  it('reads the Section rows and its customize gate', () => {
    const section = fieldsOf(sectionBlock({ blocks: [FullMedia], interfaceName: 'Test' }))
    expect(section.customize).toMatchObject({ control: 'boolean', defaultValue: false })
    expect(section.spacing).toMatchObject({ label: 'Band', if: { arg: 'customize', truthy: true } })
    expect(valuesOf(section.stack)).toEqual(['default', 'tight', 'loose', 'none'])
    expect(section.blocks).toMatchObject({ control: 'none' })
  })

  it('reads a checkbox default', () => {
    expect(fieldsOf(Carousel).showArrows).toMatchObject({
      control: 'boolean',
      defaultValue: false,
    })
  })
})

describe('condition probe', () => {
  const fields = fieldsOf(probe)

  it('proves eq, neq and a negated checkbox', () => {
    expect(fields.onlyA.if).toEqual({ arg: 'mode', eq: 'a' })
    expect(fields.notC.if).toEqual({ arg: 'mode', neq: 'c' })
    expect(fields.unflagged.if).toEqual({ arg: 'flag', truthy: false })
  })

  it('gives up on two drivers', () => {
    expect(fields.twoDrivers.if).toBeUndefined()
  })

  it('counts empty as a state of a choice with no default', () => {
    expect(fields.emptyOrX.if).toEqual({ arg: 'choice', neq: 'y' })
    expect(fields.onlyEmpty.if).toBeUndefined()
  })

  it('drops hidden fields', () => {
    expect(fields.hidden).toBeUndefined()
  })
})

describe('blockControlsManifest', () => {
  it('keys blocks by slug', () => {
    expect(Object.keys(blockControlsManifest([FullMedia, Carousel]))).toEqual([
      'fullMedia',
      'carousel',
    ])
  })
})
