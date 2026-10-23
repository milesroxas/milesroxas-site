import type { Condition, Field, Validate } from 'payload'

/**
 * A block's "Play a video" switch and the upload it reveals (docs/media.md,
 * "Videos"). Off, the block shows its media as before. On, the media upload
 * hides and a Videos upload takes its place: the visitor sees a few seconds
 * loop muted and a play button, and a click plays the whole video with
 * sound. The panel under the upload shows where Stream's encoding stands, so
 * the editor can watch it finish from the page.
 */

const showVideo: Condition = (_, siblingData) => siblingData?.playVideo === true
export const noVideo: Condition = (_, siblingData) => siblingData?.playVideo !== true

/** `media` stays required unless the block plays a video instead. */
export const requiredUnlessVideo: Validate = (value, args) => {
  if (value !== null && value !== undefined && value !== '') return true
  const siblingData = (args as { siblingData?: { playVideo?: unknown } }).siblingData
  return siblingData?.playVideo === true ? true : 'This field is required.'
}

const videoChosen: Validate = (value, args) => {
  const siblingData = (args as { siblingData?: { playVideo?: unknown } }).siblingData
  if (siblingData?.playVideo !== true) return true
  return value !== null && value !== undefined && value !== '' ? true : 'Choose a video.'
}

const and =
  (...conditions: (Condition | undefined)[]): Condition =>
  (data, siblingData, ctx) =>
    conditions.every((condition) => !condition || Boolean(condition(data, siblingData, ctx)))

export const videoFields = ({ condition }: { condition?: Condition } = {}): Field[] => [
  {
    name: 'playVideo',
    type: 'checkbox',
    label: 'Play a video',
    defaultValue: false,
    admin: {
      condition,
      description:
        'A full-length video in place of the media: a few seconds loop muted, and a click plays it all with sound.',
    },
  },
  {
    name: 'video',
    type: 'upload',
    relationTo: 'videos',
    validate: videoChosen,
    admin: { condition: and(condition, showVideo) },
  },
  {
    name: 'videoStatus',
    type: 'ui',
    admin: {
      condition: and(condition, showVideo),
      components: { Field: '@/collections/Videos/VideoStatusField#VideoStatusField' },
    },
  },
]
