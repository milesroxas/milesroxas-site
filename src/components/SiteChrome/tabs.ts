import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import type { Header } from '@/payload-types'

/**
 * How the active tab relates to the page: `page` is the tab's own
 * destination, `section` a page under it (a case study under Work).
 */
export type TabCurrent = 'page' | 'section'

/** One page the dock names. Resolved on the server from the Header global. */
export type ChromeTab = {
  href: string
  label: string
  newTab: boolean
}

/**
 * The root is structural, so the code owns it: the dock always starts at
 * Home, and a Header row that also points at `/` is folded into it.
 */
const HOME_TAB: ChromeTab = { href: '/', label: 'Home', newTab: false }

/**
 * The dock's tabs: Home, then the Header global's nav rows in their admin
 * order (Globals › Header). Rows without a destination or a label are
 * skipped, and a destination already named keeps its first tab.
 */
export function resolveChromeTabs(navItems: Header['navItems']): ChromeTab[] {
  const tabs = [HOME_TAB]
  for (const { link } of navItems ?? []) {
    const href = resolveCmsLinkHref(link)
    if (!href || !link.label || tabs.some((tab) => tab.href === href)) continue
    tabs.push({ href, label: link.label, newTab: Boolean(link.newTab) })
  }
  return tabs
}

/** True when `pathname` is `href` itself or a page under it. Home matches only itself. */
const owns = (href: string, pathname: string) =>
  pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

/**
 * The tab that owns a path, or -1: a case study keeps Work selected, a post
 * keeps Posts. The longest matching destination wins, so a nested nav row
 * beats its parent. Paths no tab owns (search, a 404) select nothing.
 */
export function activeTabIndex(tabs: ChromeTab[], pathname: string): number {
  let active = -1
  tabs.forEach((tab, index) => {
    if (owns(tab.href, pathname) && (active === -1 || tab.href.length > tabs[active].href.length))
      active = index
  })
  return active
}

/** Whether `pathname` is the tab's own destination or a page under it. */
export const tabCurrent = (tab: ChromeTab, pathname: string): TabCurrent =>
  tab.href === pathname ? 'page' : 'section'
