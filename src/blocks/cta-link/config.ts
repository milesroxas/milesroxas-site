import type { Block, Condition, TextFieldSingleValidation } from 'payload'
import { designFields, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { noVideo, videoFields } from '@/fields/video'

/**
 * CTA link: one call to action that opens a work, a post, a page or an external link,
 * in the brand's aim-field language (decided from the /proto/cta picker,
 * docs/cta-link.md). Three looks:
 *
 * - Instrument: a spec sheet beside an ink panel; pointing paints the preview
 *   image in through large cells.
 * - Field: a full-bleed band with the field as its ground and the target's
 *   title as display type.
 * - Strip: one quiet index row; the field opens behind it on intent.
 *
 * A work, post or page fills the copy, picture and facts from its own fields;
 * every one of them can be overridden here. An external link needs its own
 * title. The media slot is the site's usual one: an image or a Media video,
 * or a full-length video behind "Play a video" (`fields/video`), whose loop is
 * what plays here, since a click opens the target.
 * `title` and `description` are TEXT_KEYS names, so the copy reaches Ask and
 * llms.txt.
 */

type Kind = 'work' | 'post' | 'page' | 'external'
const kindIs =
  (kind: Kind): Condition =>
  (_, siblingData) =>
    (siblingData?.targetType ?? 'work') === kind

const httpsUrl: TextFieldSingleValidation = (value, { siblingData }) => {
  if ((siblingData as { targetType?: Kind })?.targetType !== 'external') return true
  if (!value) return 'An external link needs a URL.'
  try {
    return new URL(value).protocol === 'https:' ? true : 'Use an https:// link.'
  } catch {
    return 'Enter a full link, starting with https://.'
  }
}

export const CtaLink: Block = {
  slug: 'ctaLink',
  admin: { group: BLOCK_GROUPS.forms },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_cta_link`,
  interfaceName: 'CtaLinkBlock',
  labels: { singular: 'CTA link', plural: 'CTA links' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      // Function, not literal: Payload then writes no column default naming a just-added enum label.
      defaultValue: () => 'instrument',
      options: [
        { label: 'Instrument: spec sheet and paint panel', value: 'instrument' },
        { label: 'Field: full-bleed band', value: 'field' },
        { label: 'Strip: one quiet row', value: 'strip' },
      ],
      admin: {
        description:
          "Instrument suits a work with a strong picture. Field closes a page with weight; it is the page's one full-bleed break. Strip sits quietly between sections.",
      },
    },
    {
      name: 'targetType',
      type: 'radio',
      label: 'Opens',
      required: true,
      defaultValue: () => 'work',
      options: [
        { label: 'A work', value: 'work' },
        { label: 'A post', value: 'post' },
        { label: 'A page', value: 'page' },
        { label: 'An external link', value: 'external' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'work',
      type: 'relationship',
      relationTo: 'works',
      admin: {
        condition: kindIs('work'),
        description: 'A protected work shows its public fallback; with none, the block hides.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: { targetType?: Kind } }) =>
        (siblingData?.targetType ?? 'work') !== 'work' || value ? true : 'Pick a work.',
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      admin: { condition: kindIs('post') },
      validate: (value: unknown, { siblingData }: { siblingData: { targetType?: Kind } }) =>
        siblingData?.targetType !== 'post' || value ? true : 'Pick a post.',
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: kindIs('page') },
      validate: (value: unknown, { siblingData }: { siblingData: { targetType?: Kind } }) =>
        siblingData?.targetType !== 'page' || value ? true : 'Pick a page.',
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      validate: httpsUrl,
      admin: { condition: kindIs('external') },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description:
          "Leave empty to use the work's, post's or page's title. An external link needs one.",
      },
      validate: (value: unknown, { siblingData }: { siblingData: { targetType?: Kind } }) =>
        siblingData?.targetType !== 'external' || value ? true : 'An external link needs a title.',
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'One or two sentences. Leave empty to use its search description.',
      },
    },
    ...videoFields({
      description:
        "A full-length video in place of the media. Its loop plays muted in Instrument's panel; a click still opens the target.",
    }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: noVideo,
        description:
          "The image or video Instrument paints in. Leave empty to use the work's or page's opening media, or the post's share image.",
      },
    },
    {
      name: 'action',
      type: 'text',
      admin: {
        description:
          'The call to action. Defaults to "Read the case study", "Read the post", "Open the page" or "Visit" and the site.',
      },
    },
    {
      name: 'facts',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Fact', plural: 'Facts' },
      admin: {
        initCollapsed: true,
        description:
          "Up to three label and value pairs under Instrument's copy. Leave empty to use the work's client, industry and scope, or the post's date, length and topic. A page has none of its own.",
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'value', type: 'text', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
    designFields([themeField()]),
  ],
}
