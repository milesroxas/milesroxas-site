import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/members/forms'
import { MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS, safeNext, withNext } from '@/features/members/paths'

export const metadata: Metadata = { title: 'Reset your password' }

type Args = { searchParams: Promise<{ next?: string }> }

export default async function ForgotPasswordPage({ searchParams }: Args) {
  const next = safeNext((await searchParams).next)

  return (
    <MembersShell
      footer={
        <>
          Remembered it?{' '}
          <Link className={memberLink} href={withNext(MEMBERS_PATHS.signIn, next)}>
            Sign in
          </Link>
        </>
      }
      lead="Enter the email you joined with and we will send a link to choose a new password."
      title="Reset your password"
    >
      <ForgotPasswordForm />
    </MembersShell>
  )
}
