import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { lexicalState, simpleRichText } from '@/stories/fixtures'
import RichText from './index'

const meta = {
  title: 'Components/RichText',
  component: RichText,
  tags: ['autodocs'],
} satisfies Meta<typeof RichText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: simpleRichText,
  },
}

export const WithoutProse: Story = {
  args: {
    data: simpleRichText,
    enableProse: false,
    enableGutter: false,
  },
}

export const LongForm: Story = {
  args: {
    data: lexicalState([
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Long-form content',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h2',
        type: 'heading',
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Rich text fields in Payload are stored as Lexical editor state. This story renders a multi-paragraph fixture through the same JSX converters used on the live site.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        type: 'paragraph',
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 1,
            mode: 'normal',
            style: '',
            text: 'Bold text ',
            type: 'text',
            version: 1,
          },
          {
            detail: 0,
            format: 2,
            mode: 'normal',
            style: '',
            text: 'and italic text ',
            type: 'text',
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'inside one paragraph.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        type: 'paragraph',
        version: 1,
      },
    ]),
  },
}
