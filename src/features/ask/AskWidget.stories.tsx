import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'
import { AskWidget } from './AskWidget'
import {
  askHandoffChat,
  askHandoffFixture,
  askHandoffTermsFixture,
  askSourcesFixture,
  createAskChat,
} from './fixtures'
import { askSwapSettled, openAskHandoff, sendAskHandoff, stubInquiryIntake } from './storyPlays'

/**
 * The /ask page's surface. The dock's Ask panel renders the same transcript
 * (`TranscriptItems`) but lives in the site chrome, so it is not storied here.
 *
 * All stories drive the real `useChat` lifecycle through a scripted transport
 * (vendored @shadcn/helpers ai-sdk): no /api/ask route, network, or API key.
 * Type a question (3+ characters) and submit to play the next scripted reply.
 */
const meta = {
  title: 'Features/AskWidget',
  component: AskWidget,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-lg">
        <Story />
      </div>
    ),
  ],
  args: { terms: askHandoffTermsFixture },
} satisfies Meta<typeof AskWidget>

export default meta

type Story = StoryObj<typeof meta>

const CRAFT_AND_CODE = {
  sourceId: '/works/craft-and-code-for-an-evolving-agency',
  title: 'Craft and Code for an Evolving Agency',
  url: '/works/craft-and-code-for-an-evolving-agency',
}

const FOURTEEN_BRANCHES = {
  sourceId: '/posts/fourteen-branches-one-afternoon-how-i-work-in-parallel-as-a-solo-engineer',
  title: 'Fourteen branches, one afternoon: how I work in parallel as a solo engineer',
  url: '/posts/fourteen-branches-one-afternoon-how-i-work-in-parallel-as-a-solo-engineer',
}

/**
 * Assistant-only script: whatever the user types, the next scripted reply
 * streams back (sources first, then the grounded answer), mirroring what
 * /api/ask emits. The sleep between them is the real retrieval-to-first-token
 * gap: the shimmer must hold through it and the sources land after the answer.
 * The third reply is a pricing question's: the handoff card with no text.
 */
const scriptedAnswers = createAskChat()
  .assistant(({ writer }) => {
    writer
      .sourceUrl(CRAFT_AND_CODE)
      .sourceUrl({
        sourceId: '/posts/building-a-shader-studio-in-payload-cms',
        title: 'Building a shader studio in Payload CMS',
        url: '/posts/building-a-shader-studio-in-payload-cms',
      })
      .sleep(1_200)
      .text(
        'Miles designs and builds content-driven sites on Payload CMS. "Craft and Code for an Evolving Agency" covers the Suits & Sandals site, built so one content source serves the website, custom tools and AI features, and "Building a shader studio in Payload CMS" walks through a plugin that lets editors tune a GPU shader and publish it like an image.',
      )
  })
  .assistant(({ writer }) => {
    writer
      .sourceUrl(FOURTEEN_BRANCHES)
      .text(
        'He runs several tasks at once, each in its own worktree with its own port and database. "Fourteen branches, one afternoon" describes that setup in detail.',
      )
  })
  .assistant(({ writer }) => {
    writer.sleep(800).tool('handoff', {
      input: { reason: 'estimate' },
      output: askHandoffFixture('estimate'),
    })
  })

export const Default: Story = {
  args: {
    transport: scriptedAnswers.transport({
      fallback: 'That is the end of this scripted demo. Reload the story to start over.',
    }),
  },
}

/** Transcript seeded to its final state: the answered UI, sources collapsed. */
const answeredChat = createAskChat()
  .user('What kind of work does Miles do?')
  .assistant(({ writer }) => {
    writer
      .sourceUrl(CRAFT_AND_CODE)
      .text(
        'Miles designs and builds websites and the systems behind them. "Craft and Code for an Evolving Agency" covers the Suits & Sandals site, designed and built on Payload CMS so one content source serves the website, custom tools and AI features.',
      )
  })

export const Answered: Story = {
  args: {
    transport: answeredChat.transport(),
    initialMessages: answeredChat.get(),
  },
}

/** The sources disclosure opened: inset rows, one per page, on the shared disclosure track. */
const sourcesChat = createAskChat()
  .user('Has Miles built systems that several teams share?')
  .assistant(({ writer }) => {
    for (const source of askSourcesFixture) writer.sourceUrl(source)
    writer.text(
      'Yes. For NextStreet he built one design system that supports multiple products and teams, and the Suits & Sandals CMS moved to Payload so one record feeds the site, Ask and agents.',
    )
  })

export const SourcesOpen: Story = {
  args: {
    transport: sourcesChat.transport(),
    initialMessages: sourcesChat.get(),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /sources/i }))
  },
}

/**
 * A pricing question: nothing to publish, so the handoff is the whole reply.
 * The reason's lead line lands as the assistant's words, the offer a beat
 * after it.
 */
export const Handoff: Story = {
  args: {
    transport: askHandoffChat.transport(),
    initialMessages: askHandoffChat.get(),
  },
}

/** Thumbs down opens one more question in the same row; a pick closes it with the thumb filled. */
export const RatedDown: Story = {
  args: Answered.args,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Not helpful' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Incomplete' }))
  },
}

/** The offer opened: the row becomes the form in place. Send stays off until both fields hold something. */
export const HandoffForm: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  play: openAskHandoff,
}

/** Cancel puts the form back to the offer row, and keyboard focus back on the chip that opened it. */
export const HandoffCancelled: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  play: async (context) => {
    await openAskHandoff(context)
    await context.userEvent.click(context.canvas.getByRole('button', { name: 'Cancel' }))
    await waitFor(
      () =>
        expect(context.canvas.getByRole('button', { name: 'Talk to Miles' })).toBeInTheDocument(),
      { timeout: 3000 },
    )
    await waitFor(() => expect(context.canvas.queryByLabelText('Name')).not.toBeInTheDocument())
  },
}

/** The visitor already wrote their address: the form lands open with it filled, marked "From your message". */
const handoffEmailChat = createAskChat()
  .user("Can you send me a quote? I'm at jordan@northwind.co")
  .assistant(({ writer }) => {
    writer.tool('handoff', {
      input: { reason: 'contact_details' },
      output: askHandoffFixture('contact_details'),
    })
  })

export const HandoffFromMessage: Story = {
  args: {
    transport: handoffEmailChat.transport(),
    initialMessages: handoffEmailChat.get(),
  },
}

/** A malformed address is caught before anything is posted, in the endpoint's own words. */
export const HandoffInvalidEmail: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  play: async (context) => {
    await openAskHandoff(context)
    await context.userEvent.type(context.canvas.getByLabelText('Name'), 'Jordan Lee')
    await context.userEvent.type(context.canvas.getByLabelText('Email'), 'jordan@northwind')
    await context.userEvent.click(context.canvas.getByRole('button', { name: 'Send to Miles' }))
  },
}

/**
 * Sent: the intake is stubbed to answer like /api/inquiries/submit, and the
 * form becomes its receipt in place.
 */
export const HandoffSent: Story = {
  args: Handoff.args,
  parameters: askSwapSettled,
  beforeEach: () => stubInquiryIntake(),
  play: async (context) => {
    await openAskHandoff(context)
    await sendAskHandoff(context, { name: 'Jordan Lee', email: 'jordan@northwind.co' })
  },
}

/** A partial answer: what the site says, its sources, then the offer for the rest. */
const partialChat = createAskChat()
  .user('How do we start, and what would it cost?')
  .assistant(({ writer }) => {
    for (const source of askSourcesFixture) writer.sourceUrl(source)
    writer
      .text(
        'Most projects start with a short call about goals, timeline and budget. The case studies show how earlier projects were scoped, from a design system for several teams to a CMS move.',
      )
      .tool('handoff', { input: { reason: 'estimate' }, output: askHandoffFixture('estimate') })
  })

export const PartialAnswerHandoff: Story = {
  args: {
    transport: partialChat.transport(),
    initialMessages: partialChat.get(),
  },
}

/**
 * A question about a work page whose case study is still being written: the
 * kinds of work from the record's brief, then the offer that says the story
 * is on its way and that Miles can walk through it.
 */
const thinCaseStudyChat = createAskChat()
  .user('What did you do for them?')
  .assistant(({ writer }) => {
    writer
      .sourceUrl({
        sourceId: '/works/brand-expression-through-digital-experience',
        title: 'Brand Expression Through Digital Experience',
        url: '/works/brand-expression-through-digital-experience',
      })
      .text(
        'For GentleBeast, an on-demand puppy training service, Miles designed and built a website that turns the brand narrative into a clear, conversion-ready experience.',
      )
      .tool('handoff', { input: { reason: 'case_study' }, output: askHandoffFixture('case_study') })
  })

export const ThinCaseStudyHandoff: Story = {
  args: {
    transport: thinCaseStudyChat.transport(),
    initialMessages: thinCaseStudyChat.get(),
  },
}

/** Retrieval came back empty on a first question: the no-answer lead and offer, no model call. */
const noSourcesChat = createAskChat().assistant(({ writer }) => {
  writer.tool('handoff', { input: { reason: 'no_answer' }, output: askHandoffFixture('no_answer') })
})

export const NoSources: Story = {
  args: {
    transport: noSourcesChat.transport(),
  },
}

/**
 * A reply that settled with nothing to read (a tool call the schema refused,
 * an answer cut to nothing): no bubble, but the quiet offer still closes it,
 * so there is always a way forward.
 */
const emptyReplyChat = createAskChat()
  .user('How does Miles run a project?')
  .assistant(({ writer }) => {
    writer.sourceUrl(FOURTEEN_BRANCHES)
  })

export const EmptyReply: Story = {
  args: {
    transport: emptyReplyChat.transport(),
    initialMessages: emptyReplyChat.get(),
  },
}

/**
 * Sources in, first token still far off: pins the state /api/ask spends
 * retrieval-to-first-token in. Must read as Thinking (no empty bubble, no
 * source list) with the composer's button as Stop.
 */
const sourcesOnlyChat = createAskChat().assistant(({ writer }) => {
  writer.sourceUrl(FOURTEEN_BRANCHES).sleep(300_000).text('This reply never arrives in the demo.')
})

export const AwaitingFirstToken: Story = {
  args: {
    transport: sourcesOnlyChat.transport(),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox'), 'How does Miles run a project?')
    await userEvent.keyboard('{Enter}')
  },
}

/** First chunk delayed far beyond the demo window: pins the shimmer state. */
const slowChat = createAskChat().sleep(300_000).assistant('This reply never arrives in the demo.')

export const Thinking: Story = {
  args: {
    transport: slowChat.transport(),
  },
}

/** Transport streams an error chunk, e.g. the rate limiter pushing back. */
const errorChat = createAskChat().error('Too many questions, try again in a minute.')

export const ErrorState: Story = {
  args: {
    transport: errorChat.transport(),
  },
}
