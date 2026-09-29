import { resolveAskHandoffTerms } from '@/features/ask/handoff'
import type { Header, SiteInfo } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { SiteChromeClient } from './SiteChromeClient'
import { resolveChromeTabs } from './tabs'

/**
 * The site chrome, resolved on the server from the two globals that own it:
 * Header (the dock's pages, in admin order) and Site Info (whether Ask is on,
 * its suggested questions, and the reply promise its handoff makes).
 */
export async function SiteChrome() {
  const [header, siteInfo] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<Header>,
    getCachedGlobal('site-info', 1)() as Promise<SiteInfo>,
  ])

  const ask = siteInfo?.ask?.hidden
    ? null
    : {
        suggestions: (siteInfo?.ask?.suggestions ?? []).map(({ question }) => question),
        terms: resolveAskHandoffTerms(siteInfo),
      }

  return <SiteChromeClient ask={ask} tabs={resolveChromeTabs(header?.navItems)} />
}
