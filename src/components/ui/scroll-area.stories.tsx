import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ScrollArea } from './scroll-area'
import { Separator } from './separator'

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ScrollArea>

export default meta

type Story = StoryObj<typeof meta>

const tags = Array.from({ length: 30 }, (_, i) => `v1.2.0-beta.${30 - i}`)

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 font-medium text-sm leading-none">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

/** `orientation` picks the scrollbars the area carries; the bar is not a child. */
export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border" orientation="horizontal">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            className="flex h-32 w-40 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground text-sm"
            key={i}
          >
            Panel {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

/**
 * A root with only a max height never scrolls (the viewport is `h-full`), so
 * the cap goes on `viewportClassName`, as the Contents list does.
 */
export const CappedHeight: Story = {
  render: () => (
    <ScrollArea className="w-48 rounded-md border" viewportClassName="max-h-60">
      <ol className="p-4">
        {tags.map((tag) => (
          <li className="py-1 text-sm" key={tag}>
            {tag}
          </li>
        ))}
      </ol>
    </ScrollArea>
  ),
}
