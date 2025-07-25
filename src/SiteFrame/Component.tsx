import { SiteFrameClient } from './SiteFrameClient'

export const SiteFrame = ({ children }: { children: React.ReactNode }) => {
  return <SiteFrameClient>{children}</SiteFrameClient>
}
