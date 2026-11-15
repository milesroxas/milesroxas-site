import type { Block, Field, TextFieldSingleValidation } from 'payload'
import { designFields, eyebrowFields, textSizeField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * App download: a heading, a description and install buttons for a desktop
 * app, or, in Repository mode, a link to its GitHub repository with a copyable
 * clone command.
 *
 * Downloads lead with the visitor's own system (decided from the
 * proto-desktop-install picker, "Detected"): one primary button for the
 * platform the browser reports, the others demoted under "other systems". The
 * server renders every platform as an equal button, since pages are cached
 * HTML; the client promotes the visitor's platform after hydration.
 *
 * A platform with no link is left out, so a Mac-only app sets only the Mac
 * links. The file type shown on a button comes from its link's extension.
 *
 * `heading` and `description` are TEXT_KEYS names, so the copy reaches Ask and
 * llms.txt. Links, sizes and notes are not: they are install details, not
 * content.
 */

const httpsUrl: TextFieldSingleValidation = (value) => {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:' ? true : 'Use an https:// link.'
  } catch {
    return 'Enter a full link, starting with https://.'
  }
}

const isDownload = (_: unknown, siblingData: { mode?: string } | undefined) =>
  (siblingData?.mode ?? 'download') === 'download'
const isRepo = (_: unknown, siblingData: { mode?: string } | undefined) =>
  siblingData?.mode === 'repo'

const sizeField = (name: string): Field => ({
  name,
  type: 'text',
  label: 'File size',
  admin: { width: '30%', description: 'e.g. 126 MB' },
})

const urlField = (name: string, label: string, description: string): Field => ({
  name,
  type: 'text',
  label,
  validate: httpsUrl,
  admin: { width: '70%', description },
})

const noteField: Field = {
  name: 'note',
  type: 'text',
  label: 'Install note',
  admin: {
    description:
      'The step after the download, shown under the button and read out once it starts, e.g. "Open the dmg and drag Skill Studio to Applications."',
  },
}

export const AppDownload: Block = {
  slug: 'appDownload',
  admin: { group: BLOCK_GROUPS.forms },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_app_dl`,
  interfaceName: 'AppDownloadBlock',
  labels: { singular: 'App download', plural: 'App downloads' },
  fields: [
    ...eyebrowFields(),
    { name: 'heading', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'One or two sentences under the heading.' },
    },
    {
      name: 'mode',
      type: 'radio',
      required: true,
      defaultValue: () => 'download',
      options: [
        { label: 'Download buttons', value: 'download' },
        { label: 'GitHub repository', value: 'repo' },
      ],
      admin: {
        layout: 'horizontal',
        description:
          'Download buttons install the app on Mac, Windows and Linux. GitHub repository points to the code instead.',
      },
      validate: (value, { siblingData }) => {
        const data = siblingData as {
          mac?: { appleSiliconUrl?: string; intelUrl?: string }
          windows?: { url?: string }
          linux?: { url?: string }
          repoUrl?: string
        }
        if (value === 'repo') return data.repoUrl ? true : 'Add the repository link.'
        const any =
          data.mac?.appleSiliconUrl || data.mac?.intelUrl || data.windows?.url || data.linux?.url
        return any ? true : 'Add at least one download link.'
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        condition: isDownload,
        description: 'Shown beside the description, e.g. 0.15.0. Leave empty to hide it.',
      },
    },
    {
      name: 'mac',
      type: 'group',
      label: 'Mac',
      admin: {
        condition: isDownload,
        description:
          'Set both builds to show an Apple silicon / Intel switch. The visitor’s processor is picked for them when the browser says.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            urlField('appleSiliconUrl', 'Apple silicon link', 'The arm64 .dmg.'),
            sizeField('appleSiliconSize'),
          ],
        },
        {
          type: 'row',
          fields: [urlField('intelUrl', 'Intel link', 'The x64 .dmg.'), sizeField('intelSize')],
        },
        noteField,
      ],
    },
    {
      name: 'windows',
      type: 'group',
      label: 'Windows',
      admin: { condition: isDownload },
      fields: [
        {
          type: 'row',
          fields: [urlField('url', 'Link', 'The .exe or .msi installer.'), sizeField('size')],
        },
        noteField,
      ],
    },
    {
      name: 'linux',
      type: 'group',
      label: 'Linux',
      admin: { condition: isDownload },
      fields: [
        {
          type: 'row',
          fields: [urlField('url', 'Link', 'The .AppImage, .deb or .rpm.'), sizeField('size')],
        },
        noteField,
      ],
    },
    {
      name: 'releasesUrl',
      type: 'text',
      label: 'All releases link',
      validate: httpsUrl,
      admin: {
        condition: isDownload,
        description: 'Optional. Shown as "All releases" under the buttons.',
      },
    },
    {
      name: 'repoUrl',
      type: 'text',
      label: 'Repository link',
      validate: httpsUrl,
      admin: {
        condition: isRepo,
        description: 'e.g. https://github.com/milesroxas/skill-studio',
      },
    },
    {
      name: 'showClone',
      type: 'checkbox',
      label: 'Show clone command',
      defaultValue: true,
      admin: {
        condition: isRepo,
        description: 'A copyable `git clone` line under the button, built from the link.',
      },
    },
    designFields([textSizeField(), themeField()]),
  ],
}
