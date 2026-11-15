import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { AppDownloadBlock } from './Component'

const release = 'https://github.com/milesroxas/skill-studio/releases/latest/download/'

const controls = blockControls<typeof AppDownloadBlock>('appDownload')

/** Skill Studio 0.15.0, the real release: two Mac builds, an unsigned Windows installer, an AppImage. */
const meta = {
  title: 'Blocks/FormsAndCTAs/AppDownload',
  component: AppDownloadBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'appDownload',
    eyebrow: 'Install',
    heading: 'Download Skill Studio',
    description:
      'Free under the MIT license. Install it once and the app updates itself after that.',
    mode: 'download',
    version: '0.15.0',
    mac: {
      appleSiliconUrl: `${release}skill-studio-mac-arm64.dmg`,
      appleSiliconSize: '126 MB',
      intelUrl: `${release}skill-studio-mac-x64.dmg`,
      intelSize: '133 MB',
      note: 'Open the dmg and drag Skill Studio to Applications.',
    },
    windows: {
      url: `${release}skill-studio-win-x64.exe`,
      size: '126 MB',
      note: 'Windows warns before it runs the installer: choose More info, then Run anyway.',
    },
    linux: {
      url: `${release}skill-studio-linux-x86_64.AppImage`,
      size: '132 MB',
      note: 'Make the AppImage executable with chmod +x, then run it.',
    },
    releasesUrl: 'https://github.com/milesroxas/skill-studio/releases',
    repoUrl: 'https://github.com/milesroxas/skill-studio',
    showClone: true,
  },
} satisfies Meta<typeof AppDownloadBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The visitor's system leads; the other two sit under "other systems". */
export const Default: Story = {}

/** A Mac-only app: one platform, no "other systems" row. */
export const MacOnly: Story = {
  args: { windows: {}, linux: {} },
}

/** Repository mode: the GitHub link and a copyable clone line. */
export const Repository: Story = {
  args: {
    eyebrow: 'Source',
    heading: 'Build from source',
    description: 'The code is on GitHub under the MIT license. It needs Node 24 or later and pnpm.',
    mode: 'repo',
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}
