'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo/Logo'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="fixed top-16 right-16 z-50">
          <span className="bg-background/40 flex h-auto items-center justify-center rounded-sm px-5 py-1 font-medium tracking-[0.25em] text-slate-800 uppercase backdrop-blur-sm hover:bg-green-50 hover:text-green-900">
            Menu
          </span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="bg-background fixed inset-0 h-full w-full max-w-none rounded-none border-0 p-0"
        style={{ top: 0, left: 0, transform: 'none' }}
      >
        <DialogHeader>
          <DialogTitle>
            <Logo />
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col items-center justify-center">
          <nav className="flex w-full flex-col items-center justify-between gap-3">
            {navItems.map(({ link }, i) => (
              <CMSLink key={i} {...link} appearance="inline" className="text-primary text-4xl" />
            ))}
            <Link href="/search">
              <span className="sr-only">Search</span>
              <SearchIcon className="text-primary w-5" />
            </Link>
          </nav>
        </div>
        <DialogFooter>
          <Button>Submit</Button>
          <Button asChild variant="outline">
            <button type="button">Cancel</button>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
