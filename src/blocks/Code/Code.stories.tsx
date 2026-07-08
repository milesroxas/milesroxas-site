import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CodeBlock } from './Component'

const sampleCode = `export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

const meta = {
  title: 'Blocks/Code',
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    blockType: 'code',
    code: sampleCode,
    language: 'typescript',
  },
  argTypes: {
    blockType: { table: { disable: true } },
  },
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const TypeScript: Story = {}

export const Css: Story = {
  args: {
    code: `.card {
  border-radius: var(--radius);
  background: var(--card);
}`,
    language: 'css',
  },
}
