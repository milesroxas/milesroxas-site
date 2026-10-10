import { IconChevronRight, IconLink } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

export type FigureWidth = 'full' | 'text' | 'wide'

/**
 * A figure's span on the composition grid (docs/block-grid-roadmap.md):
 * the reading column rich text sets, that column plus one each side, or all
 * eight. Literal strings so Tailwind sees them.
 *
 * A wide figure widens the drawing, not the words: the frame adopts the page
 * tracks as a subgrid (`BlockGrid`'s rule for a cell that is a run of cells),
 * the visual and its header span all six columns it was given, and the
 * caption and description stay on the reading column's four. The title sits
 * over the drawing's left edge, not the reading column's, because it names the
 * drawing; the caption sits with the prose it belongs to. Row gap is zeroed
 * because the parts already carry their own rhythm; the column gap stays
 * inherited, which is what lines the words up with the rich text around them.
 */
const WIDTH_CLASS: Record<FigureWidth, { frame: string; text: string; visual: string }> = {
  full: { frame: 'md:col-span-8', text: '', visual: '' },
  text: { frame: 'md:col-span-4 md:col-start-3', text: '', visual: '' },
  wide: {
    frame: 'md:col-span-6 md:col-start-2 md:grid md:grid-cols-subgrid md:gap-y-0',
    text: 'md:col-span-4 md:col-start-2',
    visual: 'md:col-span-full',
  },
}

/** The ids one figure's parts refer to each other by, from its block id. */
export const figureIds = (blockId: string) => ({
  anchor: `figure-${blockId}`,
  description: `figure-${blockId}-description`,
  title: `figure-${blockId}-title`,
})

export type FigureFrameProps = {
  /** Sits at the end of the title line, flush right: a chart's legend. Wraps under the title when the line is short. */
  aside?: ReactNode
  /** The block's id: the anchor, and the ids the visual is labelled by. */
  blockId: string
  caption?: null | string
  children: ReactNode
  /** The figure's data as plain HTML: a table for a chart, a list for a diagram. */
  dataView?: ReactNode
  /** Names what `dataView` holds, e.g. "data table". */
  dataViewLabel?: string
  source?: { href?: null | string; label?: null | string } | null
  textAlternative: string
  title?: null | string
  width?: FigureWidth | null
}

type Ids = ReturnType<typeof figureIds>

/**
 * The figure's header: the title with its anchor and, at the end of the same
 * line, whatever the figure kind hands over (a chart's legend). One row, so
 * the title and the key read as one unit over the drawing, and the two share
 * a baseline; when the line cannot hold both, the aside wraps underneath.
 */
const Header = ({
  aside,
  className,
  ids,
  title,
}: {
  aside?: ReactNode
  className?: string
  ids: Ids
  title?: null | string
}) => (
  <div
    className={cn('mb-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3', className)}
  >
    {title ? (
      <div className="group/title flex min-w-0 items-baseline gap-2">
        <h3 className="text-balance text-lead leading-snug" id={ids.title}>
          {title}
        </h3>
        {/* Hidden until the title is hovered; always there on focus, and on touch, where nothing hovers. */}
        <a
          aria-label={`Link to this figure: ${title}`}
          className="pressable-subtle rounded-sm text-muted-foreground opacity-0 pointer-coarse:opacity-60 transition-opacity duration-150 ease-out focus-visible:opacity-100 group-hover/title:opacity-100"
          href={`#${ids.anchor}`}
        >
          <IconLink aria-hidden className="size-4" />
        </a>
      </div>
    ) : null}
    {aside}
  </div>
)

const Source = ({ href, label }: { href?: null | string; label: string }) => (
  <span className="mt-1 block">
    Source:{' '}
    {href ? (
      <a
        className="underline underline-offset-2"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </a>
    ) : (
      label
    )}
  </span>
)

/** The text alternative and the data view, behind a native `<details>`: no script, and findable in page. */
const Disclosure = ({
  className,
  dataView,
  dataViewLabel,
  ids,
  textAlternative,
}: Pick<FigureFrameProps, 'dataView' | 'dataViewLabel' | 'textAlternative'> & {
  className?: string
  ids: Ids
}) => (
  <details className={cn('figure-data mt-4 text-sm', className)}>
    <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
      <IconChevronRight aria-hidden className="figure-data-chevron size-4" />
      {dataView ? `Description and ${dataViewLabel}` : 'Description'}
    </summary>
    <div className="mt-3 space-y-4">
      <p className="max-w-prose" id={ids.description}>
        {textAlternative}
      </p>
      {dataView}
    </div>
  </details>
)

/**
 * The shell every figure kind shares: one cell on the composition grid holding
 * the header (the title with its anchor, and the kind's aside), the visual,
 * the caption and source, and a disclosure with the text alternative and the
 * data view.
 *
 * Everything a reader or a crawler needs is server HTML here. The visual is
 * labelled by the title and described by the text alternative (`figureIds`),
 * which works while the disclosure is closed: `aria-describedby` reads hidden
 * content.
 */
export const FigureFrame = ({
  aside,
  blockId,
  caption,
  children,
  dataView,
  dataViewLabel = 'data',
  source,
  textAlternative,
  title,
  width,
}: FigureFrameProps) => {
  const ids = figureIds(blockId)
  const place = WIDTH_CLASS[width ?? 'wide']
  return (
    <figure className={cn('min-w-0 scroll-mt-28', place.frame)} id={ids.anchor}>
      {title || aside ? (
        <Header aside={aside} className={place.visual} ids={ids} title={title} />
      ) : null}
      {/* The visual is wrapped so it is one cell of the frame's subgrid: a figure
          kind hands its legend, axis labels and drawing over as siblings. */}
      <div className={cn('min-w-0', place.visual)}>{children}</div>
      {caption || source?.label ? (
        <figcaption className={cn('mt-4 text-muted-foreground text-sm', place.text)}>
          {caption}
          {source?.label ? <Source href={source.href} label={source.label} /> : null}
        </figcaption>
      ) : null}
      <Disclosure
        className={place.text}
        dataView={dataView}
        dataViewLabel={dataViewLabel}
        ids={ids}
        textAlternative={textAlternative}
      />
    </figure>
  )
}
