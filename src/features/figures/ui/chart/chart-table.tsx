import { keyed } from '@/utilities/reactKeys'
import type { ChartSpec } from '../../spec/chart'
import { formatValue, formatX } from './model'

/**
 * A chart's data as a plain table, in server HTML: the view a screen reader, a
 * crawler and a reader without JavaScript get, and the home of every value the
 * chart does not label directly. Scrolls inside its own frame so a 500-row
 * chart cannot stretch the page; the frame is focusable so keys reach it.
 */
export const ChartTable = ({ caption, spec }: { caption: string; spec: ChartSpec }) => (
  <section
    aria-label={`${caption}, data table`}
    className="border-border max-h-96 overflow-auto overscroll-contain rounded-md border"
    // Root Lenis preventDefaults wheel and touch to drive the page; this hands both axes back to the table.
    data-lenis-prevent
    // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard reachable (WCAG 2.1.1).
    tabIndex={0}
  >
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="bg-background sticky top-0">
        <tr className="border-border border-b">
          <th className="px-3 py-2 font-medium" scope="col">
            {spec.x.label ?? spec.x.key}
          </th>
          {spec.series.map((series) => (
            <th className="px-3 py-2 text-right font-medium" key={series.key} scope="col">
              {series.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {keyed(spec.rows, (row) => String(row[spec.x.key] ?? '')).map(({ key, item: row }) => {
          const x = row[spec.x.key]
          return (
            <tr className="border-border border-b last:border-0" key={key}>
              <th className="px-3 py-2 font-normal" scope="row">
                {x === null || x === undefined ? '' : formatX(spec, x)}
              </th>
              {spec.series.map((series) => {
                const value = row[series.key]
                return (
                  <td className="px-3 py-2 text-right tabular-nums" key={series.key}>
                    {typeof value === 'number' ? formatValue(spec, value) : 'n/a'}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  </section>
)
