import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/features/members/forms'
import { MembersNotice, MembersShell, memberLink } from '@/features/members/MembersShell'
import { MEMBERS_PATHS, safeNext, withNext } from '@/features/members/paths'
import { getMember } from '@/features/members/session'

export const metadata: Metadata = { title: 'Sign in' }

type Args = { searchParams: Promise<{ next?: string; verified?: string }> }

export default async function SignInPage({ searchParams }: Args) {
  const { next: requested, verified } = await searchParams
  const next = safeNext(requested)
  if (await getMember()) redirect(next)

  return (
    <MembersShell
      footer={
        <>
          New here?{' '}
          <Link className={memberLink} href={withNext(MEMBERS_PATHS.join, next)}>
            Create an account
          </Link>
        </>
      }
      lead="Members read posts and case studies that are not on the public site."
      title="Sign in"
    >
      {verified && <MembersNotice>Email confirmed. Sign in to continue.</MembersNotice>}
      <SignInForm next={next} />
    </MembersShell>
  )
}
