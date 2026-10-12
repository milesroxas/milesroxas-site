import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './chart'

const data = [
  { quarter: 'Q1', s0: 42, s1: 28 },
  { quarter: 'Q2', s0: 51, s1: 35 },
  { quarter: 'Q3', s0: 64, s1: 39 },
  { quarter: 'Q4', s0: 72, s1: 48 },
]

/** Keyed by slot with the figure palette (`--figure-*`), as the Chart figure does. */
const config = {
  s0: { label: 'Organic', color: 'var(--figure-1)' },
  s1: { label: 'Referral', color: 'var(--figure-2)' },
} satisfies ChartConfig

const percent = (value: number) => `${value}%`
const tick = { fill: 'var(--muted-foreground)', fontSize: 12 }

const meta = {
  title: 'UI/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
  },
  // Each story renders its own chart; `children` is the container's required slot.
  args: { config, children: <></> },
  argTypes: { children: { table: { disable: true } } },
  decorators: [
    (Story) => (
      <div className="w-[32rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

/** Bars measure from zero, so the tooltip keys each value with a dot. */
export const Bars: Story = {
  render: (args) => (
    <ChartContainer config={args.config}>
      <BarChart accessibilityLayer data={data} margin={{ bottom: 4, left: 4, right: 12, top: 12 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis axisLine={false} dataKey="quarter" tick={tick} tickLine={false} />
        <YAxis axisLine={false} tick={tick} tickFormatter={percent} tickLine={false} width={40} />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" valueFormatter={percent} />}
          cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
          defaultIndex={2}
          isAnimationActive={false}
        />
        <Bar dataKey="s0" fill="var(--color-s0)" maxBarSize={24} radius={[4, 4, 0, 0]} />
        <Bar dataKey="s1" fill="var(--color-s1)" maxBarSize={24} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
}

/** Lines do not start at zero, so the tooltip keys them with a line and formats its own label. */
export const Lines: Story = {
  render: (args) => (
    <ChartContainer config={args.config}>
      <LineChart accessibilityLayer data={data} margin={{ bottom: 4, left: 4, right: 12, top: 12 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis axisLine={false} dataKey="quarter" tick={tick} tickLine={false} />
        <YAxis axisLine={false} tick={tick} tickFormatter={percent} tickLine={false} width={40} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(label) => `${label} 2026`}
              valueFormatter={percent}
            />
          }
          cursor={{ stroke: 'var(--border)' }}
          defaultIndex={1}
          isAnimationActive={false}
        />
        <Line dataKey="s0" dot={false} stroke="var(--color-s0)" strokeWidth={2} type="monotone" />
        <Line dataKey="s1" dot={false} stroke="var(--color-s1)" strokeWidth={2} type="monotone" />
      </LineChart>
    </ChartContainer>
  ),
}

/**
 * A `theme` entry is one `light-dark()` pair, so the series follows whatever
 * ground the chart sits on (the toolbar theme, or an inverted band).
 */
export const ThemedSeries: Story = {
  args: {
    config: { s0: { label: 'Organic', theme: { light: '#2a78d6', dark: '#3987e5' } } },
  },
  render: (args) => (
    <ChartContainer config={args.config}>
      <BarChart accessibilityLayer data={data} margin={{ bottom: 4, left: 4, right: 12, top: 12 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis axisLine={false} dataKey="quarter" tick={tick} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} isAnimationActive={false} />
        <Bar dataKey="s0" fill="var(--color-s0)" maxBarSize={24} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
}
