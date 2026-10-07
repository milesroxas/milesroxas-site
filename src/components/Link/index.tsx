import Link from 'next/link'
import type React from 'react'
import { Button, type ButtonProps } from '@/components/ui/legacy-button'
import type { Page, Post } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type IndexPage, resolveCmsLinkHref } from './resolve-href'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  indexPage?: IndexPage | null
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | 'index' | null
  url?: string | null
  onClick?: (href: string) => void
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    indexPage,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    onClick,
  } = props

  const href = resolveCmsLinkHref({ type, indexPage, reference, url })

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  const handleClick = onClick
    ? (e: React.MouseEvent) => {
        e.preventDefault()
        onClick(href)
      }
    : undefined

  const link = (
    <Link className={cn(className)} href={href} {...newTabProps} onClick={handleClick}>
      {label}
      {children}
    </Link>
  )

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') return link

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      {link}
    </Button>
  )
}
