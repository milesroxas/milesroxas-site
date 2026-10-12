import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  heading,
  paragraph,
  richText,
  simpleRichText,
  TEXT_FORMAT_BOLD,
  text,
} from '@/stories/fixtures'
import RichText from './Legacy'

const TEXT_FORMAT_ITALIC = 2

const longForm = richText(
  heading('h2', text('Long-form content')),
  paragraph(
    text(
      'Rich text fields in Payload are stored as Lexical editor state. This story renders a multi-paragraph fixture through the same JSX converters used on the live site.',
    ),
  ),
  paragraph(
    text('Bold text ', TEXT_FORMAT_BOLD),
    text('and italic text ', TEXT_FORMAT_ITALIC),
    text('inside one paragraph.'),
  ),
)

const meta = {
  title: 'Components/RichText/Legacy',
  component: RichText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The renderer the legacy blocks, the heros and the post body use. Its type comes from the site’s own `prose-custom` rules in globals.css, not Tailwind Typography; ported blocks use `RichText` (`./index.tsx`).',
      },
    },
  },
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

/** The `prose-custom` ladder: h1 to h3 over light body copy. */
export const HeadingLadder: Story = {
  args: {
    data: richText(
      heading('h1', text('Heading one')),
      paragraph(text('Body copy under the first heading.')),
      heading('h2', text('Heading two')),
      paragraph(text('Body copy under the second heading.')),
      heading('h3', text('Heading three')),
      paragraph(text('Body copy under the third heading.')),
    ),
  },
}

export const LongForm: Story = {
  args: { data: longForm },
}

/** A post's body, as the post page sets it beside the opening. */
export const PostBody: Story = {
  args: {
    data: longForm,
    className: 'text-tertiary-foreground',
    enableGutter: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
}
