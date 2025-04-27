import BottomSection from './BottomSection/Component'

export const SiteFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <div id="site-frame" className="pointer-events-none fixed inset-0 z-50">
        <div className="frame-bar frame-bar-horizontal fixed top-0 right-0 left-0 h-4 bg-white md:h-[40px]" />
        <div className="frame-bar frame-bar-vertical fixed top-0 right-0 bottom-0 w-4 bg-white md:w-[40px]" />
        <div className="frame-bar frame-bar-horizontal fixed right-0 bottom-0 left-0 h-4 bg-white md:h-[40px]" />
        <div className="frame-bar frame-bar-vertical fixed top-0 bottom-0 left-0 w-4 bg-white md:w-[40px]" />
      </div>
      <div className="min-h-screen p-4 md:p-[40px]">
        <BottomSection />
        {children}
      </div>
    </div>
  )
}
