import { Header } from '@/Header/Component'

export const SiteFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute top-0 right-0 left-0 z-50 h-4 bg-white md:h-[40px]"></div>
        <div className="absolute top-0 right-0 bottom-0 z-50 w-4 bg-white md:w-[40px]"></div>
        <div className="absolute right-0 bottom-0 left-0 z-50 h-4 bg-white md:h-[40px]"></div>
        <div className="absolute top-0 bottom-0 left-0 z-50 w-4 bg-white md:w-[40px]"></div>
      </div>
      <div className="min-h-screen p-4 md:p-[40px]">
        <Header />
        {children}
      </div>
    </div>
  )
}
