import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/features/members/forms'
import { MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS } from '@/features/members/paths'

export const metadata: Metadata = { title: 'Choose a new password' }

type Args = { searchParams: Promise<{ token?: string }> }

export default async function ResetPasswordPage({ searchParams }: Args) {
  const { token } = await searchParams

  if (!token) {
    return (
      <MembersShell
        lead={
          <>
            This page opens from the link in a reset email.{' '}
            <Link className={memberLink} href={MEMBERS_PATHS.forgotPassword}>
              Ask for one
            </Link>
            .
          </>
        }
        title="Choose a new password"
      />
    )
  }

  return (
    <MembersShell lead="You will be signed in once it is saved." title="Choose a new password">
      <ResetPasswordForm token={token} />
    </MembersShell>
  )
}
