import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useRef, useState } from 'react'
import { expect, waitFor } from 'storybook/test'
import { Button } from '@/components/ui/button'
import { ScrollReveal, type ScrollRevealVariant, useRevealSwap } from '.'

const eyebrow = 'font-mono text-xs/4 uppercase tracking-widest text-muted-foreground'

const SECTIONS = [
  {
    eyebrow: 'One system',
    heading: 'Copy fades up a paragraph at a time as it reaches the gate.',
    body: 'Every block on the site enters the same way. Each paragraph, heading and list item fades up half a rem as it rises a tenth of the viewport past the fold, and pieces arriving together cascade.',
  },
  {
    eyebrow: 'Grouped beats',
    heading: 'An eyebrow and its heading land together.',
    body: 'Targets that share a data-reveal-group value start on the same beat, so a label and the heading it introduces read as one moment, and the body follows on the cascade.',
  },
  {
    eyebrow: 'Play once',
    heading: 'Scroll back up and nothing replays.',
    body: 'Each beat plays once. Server HTML stays visible without JavaScript, and reduced motion renders the final state. Use Replay to rebuild the entrance from the top.',
  },
]

/** Copy beside a frame; the frame opens on its own track as one media beat. */
function MediaRow() {
  return (
    <div className="container grid items-center gap-10 py-24 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <p className={eyebrow} data-reveal="" data-reveal-group="media-copy">
          Media track
        </p>
        <h2 className="text-heading-2" data-reveal="" data-reveal-group="media-copy">
          A frame wipes open downward.
        </h2>
      </div>
      <div className="bg-muted aspect-video overflow-hidden" data-reveal="media">
        <div className="from-muted to-accent size-full bg-linear-to-br" />
      </div>
    </div>
  )
}

function RevealPage({ variant }: { variant: ScrollRevealVariant }) {
  const [replayKey, setReplayKey] = useState(0)
  return (
    <>
      <Button
        className="fixed top-4 right-4 z-10"
        onClick={() => {
          window.scrollTo(0, 0)
          setReplayKey((key) => key + 1)
        }}
        size="sm"
        variant="outline"
      >
        Replay
      </Button>
      <ScrollReveal as="div" replayKey={replayKey} variant={variant}>
        {SECTIONS.map((section) => (
          <section
            key={section.heading}
            className="container flex min-h-[80svh] flex-col gap-6 py-24"
          >
            <p className={eyebrow} data-reveal="" data-reveal-group={section.heading}>
              {section.eyebrow}
            </p>
            <h2
              className="text-heading-1 max-w-2xl text-balance"
              data-reveal=""
              data-reveal-group={section.heading}
            >
              {section.heading}
            </h2>
            <p className="text-lead text-muted-foreground max-w-xl" data-reveal="">
              {section.body}
            </p>
          </section>
        ))}
        <MediaRow />
      </ScrollReveal>
    </>
  )
}

/**
 * The site's one scroll entrance (`ScrollReveal`), played over `data-reveal`
 * markers: copy (`data-reveal`) fades up a paragraph at a time, frames
 * (`data-reveal="media"`) wipe open from the top, and a shared
 * `data-reveal-group` starts its targets on one beat. Blocks pick a variant in
 * `src/blocks/shared/reveal-variants.ts`; a chart or diagram is a
 * `data-reveal="stage"` beat that draws itself (see the figure blocks'
 * Entrance stories). Scroll to drive it.
 */
const meta = {
  title: 'Foundation/ScrollReveal',
  component: RevealPage,
  parameters: { layout: 'fullscreen' },
  argTypes: { variant: { control: 'inline-radio', options: ['intro', 'underMedia'] } },
  args: { variant: 'intro' },
} satisfies Meta<typeof RevealPage>

export default meta

type Story = StoryObj<typeof meta>

/** Copy-led blocks: a 0.7s fade-up, 60ms between pieces. */
export const Intro: Story = {}

/** Copy paired with media: a quicker 0.6s text beat and a 1.2s mask wipe on the frame. */
export const UnderMedia: Story = { args: { variant: 'underMedia' } }

const PANELS = [
  {
    title: 'Talk to Miles',
    body: 'A short note is plenty. He replies within three business days.',
  },
  {
    title: 'Sent to Miles',
    body: 'Your message is with Miles. A confirmation is on its way to your inbox, and the reply will come to the address you gave.',
  },
] as const

/**
 * The click-driven swap (`useRevealSwap`), distinct from the entrance:
 * opacity only on `data-swap` targets, the outgoing half sped up, and with
 * `morphHeight` the surface glides to the incoming panel's height. Ask's
 * handoff and the contact page's receipt swap this way.
 */
function SwapCard() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [panel, setPanel] = useState(0)
  const swapTo = useRevealSwap({ rootRef, active: panel, onSwap: setPanel, morphHeight: true })
  const { title, body } = PANELS[panel === 1 ? 1 : 0]
  return (
    <div className="flex w-sm flex-col gap-4">
      <div className="bg-muted overflow-hidden rounded-md p-6" ref={rootRef}>
        <div className="flex flex-col gap-2">
          <h3 className="text-heading-3" data-swap="text">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm" data-swap="text">
            {body}
          </p>
        </div>
      </div>
      <Button className="self-start" onClick={() => swapTo(panel === 0 ? 1 : 0)} variant="outline">
        {panel === 0 ? 'Send' : 'Back'}
      </Button>
    </div>
  )
}

export const PanelSwap: Story = {
  parameters: { layout: 'centered', controls: { disable: true } },
  render: () => <SwapCard />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }))
    await waitFor(
      () => expect(canvas.getByRole('heading', { name: 'Sent to Miles' })).toBeInTheDocument(),
      { timeout: 3000 },
    )
  },
}

const COPY = [
  'The paragraph fades up, and once it has landed the copy belongs to React again.',
  'Edited after the entrance, the paragraph shows the new words once, never beside the old ones.',
] as const

/** Copy React re-renders after its entrance has landed. */
function EditedCopy() {
  const [version, setVersion] = useState(0)
  return (
    <div className="flex w-sm flex-col gap-4">
      <ScrollReveal as="div">
        {/* Mixed children, like rich text: React updates the text node it rendered, not the paragraph. */}
        <p className="text-lead" data-reveal="" data-testid="copy">
          {COPY[version]} <em>Thank you.</em>
        </p>
      </ScrollReveal>
      <Button className="self-start" onClick={() => setVersion(1)} variant="outline">
        Edit
      </Button>
    </div>
  )
}

/** The entrance never rewrites React's nodes, so a re-render after it updates what is on screen. */
export const EditedAfterEntrance: Story = {
  parameters: { layout: 'centered', controls: { disable: true } },
  render: () => <EditedCopy />,
  play: async ({ canvas, userEvent }) => {
    const copy = canvas.getByTestId('copy')
    await waitFor(() => expect(copy.dataset.revealState).toBe('done'), { timeout: 4000 })
    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(copy.textContent).toBe(`${COPY[1]} Thank you.`))
  },
}
