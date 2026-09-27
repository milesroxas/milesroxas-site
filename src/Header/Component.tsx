import type { Header as HeaderType, SiteInfo } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './Component.client'

export async function Header() {
  const [headerData, siteInfo] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<HeaderType>,
    getCachedGlobal('site-info', 0)() as Promise<SiteInfo>,
  ])

  // Site Info › Ask › Hide Ask takes the menu's Ask entry off with the page.
  return <HeaderClient askHidden={Boolean(siteInfo?.ask?.hidden)} data={headerData} />
}
