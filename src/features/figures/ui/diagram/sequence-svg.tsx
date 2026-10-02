import { cn } from '@/utilities/ui'
import {
  layoutSequence,
  SEQUENCE_LINE_HEIGHT,
  type SequenceLayout,
  type SequenceVariant,
} from '../../layout/sequence'
import type { SequenceSpec } from '../../spec/diagram'
import { TextLines } from '../text-lines'
import { type DiagramNaming, DiagramSvg } from './diagram-svg'
import { arrowHead, stepStyle } from './svg'

/** A narrow header holds the same name in less room, so it sets it a size down. */
const HEADER_TYPE: Record<SequenceVariant, string> = { narrow: 'text-xs', wide: 'text-sm' }

/** An actor's header (a pill for a person) and the lifeline under it. */
const ActorColumn = ({
  actor,
  headerType,
  layout: { header, tailY },
  person,
}: {
  actor: SequenceLayout['actors'][number]
  headerType: string
  layout: SequenceLayout
  person: boolean
}) => (
  <g className="figure-step" style={stepStyle(0)}>
    <line
      className="stroke-border"
      x1={actor.x}
      x2={actor.x}
      y1={header.y + header.height}
      y2={tailY}
    />
    <rect
      className="fill-background stroke-muted-foreground"
      strokeWidth={1.5}
      height={header.height}
      rx={person ? header.height / 2 : 8}
      width={header.width}
      x={actor.x - header.width / 2}
      y={header.y}
    />
    <TextLines
      className={cn('fill-foreground', headerType)}
      lineHeight={SEQUENCE_LINE_HEIGHT}
      lines={actor.lines}
      x={actor.x}
      y={header.y + header.height / 2}
    />
  </g>
)

/**
 * A sequence diagram in both forms; `DiagramFigure` shows the one that fits
 * its frame. Layout is arithmetic (`layout/sequence`), computed here. A reply
 * draws dashed and a person's header is a pill, so neither direction nor role
 * depends on color. A label wears a halo, because in the narrow form it runs
 * across lifelines it does not belong to.
 */
export const SequenceSvg = ({
  spec,
  variant,
  ...naming
}: DiagramNaming & { spec: SequenceSpec; variant: SequenceVariant }) => {
  const layout = layoutSequence(spec)[variant]

  return (
    <DiagramSvg {...naming} height={layout.height} width={layout.width}>
      {layout.actors.map((actor, index) => (
        <ActorColumn
          actor={actor}
          headerType={HEADER_TYPE[variant]}
          key={actor.id}
          layout={layout}
          person={spec.actors[index]?.role === 'person'}
        />
      ))}

      {layout.messages.map((message) => {
        const source = spec.messages[message.index]
        if (!source) return null
        return (
          <g className="figure-step" key={message.index} style={stepStyle(message.index + 1)}>
            <polyline
              className="fill-none stroke-muted-foreground"
              points={message.points.map((point) => point.join(',')).join(' ')}
              strokeDasharray={source.style === 'reply' ? '5 5' : undefined}
              strokeWidth={1.5}
            />
            <polygon className="fill-muted-foreground" points={arrowHead(message.points)} />
            <TextLines
              anchor={message.label.anchor}
              className="fill-foreground text-xs"
              halo
              lineHeight={SEQUENCE_LINE_HEIGHT}
              lines={message.label.lines}
              x={message.label.x}
              y={message.label.y}
            />
          </g>
        )
      })}
    </DiagramSvg>
  )
}
