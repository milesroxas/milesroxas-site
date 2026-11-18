import type React from 'react'
import { ordinalLabel } from '@/blocks/shared/numbering'
import { Section } from '@/blocks/shared/section'
import { typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import type { StepListBlock as StepListBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type StepListBlockProps = Pick<StepListBlockData, 'blockType' | 'steps' | 'textSize' | 'theme'> & {
  bare?: boolean
}

/**
 * A step's title takes the `title` rung (30px at Small), as drawn, so a short
 * verb holds the foot of a tall card. The steps share one row at equal widths (`auto-cols-fr`), so three steps
 * take thirds of the page column, which eight columns cannot. Below `md` they
 * stack. Each card is one reveal beat of the row.
 */
export const StepListBlock: React.FC<StepListBlockProps> = ({ bare, steps, textSize, theme }) => {
  const items = steps ?? []
  if (items.length === 0) return null
  const type = typeScale(textSize)

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <ol className="gap-grid grid grid-cols-1 md:auto-cols-fr md:grid-flow-col">
          {items.map((step, index) => (
            <li
              className="border-foreground flex min-h-56 flex-col justify-between gap-10 border p-5 md:min-h-80"
              data-reveal
              data-reveal-group="steps"
              key={step.id ?? index}
            >
              <span className="text-muted-foreground text-xs/none font-mono tracking-widest tabular-nums">
                {ordinalLabel(index)}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className={type.title}>{step.title}</h3>
                {/* Two lines tall at least, so titles line up across the row. */}
                <p
                  className={cn(
                    'text-muted-foreground text-sm md:min-h-[2lh]',
                    textSize === 'large' && 'text-base',
                  )}
                >
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
