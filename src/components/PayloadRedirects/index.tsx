import { notFound, redirect } from 'next/navigation'
import type React from 'react'
import type { Page, Post, Redirect } from '@/payload-types'
import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'

interface Props {
  disableNotFound?: boolean
  url: string
}

const getRedirectUrlFromReference = async (
  reference: NonNullable<Redirect['to']>['reference'],
): Promise<string | null> => {
  if (!reference) return null

  const { relationTo, value } = reference
  const collectionPrefix = relationTo !== 'pages' ? `/${relationTo}` : ''

  if (typeof value === 'number') {
    const document = (await getCachedDocument(relationTo, value.toString())()) as Page | Post
    return document?.slug ? `${collectionPrefix}/${document.slug}` : null
  }

  if (typeof value === 'object' && value !== null && 'slug' in value) {
    return `${collectionPrefix}/${(value as { slug: string }).slug}`
  }

  return null
}

const handleRedirect = async (redirectItem: Redirect) => {
  if (redirectItem.to?.url) {
    redirect(redirectItem.to.url)
    return
  }

  if (redirectItem.to?.reference) {
    const redirectUrl = await getRedirectUrlFromReference(redirectItem.to.reference)
    if (redirectUrl) {
      redirect(redirectUrl)
    }
  }
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()
  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    await handleRedirect(redirectItem)
  }

  if (disableNotFound) return null

  notFound()
}
