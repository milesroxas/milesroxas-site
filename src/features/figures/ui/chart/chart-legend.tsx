import type { ChartKind } from '../../spec/chart'
import type { ChartSlot } from './model'

/**
 * The key mirrors the mark: a block for bars and areas, a stroke for lines
 * (dashed when the series is a reference, as its line is), a ringed dot for
 * scatter. Labels wear text tokens, never the series color; identity comes
 * from the mark beside them. Server HTML, so it is there before the chart
 * loads and is never color alone (the table view carries the rest).
 */
const Key = ({ kind, slot }: { kind: ChartKind; slot: ChartSlot }) => {
  if (kind === 'line' || (kind === 'area' && slot.reference))
    return slot.reference ? (
      <span
        aria-hidden
        className="w-4 border-t-2 border-dashed"
        style={{ borderColor: slot.color }}
      />
    ) : (
      <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: slot.color }} />
    )
  if (kind === 'scatter')
    return (
      <span
        aria-hidden
        className="size-2.5 rounded-full ring-2 ring-background"
        style={{ background: slot.color }}
      />
    )
  return <span aria-hidden className="size-3 rounded-[3px]" style={{ background: slot.color }} />
}

export const ChartLegend = ({ kind, slots }: { kind: ChartKind; slots: ChartSlot[] }) => (
  <ul aria-label="Series" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
    {slots.map((slot) => (
      <li className="flex items-center gap-2" key={slot.key}>
        <Key kind={kind} slot={slot} />
        {slot.label}
      </li>
    ))}
  </ul>
)
