import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CHART_CORPUS } from '@/features/figures/corpus'
import type { ChartSpec } from '@/features/figures/spec/chart'
import { blockControls } from '@/stories/block-controls'
import { ChartBlock } from './Component'

/**
 * The eight corpus charts (docs/figures.md): every kind, both orientations,
 * every x type, a reference series, annotations. The chart loads when it nears
 * the viewport, so a story shows the reserved box for a beat first, exactly
 * as a page does.
 */
const figure = (name: keyof typeof CHART_CORPUS) => {
  const { spec, textAlternative, title } = CHART_CORPUS[name] ?? {}
  return { spec, textAlternative, title }
}

const controls = blockControls<typeof ChartBlock>('chart')

const meta = {
  title: 'Blocks/Figures/Chart',
  component: ChartBlock,
  parameters: { layout: 'fullscreen' },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'chart',
    id: 'story-chart',
    caption: 'Illustrative numbers from the acceptance corpus.',
    ...figure('frameTimeByCount'),
  },
} satisfies Meta<typeof ChartBlock>

export default meta

type Story = StoryObj<typeof meta>

/** Two series and a neutral reference line; line ends labelled because they sit apart. */
export const Line: Story = {}

export const LineOverTime: Story = { args: figure('lcpByFace') }

/** One series and few rows, so the tips carry their values. */
export const BarHorizontal: Story = { args: figure('noiseCost') }

export const BarGrouped: Story = { args: figure('posterWeight') }

/** Two lying series with few rows: every tip carries its value, the key sits on the title line. */
export const BarHorizontalGrouped: Story = {
  args: {
    title: 'Before and after the platform',
    caption:
      'Days per task before and after. Content went from eight sources (Google Drive, Figma, local files and more) to one, and the MCP server lets the team write to that one source directly.',
    textAlternative:
      'The gap between site updates fell from 90 days to 7, a case study from 45 days to 14, and a new post from 14 days to 1.5.',
    spec: {
      specVersion: 1,
      kind: 'bar',
      orientation: 'horizontal',
      x: { key: 'task', type: 'category' },
      y: { label: 'Days' },
      series: [
        { key: 'before', label: 'Before' },
        { key: 'after', label: 'After' },
      ],
      rows: [
        { task: 'Gap between site updates', before: 90, after: 7 },
        { task: 'Produce a case study', before: 45, after: 14 },
        { task: 'Publish new content', before: 14, after: 1.5 },
      ],
    } satisfies ChartSpec,
  },
}

/** Time under bars draws as dated bands. */
export const BarOverTime: Story = { args: figure('studioPublishes') }

export const Area: Story = { args: figure('octavesVsDetail') }

export const Scatter: Story = { args: figure('countVsFps') }

/** The data end is rounded whichever way a bar points; the baseline stays square. */
export const DivergingBar: Story = { args: figure('deltaFromDefault') }

/** The dark steps are selected for the dark ground, not flipped from the light ones. */
export const OnInvertedBand: Story = { args: { theme: 'inverted' } }

export const OnNeutralBand: Story = { args: { ...figure('posterWeight'), theme: 'neutral' } }

export const TextWidth: Story = {
  args: {
    width: 'text',
    dataSource: { label: 'Chrome DevTools trace', href: 'https://example.com' },
  },
}

/** A spec today's schema rejects keeps its words and says the drawing is missing. */
export const Unavailable: Story = {
  args: { spec: { specVersion: 1, kind: 'pie' } as never },
}
