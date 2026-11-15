import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName, typeScale } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import type { AppDownloadBlock as AppDownloadData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type Build, DownloadActions, type Platform, RepoActions } from './Component.client'

type AppDownloadBlockProps = Pick<
  AppDownloadData,
  | 'blockType'
  | 'description'
  | 'eyebrow'
  | 'heading'
  | 'linux'
  | 'mac'
  | 'mode'
  | 'releasesUrl'
  | 'repoUrl'
  | 'showClone'
  | 'textSize'
  | 'theme'
  | 'version'
  | 'windows'
> & { bare?: boolean }

const extOf = (url: string) => {
  try {
    const file = new URL(url).pathname.split('/').pop() ?? ''
    return file.includes('.') ? (file.split('.').pop() ?? '').toLowerCase() : 'file'
  } catch {
    return 'file'
  }
}

const build = (
  key: Build['key'],
  label: string,
  url?: string | null,
  size?: string | null,
): Build | null => (url ? { key, label, url, ext: extOf(url), size: size || null } : null)

/**
 * Copy on the left four columns, actions on the right four. Heading and
 * eyebrow share a reveal beat, the description takes the next, the actions
 * land last.
 */
export const AppDownloadBlock: React.FC<AppDownloadBlockProps> = ({
  bare,
  description,
  eyebrow,
  heading,
  linux,
  mac,
  mode,
  releasesUrl,
  repoUrl,
  showClone,
  textSize,
  theme,
  version,
  windows,
}) => {
  const isRepo = mode === 'repo'
  const platforms: Platform[] = [
    {
      id: 'mac' as const,
      name: 'Mac',
      note: mac?.note || null,
      builds: [
        build('arm64', 'Apple silicon', mac?.appleSiliconUrl, mac?.appleSiliconSize),
        build('x64', 'Intel', mac?.intelUrl, mac?.intelSize),
      ],
    },
    {
      id: 'windows' as const,
      name: 'Windows',
      note: windows?.note || null,
      builds: [build('x64', '64-bit', windows?.url, windows?.size)],
    },
    {
      id: 'linux' as const,
      name: 'Linux',
      note: linux?.note || null,
      builds: [build('x64', 'x86-64', linux?.url, linux?.size)],
    },
  ]
    .map((p) => ({ ...p, builds: p.builds.filter((b): b is Build => b !== null) }))
    .filter((p) => p.builds.length > 0)

  if (isRepo ? !repoUrl : platforms.length === 0) return null

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <BlockGrid className="gap-y-12">
          <div className="text-stack md:col-span-4">
            {eyebrow ? (
              <p
                className={cn(eyebrowClassName, 'flex items-center gap-2')}
                data-reveal
                data-reveal-group="heading"
              >
                <span aria-hidden="true" className="bg-border h-px w-4" />
                {eyebrow}
              </p>
            ) : null}
            <h2 className={typeScale(textSize).heading} data-reveal data-reveal-group="heading">
              {heading}
            </h2>
            {description ? (
              <p
                className={cn(typeScale(textSize).body, 'text-muted-foreground max-w-prose')}
                data-reveal
                data-reveal-group="copy"
              >
                {description}
              </p>
            ) : null}
            {!isRepo && version ? (
              <p
                className={cn(eyebrowClassName, 'text-muted-foreground tabular-nums')}
                data-reveal
                data-reveal-group="copy"
              >
                Version {version}
              </p>
            ) : null}
          </div>
          <div className="md:col-span-4 md:col-start-5" data-reveal>
            {isRepo && repoUrl ? (
              <RepoActions repoUrl={repoUrl} showClone={showClone ?? true} />
            ) : (
              <DownloadActions platforms={platforms} releasesUrl={releasesUrl || null} />
            )}
          </div>
        </BlockGrid>
      </Container>
    </Section>
  )
}
