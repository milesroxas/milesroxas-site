import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS } from '@/features/members/paths'

export const metadata: Metadata = { title: 'Confirm your email' }

type Args = { searchParams: Promise<{ token?: string }> }

/**
 * The link in the welcome email. A good token confirms the address and goes on
 * to sign in; a used or unknown one says so, with the way forward.
 */
export default async function VerifyPage({ searchParams }: Args) {
  const { token } = await searchParams

  if (token) {
    const payload = await getPayload({ config: configPromise })
    const verified = await payload
      .verifyEmail({ collection: 'members', token })
      .then(() => true)
      .catch(() => false)
    if (verified) redirect(`${MEMBERS_PATHS.signIn}?verified=1`)
  }

  return (
    <MembersShell
      lead={
        <>
          This link was already used or is not valid. If you confirmed your email before,{' '}
          <Link className={memberLink} href={MEMBERS_PATHS.signIn}>
            sign in
          </Link>
          . If not,{' '}
          <Link className={memberLink} href={MEMBERS_PATHS.forgotPassword}>
            reset your password
          </Link>{' '}
          and that confirms it too.
        </>
      }
      title="That link did not work"
    />
  )
}
