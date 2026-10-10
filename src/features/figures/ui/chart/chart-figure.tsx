import type { ChartSpec } from '../../spec/chart'
import { FigureFrame, type FigureFrameProps, figureIds } from '../figure-frame'
import { ChartLegend } from './chart-legend'
import { ChartTable } from './chart-table'
import { LazyChart } from './lazy-chart'
import { chartModel } from './model'

type ChartFigureProps = Omit<FigureFrameProps, 'children' | 'dataView' | 'dataViewLabel'> & {
  spec: ChartSpec
}

/**
 * A chart in its frame. Server HTML carries the title, the legend, the text
 * alternative and the data table; only the canvas is client code, and it loads
 * near the viewport (`LazyChart`). Without JavaScript the reader is pointed at
 * the table, which holds every value the chart would have drawn.
 */
export const ChartFigure = ({ spec, ...frame }: ChartFigureProps) => {
  const { horizontal, slots } = chartModel(spec)
  // A horizontal chart turns the axes: its categories run down the left, its measure along the bottom.
  const [leftAxisLabel, bottomAxisLabel] = horizontal
    ? [spec.x.label, spec.y.label]
    : [spec.y.label, spec.x.label]
  const name = frame.title ?? 'Chart'
  const ids = figureIds(frame.blockId)
  return (
    <FigureFrame
      {...frame}
      // One series needs no key: the title already says what is plotted.
      aside={slots.length > 1 ? <ChartLegend kind={spec.kind} slots={slots} /> : null}
      dataView={<ChartTable caption={name} spec={spec} />}
      dataViewLabel="data table"
    >
      {/* The axes are named at the plot's corners, upright: the left axis on a
          line above its ticks, the bottom axis under the end of its run. */}
      {leftAxisLabel ? <p className="mb-2 text-muted-foreground text-xs">{leftAxisLabel}</p> : null}
      <LazyChart
        describedBy={ids.description}
        label={name}
        labelledBy={frame.title ? ids.title : undefined}
        spec={spec}
      />
      {bottomAxisLabel ? (
        <p className="mt-2 text-right text-muted-foreground text-xs">{bottomAxisLabel}</p>
      ) : null}
      <noscript>
        <p className="mt-3 text-muted-foreground text-sm">
          This chart needs JavaScript. Its values are in the data table below.
        </p>
      </noscript>
    </FigureFrame>
  )
}
