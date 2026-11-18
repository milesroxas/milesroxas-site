import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { StepListBlock } from './Component'

/** The Skill Studio loop, as drawn in design-system/screens/pages/skill-studio.elyx. */
const steps = [
  {
    id: 'write',
    title: 'Write',
    description: 'AI assisted workflow for writing and refining your files.',
  },
  {
    id: 'run',
    title: 'Run',
    description: 'Create multiple scenarios and define what a good response would be.',
  },
  {
    id: 'compare',
    title: 'Compare',
    description: 'Evaluate the output side by side and understand how the AI performed.',
  },
]

const controls = blockControls<typeof StepListBlock>('stepList')

const meta = {
  title: 'Blocks/Lists/StepList',
  component: StepListBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'stepList',
    steps,
  },
} satisfies Meta<typeof StepListBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FourSteps: Story = {
  args: {
    steps: [
      ...steps,
      { id: 'ship', title: 'Ship', description: 'Publish the version that scored best.' },
    ],
  },
}

export const Large: Story = {
  args: { textSize: 'large' },
}
