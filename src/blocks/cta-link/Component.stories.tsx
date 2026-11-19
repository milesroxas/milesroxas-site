import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { streamVideoFixture } from '@/stories/fixtures'
import { streamPosterUrl } from '@/utilities/streamPoster'
import type { CtaTarget } from './look'
import { CtaLinkView } from './View'

/**
 * Resolved targets, as the server block hands them to the looks. The longest
 * real titles on purpose: they are the ones that break a layout.
 */
const TARGETS: Record<CtaTarget['kind'], CtaTarget> = {
  work: {
    kind: 'work',
    label: 'case study',
    code: 'MR–16–W06',
    title: 'Differentiation Through Immersive Digital Experience',
    line: "An immersive website with 3D rendering for O'Linn Security Inc., a Palm Springs security firm, built to set its high-tech brand apart from legacy competitors.",
    facts: [
      { label: 'client', value: "O'Linn Security Inc." },
      { label: 'industry', value: 'Security Services' },
      { label: 'scope', value: 'Web, 3D' },
    ],
    action: 'Read the case study',
    href: '/works/differentiation-through-immersive-digital-experience',
    external: false,
    media: {
      kind: 'image',
      src: 'https://imagedelivery.net/mt_LnKhMMDR4a2uNBQuIoA/9d55cc7a-3255-4b0e-4736-7f0a5a2e7700/w=1600,q=85,f=auto',
      width: 3128,
      height: 1672,
    },
  },
  post: {
    kind: 'post',
    label: 'post',
    code: 'P–04',
    title: 'Emotional Architecture: Building Brand Experiences That Stick',
    line: 'Five principles for brand experiences that connect: strategic friction, imperfection, ambiguity, micro-moments and vulnerability over authority.',
    facts: [
      { label: 'published', value: '2025-05-29' },
      { label: 'length', value: '9 min' },
      { label: 'topic', value: 'Brand' },
    ],
    action: 'Read the post',
    href: '/posts/emotional-architecture-building-brand-experiences-that-stick',
    external: false,
  },
  page: {
    kind: 'page',
    label: 'page',
    code: '/about',
    title: 'About Miles Roxas',
    line: 'A designer and engineer who builds brand systems, websites and the tools behind them.',
    facts: [],
    action: 'Open the page',
    href: '/about',
    external: false,
    media: {
      kind: 'video',
      resource: streamVideoFixture,
      poster: streamPosterUrl(streamVideoFixture.cloudflareStreamThumbnailUrl ?? '', 1280),
    },
  },
  external: {
    kind: 'external',
    label: 'external',
    code: 'codalyn.app',
    title: 'Beacon, a Webflow app for flexible CMS layouts',
    line: 'A custom Webflow app with flexible CMS layouts and built-in image tools that give teams more control over everyday content work.',
    facts: [],
    action: 'Visit codalyn.app',
    href: 'https://codalyn.app/beacon',
    external: true,
  },
}

type StoryArgs = React.ComponentProps<typeof CtaLinkView> & {
  targetType?: CtaTarget['kind']
}

const controls = blockControls<(props: StoryArgs) => null>('ctaLink')

const meta = {
  title: 'Blocks/Forms & CTAs/CtaLink',
  component: CtaLinkView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One call to action to a work, a post, a page or an external link, in three looks on the aim field. Point at it: the reticle locks on each part, Instrument paints the picture or video in, Strip opens its field. A click plays its ripple before the page leaves.',
      },
    },
  },
  argTypes: controls.argTypes,
  args: { ...controls.args, target: TARGETS.work },
  render: ({ targetType, ...args }: StoryArgs) => (
    <div className="py-24">
      <CtaLinkView {...args} target={TARGETS[targetType ?? 'work']} />
    </div>
  ),
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Instrument: Story = { args: { variant: 'instrument' } }

export const Field: Story = { args: { variant: 'field' } }

export const Strip: Story = { args: { variant: 'strip' } }

export const PostWithoutPicture: Story = {
  args: { variant: 'instrument', targetType: 'post' },
}

export const PageWithVideo: Story = {
  args: { variant: 'instrument', targetType: 'page' },
}

export const ExternalLink: Story = { args: { variant: 'strip', targetType: 'external' } }
