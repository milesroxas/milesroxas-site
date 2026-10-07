import type { Condition, Field, GroupField, TextFieldSingleValidation } from 'payload'
import { DEFAULT_PUBLISHER, isExternalPost, parseArticleUrl } from '@/utilities/externalArticle'

export const showsExternal: Condition = (data) => isExternalPost(data)

/** The body tabs: an external post's article lives at its original URL. */
export const showsBody: Condition = (data) => !isExternalPost(data)

const validateArticleUrl: TextFieldSingleValidation = (value, { data }) =>
  !isExternalPost(data as Parameters<typeof isExternalPost>[0]) ||
  parseArticleUrl(value) !== null ||
  'Enter the full https:// address of the original article.'

export const sourceField = (): Field => ({
  name: 'source',
  type: 'select',
  defaultValue: 'internal',
  required: true,
  options: [
    { label: 'Here', value: 'internal' },
    { label: 'Elsewhere', value: 'external' },
  ],
  admin: {
    position: 'sidebar',
    description:
      'Where the article is read. Elsewhere: the post introduces it with the Opening intro and links out.',
  },
})

/** Hidden state keeps its values: switching back to Here restores the body untouched. */
export const externalField = (): GroupField => ({
  name: 'external',
  type: 'group',
  label: 'Original article',
  admin: { condition: showsExternal },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          admin: { width: '66%', placeholder: 'https://www.suits-sandals.com/lab/…' },
          validate: validateArticleUrl,
        },
        {
          name: 'publisher',
          type: 'text',
          defaultValue: DEFAULT_PUBLISHER,
          admin: { width: '34%', description: 'The site the link names.' },
        },
      ],
    },
  ],
})
