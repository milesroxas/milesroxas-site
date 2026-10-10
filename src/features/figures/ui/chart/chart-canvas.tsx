'use client'

import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartKind, ChartSpec } from '../../spec/chart'
import { type ChartModel, chartModel, directLabels, formatValue, formatX } from './model'

/**
 * The one chart renderer. Every mark rule is decided here, once, and none is
 * authorable (dataviz mark specs): 2px lines, bars capped at 24px with a 4px
 * rounded data end and a square baseline, a 10% area wash, 8px dots with a
 * surface ring, a hairline solid grid, text in text tokens. One y axis, always.
 *
 * Marks enter once, as the figure's reveal beat plays (`LazyChart` mounts
 * the canvas on that beat): bars grow from the baseline, lines and areas
 * draw along their length, dots surface, each series a step after the last.
 * The entrance waits for the frame's wipe to open most of the plot and lands
 * on the site's content pace (`ENTER`); values and end labels appear as their
 * marks land (Recharts hides them while a mark is moving). The tooltip tracks
 * the pointer with no easing; a readout that trails the cursor reads as lag.
 */

/**
 * The marks' entrance, in ms. `begin` sits inside the under-media wipe (1.2s,
 * power2.out: most of the frame is open by then); `easing` is that wipe's
 * curve, so the marks settle the way the frame did. A line has further to
 * travel than a bar and takes a little longer.
 */
const ENTER = {
  begin: 400,
  series: 150,
  bar: 1000,
  line: 1200,
  dot: 800,
  easing: 'cubic-bezier(0.215,0.61,0.355,1)',
} as const

const BAR_SIZE = 24
const BAR_RADIUS = 4
const SURFACE = 'var(--background)'
const INK = 'var(--foreground)'
const MUTED = 'var(--muted-foreground)'
const TICK = { fill: MUTED, fontSize: 12 }
/** A category name is what the reader looks up a bar by, so it reads in ink; a measure tick recedes. */
const CATEGORY_TICK = { fill: INK, fontSize: 12 }
/**
 * A label drawn over the plot wears a halo in the ground color (the diagram
 * labels' rule), so a line passing under it breaks cleanly around the glyphs.
 * `figure-annotation` is what the stylesheet brings in after the marks.
 */
const PLOT_LABEL = {
  className: 'figure-annotation',
  fill: INK,
  fontSize: 12,
  paintOrder: 'stroke',
  stroke: SURFACE,
  strokeLinejoin: 'round' as const,
  strokeWidth: 4,
}
/** Room past the plot for a value label that sits outside it: a line's end, a horizontal bar's tip. */
const LABEL_ROOM = 48

/** What every mark component draws from. */
type Drawing = {
  /** Whether the marks enter, or are simply there (reduced motion, a beat already over). */
  animate: boolean
  labels: ReturnType<typeof directLabels>
  model: ChartModel
  spec: ChartSpec
}

/** A mark's entrance, as Recharts takes it: the series' step in the cascade and its kind's duration. */
const entrance = (drawing: Drawing, index: number, duration: number) => ({
  animationBegin: ENTER.begin + index * ENTER.series,
  animationDuration: duration,
  animationEasing: ENTER.easing,
  isAnimationActive: drawing.animate,
})

const isBarKind = (kind: ChartKind) => kind === 'bar' || kind === 'diverging-bar'

/** A rectangle path with a radius per corner: top-left, top-right, bottom-right, bottom-left. */
const roundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  [tl, tr, br, bl]: readonly [number, number, number, number],
) =>
  `M${x + tl},${y}H${x + w - tr}Q${x + w},${y} ${x + w},${y + tr}V${y + h - br}Q${x + w},${y + h} ${x + w - br},${y + h}H${x + bl}Q${x},${y + h} ${x},${y + h - bl}V${y + tl}Q${x},${y} ${x + tl},${y}Z`

type BarShapeProps = {
  fill?: string
  height?: number
  value?: unknown
  width?: number
  x?: number
  y?: number
}

/**
 * A bar with its data end rounded and its baseline square, whichever way it
 * points. Recharts' own `radius` rounds a fixed pair of corners, which puts
 * the curve on the baseline of every negative bar in a diverging chart.
 */
const barShape =
  (horizontal: boolean) =>
  ({ fill, height = 0, value, width = 0, x = 0, y = 0 }: BarShapeProps) => {
    const w = Math.abs(width)
    const h = Math.abs(height)
    const r = Math.min(BAR_RADIUS, w / 2, h / 2)
    const negative = typeof value === 'number' && value < 0
    // The data end: right or top when positive, left or bottom when negative.
    const corners = horizontal
      ? negative
        ? ([r, 0, 0, r] as const)
        : ([0, r, r, 0] as const)
      : negative
        ? ([0, 0, r, r] as const)
        : ([r, r, 0, 0] as const)
    return (
      <path
        d={roundedRect(Math.min(x, x + width), Math.min(y, y + height), w, h, corners)}
        fill={fill}
      />
    )
  }

/** An annotation's x on the scale the chart draws: a timestamp, a dated band, or the value itself. */
const annotationX = ({ model, spec }: Drawing, x: number | string): number | string => {
  if (spec.x.type !== 'time') return x
  return model.continuousX ? Date.parse(`${x}T00:00:00Z`) : formatX(spec, x)
}

const Annotations = (drawing: Drawing) =>
  drawing.spec.annotations?.map((annotation, index) => {
    const label = { ...PLOT_LABEL, value: annotation.label }
    // Recharts names axes by screen position, so a horizontal chart swaps them.
    const [position, measure] = drawing.model.horizontal
      ? (['y', 'x'] as const)
      : (['x', 'y'] as const)
    const at = annotation.x === undefined ? {} : { [position]: annotationX(drawing, annotation.x) }
    if (annotation.x !== undefined && annotation.y !== undefined)
      return (
        <ReferenceDot
          fill={INK}
          key={index}
          label={{ ...label, position: 'top' }}
          r={4}
          stroke={SURFACE}
          strokeWidth={2}
          {...at}
          {...{ [measure]: annotation.y }}
        />
      )
    return (
      <ReferenceLine
        key={index}
        label={{ ...label, position: 'insideTopRight' }}
        stroke={MUTED}
        strokeDasharray="3 3"
        {...at}
        {...(annotation.x === undefined ? { [measure]: annotation.y } : {})}
      />
    )
  })

const formatter = (spec: ChartSpec) => (input: unknown) =>
  typeof input === 'number' ? formatValue(spec, input) : ''

/** Bars and areas encode magnitude as length from zero, so their measure axis always includes it. */
const measuresFromZero = (kind: ChartKind) => isBarKind(kind) || kind === 'area'

/** The axis the x values sit on: bands for categories, a continuous scale for a measure or time. */
const positionAxis = ({ model, spec }: Drawing) => ({
  axisLine: false,
  // The container paints every tick muted by class; `figure-axis-category` wins it back for names.
  className: model.continuousX ? undefined : 'figure-axis-category',
  dataKey: 'x',
  tick: model.continuousX ? TICK : CATEGORY_TICK,
  tickFormatter: (input: number | string) =>
    model.continuousX ? formatX(spec, input) : String(input),
  tickLine: false,
  tickMargin: 8,
  ...(model.continuousX
    ? {
        domain: ['dataMin', 'dataMax'],
        scale: spec.x.type === 'time' ? ('time' as const) : ('linear' as const),
        type: 'number' as const,
      }
    : { type: 'category' as const }),
})

/** The one measure axis. It fits the data unless the author fixed the domain. */
const measureAxis = ({ spec }: Drawing) => ({
  axisLine: false,
  domain: spec.y.domain ?? [
    measuresFromZero(spec.kind) ? (min: number) => Math.min(0, min) : 'auto',
    'auto',
  ],
  tick: TICK,
  tickFormatter: formatter(spec),
  tickLine: false,
  type: 'number' as const,
})

/** Recharts names axes by screen position, so a horizontal chart hands each the other's props. */
const Axes = (drawing: Drawing) =>
  drawing.model.horizontal ? (
    <>
      <XAxis {...measureAxis(drawing)} />
      <YAxis {...positionAxis(drawing)} width="auto" />
    </>
  ) : (
    <>
      <XAxis {...positionAxis(drawing)} minTickGap={24} />
      <YAxis {...measureAxis(drawing)} width="auto" />
    </>
  )

/** Grid, both axes, the tooltip and the annotations: everything around the marks. */
const Scaffold = (drawing: Drawing) => {
  const { model, spec } = drawing
  const bars = isBarKind(spec.kind)

  return (
    <>
      <CartesianGrid
        horizontal={!model.horizontal}
        stroke="var(--border)"
        vertical={model.horizontal}
      />
      <Axes {...drawing} />
      <ChartTooltip
        content={
          <ChartTooltipContent
            indicator={measuresFromZero(spec.kind) ? 'dot' : 'line'}
            labelFormatter={(_, payload) => formatX(spec, payload?.[0]?.payload?.x ?? '')}
            valueFormatter={formatter(spec)}
          />
        }
        cursor={bars ? { fill: 'var(--muted)', opacity: 0.5 } : { stroke: 'var(--border)' }}
        isAnimationActive={false}
      />
      {spec.kind === 'diverging-bar' ? (
        <ReferenceLine stroke={MUTED} {...(model.horizontal ? { x: 0 } : { y: 0 })} />
      ) : null}
      <Annotations {...drawing} />
    </>
  )
}

/** The value at a line's last point, when `directLabels` says the ends are readable. */
const EndLabel = ({ labels, model, spec }: Drawing) =>
  labels === 'line-ends' ? (
    <LabelList
      content={({ index, value, x, y }) =>
        index === model.data.length - 1 && typeof value === 'number' ? (
          <text dx={8} dy={4} fill={INK} fontSize={12} x={Number(x)} y={Number(y)}>
            {formatValue(spec, value)}
          </text>
        ) : null
      }
    />
  ) : null

/**
 * Stroke shared by lines and area outlines; a reference series draws dashed
 * as well as neutral. Caps are butt, not round: the entrance draws the line
 * as a growing dash, and a round cap paints a dot at each end of a dash of
 * zero length, so the points would show before the line reached them.
 */
const stroke = (slot: ChartModel['slots'][number]) => ({
  activeDot: { r: 4, stroke: SURFACE, strokeWidth: 2 },
  dataKey: slot.key,
  stroke: slot.color,
  strokeDasharray: slot.reference ? '4 4' : undefined,
  strokeLinecap: 'butt' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2,
  type: 'linear' as const,
})

type Frame = { data: ChartModel['data']; margin: Record<string, number> }

const BarMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => {
  const { horizontal, slots } = drawing.model
  return (
    <BarChart
      {...frame}
      accessibilityLayer
      barCategoryGap="24%"
      barGap={2}
      layout={horizontal ? 'vertical' : 'horizontal'}
    >
      <Scaffold {...drawing} />
      {slots.map((slot, index) => (
        <Bar
          {...entrance(drawing, index, ENTER.bar)}
          dataKey={slot.key}
          fill={slot.color}
          key={slot.key}
          maxBarSize={BAR_SIZE}
          shape={barShape(horizontal)}
        >
          {drawing.labels === 'bar-tips' ? (
            <LabelList
              fill={INK}
              fontSize={12}
              fontWeight={500}
              formatter={formatter(drawing.spec)}
              offset={8}
              position={horizontal ? 'right' : 'top'}
            />
          ) : null}
        </Bar>
      ))}
    </BarChart>
  )
}

const ScatterMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => (
  <ScatterChart {...frame} accessibilityLayer>
    <Scaffold {...drawing} />
    {drawing.model.slots.map((slot, index) => (
      <Scatter
        {...entrance(drawing, index, ENTER.dot)}
        data={frame.data.filter((datum) => typeof datum[slot.key] === 'number')}
        dataKey={slot.key}
        fill={slot.color}
        key={slot.key}
        name={slot.label}
        // `size` is Recharts' abstract point area, 64 at rest; it grows from 0 on entrance.
        shape={({ cx, cy, size = 64 }: { cx?: number; cy?: number; size?: number }) => (
          <circle
            cx={cx}
            cy={cy}
            fill={slot.color}
            r={5 * Math.sqrt(size / 64)}
            stroke={SURFACE}
            strokeWidth={2}
          />
        )}
      />
    ))}
  </ScatterChart>
)

const AreaMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => (
  <AreaChart {...frame} accessibilityLayer>
    <Scaffold {...drawing} />
    {drawing.model.slots.map((slot, index) => (
      <Area
        {...stroke(slot)}
        {...entrance(drawing, index, ENTER.line)}
        fill={slot.color}
        fillOpacity={slot.reference ? 0 : 0.1}
        key={slot.key}
      >
        <EndLabel {...drawing} />
      </Area>
    ))}
  </AreaChart>
)

const LineMarks = ({ drawing, frame }: { drawing: Drawing; frame: Frame }) => (
  <LineChart {...frame} accessibilityLayer>
    <Scaffold {...drawing} />
    {drawing.model.slots.map((slot, index) => (
      <Line
        {...stroke(slot)}
        {...entrance(drawing, index, ENTER.line)}
        connectNulls={false}
        dot={false}
        key={slot.key}
      >
        <EndLabel {...drawing} />
      </Line>
    ))}
  </LineChart>
)

const MARKS: Record<ChartKind, (props: { drawing: Drawing; frame: Frame }) => ReactNode> = {
  area: AreaMarks,
  bar: BarMarks,
  'diverging-bar': BarMarks,
  line: LineMarks,
  scatter: ScatterMarks,
}

export default function ChartCanvas({ animate, spec }: { animate: boolean; spec: ChartSpec }) {
  const model = chartModel(spec)
  const labels = directLabels(spec, model)
  const Marks = MARKS[spec.kind]
  // A vertical bar's tip label sits above it, inside the plot's own top margin.
  const labelsPastPlot = labels === 'line-ends' || (labels === 'bar-tips' && model.horizontal)
  // Keyed by slot, never by an authored series key: see `chartModel`.
  const config: ChartConfig = Object.fromEntries(
    model.slots.map((slot) => [slot.key, { color: slot.color, label: slot.label }]),
  )
  return (
    // `data-enter` lets the stylesheet bring the annotations in after the marks (globals.css, "Figures").
    <ChartContainer
      className="figure-chart-canvas aspect-auto size-full [&_.figure-axis-category_.recharts-cartesian-axis-tick_text]:fill-foreground [&_.recharts-cartesian-axis-tick_text]:tabular-nums [&_.recharts-label-list_text]:tabular-nums"
      config={config}
      data-enter={animate ? '' : undefined}
    >
      <Marks
        drawing={{ animate, labels, model, spec }}
        frame={{
          data: model.data,
          margin: { bottom: 4, left: 4, right: labelsPastPlot ? LABEL_ROOM : 12, top: 12 },
        }}
      />
    </ChartContainer>
  )
}
